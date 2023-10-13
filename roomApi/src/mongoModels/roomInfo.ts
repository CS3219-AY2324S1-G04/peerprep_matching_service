/**
 * Used for:
 * - Given roomID, return information regarding the room.
 * @file Defines {@link roomInfoModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

import Config from '../dataStructs/config';

const config = Config.getInstance();

// If doing this why not just use postgresql for a relational database?
// Schema allows validation rules for fields, such as allowed data types and value ranges.
const roomInfoSchema = new Schema({
  roomID: { type: String, unique: true },
  userIDs: [String],
  title: { type: String, require: true },
  description: { type: String, require: true },
  expireAt: { type: Date, default: Date.now() + config.mongoRoomExpiry },
});

// Documents are the basic unit in mongoDB.
// A collection contains documents, and the documents don't need to have the same fields
export interface roomInfo extends Document {
  roomID: string;
  userIDs: string[];
  title: string;
  description: string;
  expireAt: Date;
}

roomInfoSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// roomInfoSchema.pre('remove', async function (next) {
//   await UserToRoomIndex.deleteMany({ roomInfoId: this._id });
//   next();
// });

export const roomInfoModel = mongoose.model<roomInfo>(
  'RoomInfo',
  roomInfoSchema,
);
