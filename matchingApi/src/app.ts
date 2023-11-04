/**
 * @file Defines {@link App}
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';

import Config from './dataStructs/config';
import newQueue from './routes/newQueue';
import mongoClient from './service/mongo';

import cors from 'cors';
import questionType from './dataStructs/questionType';
import languageType from './dataStructs/languageType';
import { getJWTKey } from './helper/helper';

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

    getJWTKey();
    this.synchronizeService();
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
    await questionType.update();
    await languageType.update();
  }
}
