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

    this.middleMan(config);
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

    this.app.listen(this.port, () => {
      console.log(`Matching-Service is running on port ${this.port}`);
    });

  }

  private middleMan(config: Config): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    // if (config.isDevEnv) {
      this.enableDevFeatures();
    // }
  }

  private routes(): void {
    this.app.use('/matching-service/queue', newQueue);
  }

  private enableDevFeatures(): void {
    this.app.use(
      cors({
        origin: new RegExp('http://localhost:[0-9]+'),
        credentials: true,
      }),
    );
  }
}
