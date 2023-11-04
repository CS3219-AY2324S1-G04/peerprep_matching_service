/**
 * This is to interface with mongoDB's collection.
 * @file Defines {@link queueInfoModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

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
export interface queueInfo extends Document {
  userID: string;
  complexity: string;
  categories: string[];
  language: string;
  expireAt: Date;
}

queueInfoSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Item needed to interface with Mongo
 */
export const queueInfoModel = mongoose.model<queueInfo>(
  'QueueInfo',
  queueInfoSchema,
);
