/**
 * Used for:
 * - This is what is stored in the "queue".
 *
 * @file Defines {@link queueEntityModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

import Config from '../dataStructs/config';

const config = Config.getInstance();

const socketInfoSchema = new Schema({
  userID: { type: String, unique: true },
  socketID: { type: String },
  expireAt: { type: Date, default: Date.now() + config.mongoQueueExpiry },
});

export interface socketInfo extends Document {
  userID: string;
  socketID: String;
  expireAt: Date;
}

export const socketInfoModel = mongoose.model<socketInfo>(
  'socketInfo',
  socketInfoSchema,
);
