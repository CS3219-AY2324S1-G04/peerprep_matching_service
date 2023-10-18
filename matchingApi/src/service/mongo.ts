/**
 * @file Defines {@link MongoClient}
 */
import mongoose, { ConnectOptions } from 'mongoose';

import Config from '../dataStructs/config';
import { queueInfoModel } from '../mongoModels/queueInfo';

/** Represents the connection to a mongo instance. */
export default class mongoClient {
  /** Singleton */

  private connection: mongoose.Mongoose | null;

  /**
   * Connects to a mongodb and instantiates the collection
   */
  public constructor() {
    const config = Config.getInstance();

    let uri: string = 'mongodb://';
    if (config.mongoUser != '' && config.mongoPass != '') {
      uri += `${config.mongoUser}:${config.mongoPass}@`;
    }
    uri += `${config.mongoHost}:${config.mongoPort}/${config.mongoDB}`;

    console.log(`Attempting to connect to ${uri}`);

    this.connection = null;
    this.connect(uri);

    // Force instantiate tables
    this.initiateCollections();
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
   * Initializes the collection, and then delete the items that were created
   */
  private async initiateCollections(): Promise<void> {
    const userID = { userID: '0' };
    const options = { upsert: true, setDefaultsOnInsert: true };

    const updateFields = {
      difficulty: 'Easy',
      preferences: ['string'],
      language: 'c',
      expireAt: new Date(Date.now() + 60 * 1000 * 60),
    };

    // Insert into DB
    await Promise.all([
      queueInfoModel.updateOne(userID, updateFields, options),
    ]);

    // Delete them because served purpose
    Promise.all([queueInfoModel.deleteOne(userID)]);
  }
}
