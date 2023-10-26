/**
 * @file Defines {@link App}
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
// import http from 'http';

import Config from './dataStructs/config';
import newQueue from './routes/newQueue';
import mongoClient from './service/mongo';
// import { Socks } from './service/sockets';
import cors from 'cors';

/**
 * This is the server which the front end will talk to.
 */
export default class App {
  private readonly app;

  private port: number;
  // private socketPort: number;

  private mongo;

  constructor() {
    const config = Config.getInstance();

    this.app = express();
    this.port = config.expressPort;
    // this.socketPort = 4000; // sock to check if should have a specific port for port or not

    this.mongo = new mongoClient();

    this.middleMan();
    this.routes();

    // Last item
    this.app.use((req: Request, res: Response) => {
      res.status(404).send({
        status : 404,
        message : "The url you requested is invalid",
        data : undefined
      });
    });
  }

  /**
   * Starts listening and activates ttl.
   */
  public startServer(): void {
    const corsOptions = {
      origin:new RegExp('http://localhost:[0-9]+'), // Regular expression to match localhost with any port number
      credentials: true,
    };

    this.app.use(cors(corsOptions));

    this.app.listen(this.port, () => {
      console.log(`Matching-Service is running on port ${this.port}`);
    });

    // const server = http.createServer(this.app);
    // server.listen(this.socketPort, () => {
    //   console.log(`Socket is running on port ${this.socketPort}`);
    // });
    // const io = Socks.getInstance(server);
    // createSocket(server);
  }

  private middleMan(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private routes(): void {
    this.app.use('/matching-service/queue', newQueue);
  }
}
