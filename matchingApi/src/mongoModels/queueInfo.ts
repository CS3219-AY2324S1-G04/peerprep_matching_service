/**
 * Used for:
 * - This is what is stored in the "queue".
 *
 * @file Defines {@link queueEntityModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

import Config from '../dataStructs/config';

const config = Config.getInstance();

const queueInfoSchema = new Schema({
  userID: { type: String, unique: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  categories: [String],
  language: String,
  expireAt: { type: Date, default: Date.now() + config.mongoQueueExpiry },
});

export interface queueInfo extends Document {
  userID: string;
  difficulty: string;
  categories: string[];
  language: string;
  expireAt: Date;
}

queueInfoSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const queueInfoModel = mongoose.model<queueInfo>(
  'QueueInfo',
  queueInfoSchema,
);
