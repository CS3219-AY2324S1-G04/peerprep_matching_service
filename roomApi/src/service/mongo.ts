/**
 * @file Defines {@link MongoClient}
 */
import mongoose, { ConnectOptions } from 'mongoose';

import Config from '../dataStructs/config';
import { roomInfoModel } from '../mongoModels/roomInfo';

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

    // this.broadcastRoomDelete();
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
    const options = { upsert: true, setDefaultsOnInsert: true };

    const updateRoomInfo = {
      userIDs: ['0', '0'],
      expireAt: new Date(new Date().getTime() + 10),
    };

    // Insert into DB
    await Promise.all([
      roomInfoModel.updateOne({ questionID: '1' }, updateRoomInfo, options),
    ]);

    // Delete them because served purpose
    Promise.all([roomInfoModel.deleteOne({ userIDs: { $in: ['0'] } })]);
  }

  // Broadcast Room Delete doesn't work if you scale this up. Imagine 200 room-services monitoring
  // the DB and broadcasting at the same time to MQ for deletion event.
  // In addition this requires using _id as room-id instead of uuid4
  // private async broadcastRoomDelete() {
  //   const changeStream = roomInfoModel.watch();

  //   changeStream.on('change', (changeEvent) => {
  //     if (changeEvent.operationType === 'delete') {
  //       const deletedDocument = changeEvent.documentKey;
  //       // Publish the deletion event to RabbitMQ or handle it as needed
  //       // Example: publishToRabbitMQ(deletedDocument);
  //     }
  //   });
  // }
}
