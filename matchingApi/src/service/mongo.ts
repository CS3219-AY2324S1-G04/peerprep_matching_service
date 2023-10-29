/**
 * @file Defines {@link MongoClient}
 */
import mongoose, { ConnectOptions } from 'mongoose';

import Config from '../dataStructs/config';

/** Represents the connection to a mongo instance. */
export default class mongoClient {

  private connectionString : string;
  private connection!: mongoose.Connection;
  private config: Config;

  /**
   * Connects to a mongodb and instantiates the collection
   */
  public constructor() {
    this.config = Config.get()
    const location = `${this.config.mongoHost}:${this.config.mongoPort}/${this.config.mongoDB}`
    this.connectionString = `mongodb://${this.config.mongoUser}:${this.config.mongoPass}@${location}`;
  }

  /**
   * Connects to a particular mongo at a particular URI
   * @param uri the
   */
  public connect(): void {
    
    mongoose.connect(this.connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 30000,
      // autoReconnect: false, // Disable automatic reconnection
      // idleTimeout: 10000,   // Disconnect after 10 seconds of inactivity
    } as ConnectOptions);

    this.connection = mongoose.connection;

    this.connection.on('error', (error) => {
      if (error.name === 'MongoError') {
        if (error.codeName === 'AuthenticationFailed') {
          throw error(`Authentication failed for ${this.config.mongoHost}:${this.config.mongoPort}. Please check if supplied mongo credentials can access that db`)
        } else {
          throw error('Uncaught MongoError: ', error)
        }
      } else if (error.name == 'MongooseServerSelectionError') {
        throw error(`Unable to connect to ${this.config.mongoHost}:${this.config.mongoPort} within reasonable amount of time.`)
      } else {
        throw error('Uncaught Error: ', error)
      }
    });

    this.connection.once('open', async () => {
      console.log(`Connected to mongodb://<CREDENTIALS>@${this.config.mongoHost}:${this.config.mongoPort}`);
    })
  }
}
