/**
 * This is to interface with mongoDB's collection.
 * @file Defines {@link queueInfoModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from '../dataStructs/config';

const config = Config.get();

const queueInfoSchema = new Schema({
  userID: { type: String, unique: true },
  complexity: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  categories: [String],
  language: String,
  expireAt: {
    type: Date,
    default: new Date(Date.now() + config.mongoQueueExpiry),
  },
});

/**
 * DataType for typescript.
 */
export interface QueueInfo extends Document {
  /**
   * User-ID stored in the datatype.
   */
  userID: string;
  /**
   * Difficulty stored in the datatype.
   */
  complexity: string;
  /**
   * Categories stored in the datatype as an array.
   */
  categories: string[];
  /**
   * Language stored in the datatype.
   */
  language: string;
  /**
   * Expiry date stored in the datatype.
   */
  expireAt: Date;
}

queueInfoSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Item needed to interface with Mongo.
 */
export const queueInfoModel = mongoose.model<QueueInfo>(
  config.mongoCollection,
  queueInfoSchema,
);
