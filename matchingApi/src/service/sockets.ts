import axios from 'axios';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import Config from '../dataStructs/config';
import { queueInfoModel } from '../mongoModels/queueInfo';
import { socketInfoModel } from '../mongoModels/socketInfo';

export class Socks {
  private static config = Config.getInstance();
  private static instance: Server;

  public static getInstance(server?: HttpServer): Server {
    if (server) {
      Socks.setInstance(server);
    }
    return Socks.instance;
  }

  public static setInstance(server: HttpServer): void {
    if (!Socks.instance) {
      Socks.instance = new Server(server);
      Socks.initiate();
    }
  }

  public static otherUserMatch(uid: string) {
    const io = Socks.instance;

    io.in(uid).emit('success', {
      message: 'You are matched',
    });
    io.in(uid).disconnectSockets(true);
  }

  public static initiate() {
    const io = Socks.instance;

    io.use((socket, next) => {
      const { query } = socket.handshake;

      if (query && query['session-token']) {
        next();
      } else {
        socket.emit('error', {
          message: 'Authentication failed: session-token is missing',
        });
        socket.disconnect(true); // Doesn't seem to force disconnect on middleman level
      }
    });

    io.on('connection', async (socket) => {
      const sessionToken = socket.handshake.query['session-token'];
      let userID: string | undefined;

      // Get user-id

      try {
        const url = Socks.config.userServiceURI + '/user-service/user/identity';
        const param = '?session-token=' + sessionToken;
        await axios
          .get(url + param)
          .then((response) => {
            const data = response.data;
            const uid = data['user-id'];
            if (response.data) {
              userID = uid;
            } else {
              socket.emit('error', {
                message: 'Room Service returned HTTP 500',
              });
              socket.disconnect(true);
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              socket.emit('error', {
                message: 'Invalid Session Token',
              });
              socket.disconnect(true);
            } else if (error.response && error.response.status === 500) {
              socket.emit('error', {
                message: 'User Service returned HTTP 500',
              });
              socket.disconnect(true);
            } else {
              console.error(error);
              socket.emit('error', {
                message: 'Queue Service Server Error',
              });
              socket.disconnect(true);
            }
          });
      } catch (error) {
        console.error(error);
        socket.emit('error', {
          message: 'Queue Service Server Error',
        });
        socket.disconnect(true);
      }

      if (userID === undefined) {
        socket.emit('error', {
          message: 'Missing User ID despite receiving  session token',
        });
        socket.disconnect(true);
        return;
      }
      // ^ everything above move to its own function

      try {
        const url =
          Socks.config.roomServiceURI +
          '/room-service/room/user' +
          '/?user-id=' +
          userID;
        const result = await axios.post(url);
        socket.emit('success', {
          message: 'You are already in a room!',
        });
        socket.disconnect(true);
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status != 404) {
              console.error(error);
              socket.emit('error', {
                message: 'Room Service returned an error',
              });
              socket.disconnect(true);
              return;
            }
          }
        }
      }

      // Disconnect
      io.in(userID).emit('error', {
        message: 'Cannot have multiple tabs open!',
      });
      io.in(userID).disconnectSockets(true);
      socket.join(userID);

      // userID
      const inQueue = await queueInfoModel.findOne({ userID: userID }).exec();

      if (inQueue) {
        console.log(inQueue.expireAt.getTime());
        console.log(new Date().getTime());
        const timeTillExpire =
          inQueue.expireAt.getTime() - new Date(Date.now()).getTime();
        console.log('Expires at: ' + timeTillExpire);

        if (timeTillExpire < 0) {
          // TIL: mongo expireAt runs at 1 minute cycles.
          // So not that super accurate
          socket.emit('error', {
            message:
              'Please wait one minute before sending your request again!',
          });
          socket.disconnect();
        }

        setTimeout(() => {
          console.log('User was timed out!');
          socket.emit('timeout', {
            message: 'Time out! Please send your request again!',
          });
          queueInfoModel
            .findOneAndDelete({ _id: inQueue.id }, { useFindAndModify: true })
            .exec();
          socket.disconnect();
        }, timeTillExpire);
      } else {
        socket.emit('error', {
          message: 'Not in queue!',
        });
        socket.disconnect();
      }

      socket.on('disconnect', () => {
        console.log('A user disconnected from the socket');
      });
    });
  }
}
