/**
 * Used for:
 * - Given roomID, return information regarding the room.
 * @file Defines {@link roomInfoModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

// If doing this why not just use postgresql for a relational database?
// Schema allows validation rules for fields, such as allowed data types and value ranges.
const roomInfoSchema = new Schema({
  roomID: { type: String, unique: true },
  userID: [String],
  difficulty: String,
  question: String,
  timeStamp: { type: Date, default: Date.now() },
});

// Documents are the basic unit in mongoDB.
// A collection contains documents, and the documents don't need to have the same fields
export interface roomInfo extends Document {
  roomID: string;
  userID: string[];
  difficulty: string;
  question: string;
  timeStamp: Date;
}

export const roomInfoModel = mongoose.model<roomInfo>(
  'RoomInfo',
  roomInfoSchema,
);
