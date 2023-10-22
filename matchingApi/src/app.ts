/**
 * @file Defines {@link App}
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import http from 'http';

import Config from './dataStructs/config';
import newQueue from './routes/newQueue';
import mongoClient from './service/mongo';
import { Socks } from './service/sockets';

/**
 * This is the server which the front end will talk to.
 */
export default class App {
  private readonly app;

  private port: number;
  private socketPort: number;

  private mongo;

  constructor() {
    const config = Config.getInstance();

    this.app = express();
    this.port = config.expressPort;
    this.socketPort = 4000;

    this.mongo = new mongoClient();

    this.middleMan();
    this.routes();

    // Last item
    this.app.use((req: Request, res: Response) => {
      res.status(404);
      res.send('Not found.');
    });
  }

  /**
   * Starts listening and activates ttl.
   */
  public startServer(): void {
    this.app.listen(this.port, () => {
      console.log(`Matching-Service is running on port ${this.port}`);
    });

    const server = http.createServer(this.app);
    server.listen(this.socketPort, () => {
      console.log(`Socket is running on port ${this.socketPort}`);
    });
    const io = Socks.getInstance(server);
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
