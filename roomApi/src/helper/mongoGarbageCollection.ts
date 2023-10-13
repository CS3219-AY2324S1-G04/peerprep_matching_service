import Config from '../dataStructs/config';
import { queueEntityModel } from '../mongoModels/queueEntity';
import mongoClient from '../service/mongo';

const config = Config.getInstance();
const queueExpiry = config.mongoQueueExpiry;

/**
 * Every queueExpiry milliseconds from when the server begins, it will wipe
 * anybody who has been in the queue for > queueExpiry.
 *
 * As you can tell, this is not a perfect solution as a person can be in the
 * queue for at most 2x queueExpiry time.
 */
export function _deleteQueue() {
  const xSecondsAgo: Date = new Date(Date.now() - queueExpiry);

  // Delete records with timeStamp > thirtySecondsAgo, and lock is false
  queueEntityModel
    .deleteMany({ timeStamp: { $lt: xSecondsAgo } }, (err) => {
      if (err) {
        // This likely means server is down.
        console.error('Error deleting queue:', err);
        throw err;
      }
    })
    .exec();

  setTimeout(_deleteQueue, 30 * 1000);
}

export function _deleteRoom(): never {
  throw new Error('Undefined function');
  const xSecondsAgo: Date = new Date(Date.now() - 60 * 60 * 1000);
  console.log(xSecondsAgo);

  // Delete records with timeStamp > thirtySecondsAgo, and lock is false
  queueEntityModel
    .deleteMany({ timeStamp: { $lt: xSecondsAgo } }, (err) => {
      if (err) {
        // This likely means server is down.
        console.error('Error deleting queue:', err);
        throw err;
      }
    })
    .exec();

  setTimeout(_deleteQueue, 30 * 1000);
}
