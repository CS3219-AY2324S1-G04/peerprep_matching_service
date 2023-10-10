/**
 * Used for:
 * - This is what is stored in the "queue".
 *
 * @file Defines {@link queueEntityModel}.
 */
import mongoose, { Document, Schema } from 'mongoose';

const queueEntitySchema = new Schema({
  userID: { type: String, unique: true },
  difficulty: {
    type: String,
    // No enforcement needed if we perform pre-checks, but good to have
    // enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  preferences: [String],
  // Utilizing findonedelete instead to "prevent" race condition
  // lock: { type: Boolean, default: false },
  language: String,
  timeStamp: { type: Date, default: Date.now() },
});

export interface queueEntity extends Document {
  userID: string;
  difficulty: string;
  preferences: string[];
  // lock: Boolean;
  language: string;
  timeStamp: Date;
}

export const queueEntityModel = mongoose.model<queueEntity>(
  'QueueEntity',
  queueEntitySchema,
);
