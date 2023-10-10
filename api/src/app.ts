/**
 * To migrate main.ts over.
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';

import Config from './dataStructs/config';
import { _deleteQueue } from './helper/mongottl';
import match from './routes/match';
import queue from './routes/queue';
import mongoClient from './service/mongo';

export default class App {
  public readonly app;

  private static readonly config: Config = new Config();
  private static port: number = App.config.expressPort;

  private mongo = mongoClient.getInstance();

  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use('/queue', queue);
    this.app.use('/match', match);

    this.app.get('/', (req: Request, res: Response) => {
      res.send('Hello, Express!');
    });

    // Quickmatch is same as this but no difficulty and language restrict

    // Last item
    this.app.use((req: Request, res: Response) => {
      res.status(404);
      res.send('Not found.');
    });
  }

  public startServer(): void {
    this.app.listen(App.port, () => {
      console.log(`Server is running on port ${App.port}`);
      _deleteQueue();
    });
  }
}
