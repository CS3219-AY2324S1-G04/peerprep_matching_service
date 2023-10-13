/**
 * Used for:
 * - Given userID, return roomID.
 *
 * @file Defines {@link userMatchModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

// If doing this why not just use postgresql for a relational database?
const userMatchSchema = new Schema({
  userID: { type: String, unique: true },
  roomID: String,
  timeStamp: { type: Date, default: Date.now() },
});

export interface userMatch extends Document {
  userID: String;
  roomID: String;
  timeStamp: Date;
}

export const userMatchModel = mongoose.model<userMatch>(
  'Match',
  userMatchSchema,
);
