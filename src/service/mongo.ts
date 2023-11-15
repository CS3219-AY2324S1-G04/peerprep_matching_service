/**
 * @file Defines {@link MongoClient}.
 */
import mongoose, { ConnectOptions } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from '../dataStructs/config';

/** Represents the connection to a mongo instance. */
export default class MongoClient {
  private _connectionString: string;
  private _connection!: mongoose.Connection;
  private _configuration: Config;

  /**
   * Connects to a mongodb and instantiates the collection.
   */
  public constructor() {
    this._configuration = Config.get();
    this._connectionString = `${this._configuration.mongoURI}`;
  }

  /**
   * Connects to a particular mongo at a particular URI.
   */
  public connect(): void {
    mongoose.connect(this._connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 30000,
      useFindAndModify: false,
    } as ConnectOptions);

    this._connection = mongoose.connection;

    this._connection.on('error', (error) => {
      if (error.name === 'MongoError') {
        if (error.codeName === 'AuthenticationFailed') {
          throw error(
            `Authentication failed. Please check if supplied mongo credentials can access that db`,
          );
        } else {
          throw error('Uncaught MongoError: ', error);
        }
      } else if (error.name == 'MongooseServerSelectionError') {
        throw error(
          `Unable to connect to Mongo Server within reasonable amount of time.`,
        );
      } else {
        throw error('Uncaught Error: ', error);
      }
    });

    this._connection.once('open', async () => {
      console.log(`Connected to Mongo Server!`);
    });
  }
}
