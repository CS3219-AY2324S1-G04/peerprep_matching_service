/**
 * @file Defines {@link App}
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';

import Config from './dataStructs/config';
import service from './routes/service';
import mongoClient from './service/mongo';

/**
 * This is the server which the front end will talk to.
 */
export default class App {
  private readonly app;

  private port: number;

  private mongo;

  constructor() {
    const config = Config.getInstance();

    this.app = express();
    this.port = config.expressPort;

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
      console.log(`Room Service is running on port ${this.port}`);
      this.ttl();
    });
  }

  private middleMan(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private routes(): void {
    this.app.use('/room-service', service);
  }

  private ttl(): void {}
}
