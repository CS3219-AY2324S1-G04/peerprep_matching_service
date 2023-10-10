import { queueEntityModel } from '../mongoModels/queueEntity';

export function _deleteQueue() {
  const xSecondsAgo: Date = new Date(Date.now() - 30 * 1000);
  console.log(xSecondsAgo);

  // Delete records with timeStamp > thirtySecondsAgo, and lock is false

  queueEntityModel
    .deleteMany({ timeStamp: { $lt: xSecondsAgo } }, (err) => {
      if (err) {
        // console.error('Error deleting records:', err);
        throw err;
      } else {
        // console.log('30 seconds old records deleted successfully.');
      }
    })
    .exec();

  setTimeout(_deleteQueue, 30 * 1000);
}
