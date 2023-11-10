/**
 * @file Defines {@link App}.
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from './dataStructs/config';
import { LanguageType } from './dataStructs/languageType';
// eslint-disable-next-line @typescript-eslint/naming-convention
import QuestionType from './dataStructs/questionType';
import { getJWTKey } from './helper/helper';
import newQueue from './routes/queue';
// eslint-disable-next-line @typescript-eslint/naming-convention
import MongoClient from './service/mongo';

/**
 * This is the server which the front end will talk to.
 */
export default class App {
  private readonly _app;
  private readonly _configuration: Config;
  private _port: number;
  // private socketPort: number;

  private _mongo;

  /**
   * Creates a new App.
   */
  public constructor() {
    this._configuration = Config.get();
    this._app = express();
    this._port = this._configuration.expressPort;
    this._mongo = new MongoClient();
    this._mongo.connect();
  }

  /**
   * Starts listening and activates ttl.
   */
  public startServer(): void {
    this._middleMan(this._configuration);
    this._routes();

    this._app.listen(this._port, () => {
      console.log(`Matching-Service is running on port ${this._port}`);
    });

    getJWTKey();
    this._synchronizeService();
  }

  private _middleMan(config: Config): void {
    this._app.use(bodyParser.json());
    this._app.use(cookieParser());

    if (config.isDevEnv) {
      this._enableDevFeatures();
    }
  }

  private _routes(): void {
    this._app.use('/matching-service/queue', newQueue);

    // Last item
    this._app.use((req: Request, res: Response) => {
      res.status(404).send({
        message: 'The url you requested is invalid',
        data: undefined,
      });
    });
  }

  private _enableDevFeatures(): void {
    this._app.use(
      cors({
        origin: new RegExp('http://localhost:[0-9]+'),
        credentials: true,
      }),
    );
  }

  private async _synchronizeService(): Promise<void> {
    await QuestionType.update();
    await LanguageType.update();
  }
}
