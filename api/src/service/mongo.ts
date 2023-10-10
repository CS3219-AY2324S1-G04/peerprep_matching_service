/**
 * @file Defines {@link MongoClient}
 */
import mongoose, { ConnectOptions } from 'mongoose';

import Config from '../dataStructs/config';
import { queueEntityModel } from '../mongoModels/queueEntity';
import { roomInfoModel } from '../mongoModels/roomInfo';
import { userMatchModel } from '../mongoModels/userMatch';

/** Represents the connection to a mongo instance. */
export default class mongoClient {
  /** Singleton */
  private static instance: mongoClient;

  private connection: mongoose.Mongoose | null;

  private static readonly config: Config = new Config();

  /**
   * Connects to a mongodb and instantiates the collection
   */
  private constructor() {
    let uri: string = 'mongodb://';
    if (
      mongoClient.config.mongoUser != '' &&
      mongoClient.config.mongoPass != ''
    ) {
      uri += `${mongoClient.config.mongoUser}:${mongoClient.config.mongoPass}@`;
    }
    uri += `${mongoClient.config.mongoHost}:${mongoClient.config.mongoPort}/${mongoClient.config.mongoDB}`;

    console.log(`Attempting to connect to ${uri}`);

    this.connection = null;
    this.connect(uri);

    // Force instantiate tables
    this.initiateCollections();
  }

  /**
   * @returns The mongo db connection.
   */
  public static getInstance(): mongoClient {
    if (!mongoClient.instance) {
      mongoClient.instance = new mongoClient();
    }
    return mongoClient.instance;
  }

  /**
   * Connects to a particular mongo at a particular URI
   * @param uri the
   */

  private async connect(uri: string): Promise<void> {
    this.connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 5000,
    } as ConnectOptions);
  }

  /**
   * Initializes the collection
   */
  private async initiateCollections(): Promise<void> {
    const userID = { userID: '0' };
    const options = { upsert: true, setDefaultsOnInsert: true };

    const updateFields = {
      roomID: '0',
      timeStamp: new Date(new Date().getTime() - 1000 * 60 * 60),
    };

    const updateFieldsPref = {
      difficulty: 'easy',
      preferences: [],
      language: 'c',
      timeStamp: new Date(new Date().getTime() - 1000 * 60 * 60),
    };

    const updateRoomInfo = {
      userID: ['0', '0'],
      difficulty: 'easy',
      question: 'String',
      timeStamp: new Date(new Date().getTime() - 1000 * 60 * 60),
    };

    // Insert into DB
    await Promise.all([
      queueEntityModel.updateOne(userID, updateFieldsPref, options),
      userMatchModel.updateOne(userID, updateFields, options),
      roomInfoModel.updateOne({ roomID: '0' }, updateRoomInfo, options),
    ]);

    // Delete them because served purpose
    await Promise.all([
      queueEntityModel.deleteOne(userID),
      userMatchModel.deleteOne(userID),
      roomInfoModel.deleteOne({ roomID: '0' }),
    ]);
  }
}
