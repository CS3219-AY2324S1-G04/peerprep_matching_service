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
import questionType from './dataStructs/questionType';
import languageType from './dataStructs/languageType';

/**
 * This is the server which the front end will talk to.
 */
export default class App {
  
  private readonly app;
  private readonly config :Config;
  private port: number;
  // private socketPort: number;

  private mongo;

  constructor() {
    this.config = Config.get();
    this.app = express();
    this.port = this.config.expressPort;
    // this.socketPort = 4000; // sock to check if should have a specific port for port or not
    this.mongo = new mongoClient();
    this.mongo.connect()
  }

  /**
   * Starts listening and activates ttl.
   */
  public startServer(): void {
    
    this.middleMan(this.config);
    this.routes();

    this.app.listen(this.port, () => {
      console.log(`Matching-Service is running on port ${this.port}`);
    });
  }

  private middleMan(config: Config): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());

    if (config.isDevEnv) {
      this.enableDevFeatures();
    }
  }

  private routes(): void {
    this.app.use('/matching-service/queue', newQueue);

    // Last item
    this.app.use((req: Request, res: Response) => {
      res.status(404).send({
        status : 404,
        message : "The url you requested is invalid",
        data : undefined
      });
    });

  }

  private enableDevFeatures(): void {
    this.app.use(
      cors({
        origin: new RegExp('http://localhost:[0-9]+'),
        credentials: true,
      }),
    );
  }

  private async synchronizeService(): Promise<void> {
    await (new questionType).update();
    await (new languageType).update();
  }
}
