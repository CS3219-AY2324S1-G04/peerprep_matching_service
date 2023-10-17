import express from 'express';
import { v4 as uuidV4 } from 'uuid';

import Config from '../../dataStructs/config';
import { roomInfoModel } from '../../mongoModels/roomInfo';

const router = express.Router();
const config = Config.getInstance();

/**
 * GET ROOM INFO
 *
 * Returns:
 * Room exists:
 * HTTP 200
 * json { user : string[], title : string, details: string }
 *
 * Room does not exist:
 * HTTP 404 Room does not exist
 *
 * Other errors:
 * HTTP 500
 */
router.get('/:rid', async (req, res) => {
  try {
    const room = await roomInfoModel.findOne({ roomID: req.params.rid }).exec();
    if (room) {
      res.status(200).json({
        users: room.userIDs,
        'questions-id': room.questionID,
      });
    } else {
      res.status(404).end();
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

/**
 * DELETE ROOM
 *
 * Returns:
 * Room exists and is deleted:
 * HTTP 200
 *
 * Room does not exist:
 * HTTP 404
 *
 * Other errors:
 * HTTP 500
 */
router.delete('/:rid', async (req, res) => {
  try {
    const room = await roomInfoModel
      .findByIdAndDelete({ roomID: req.params.rid })
      .exec();

    if (room) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

/**
 * GET QUERY ROOM ALIVE
 * Returns whether a particular room is alive or not.
 *
 * RETURN
 * If room exists:
 * HTTP 200
 *
 * If room does not exist:
 * HTTP 404
 *
 * Any other errors:
 * HTTP 500
 */
router.get('/:rid/alive', async (req, res) => {
  try {
    const room = await roomInfoModel.findOne({ roomID: req.params.rid }).exec();
    if (room) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

/**
 * PUT EXTEND ROOM LIFESPAN
 *
 * Mongo expires the room after a certain amount of time.
 * This route is to extend it by mongoRoomExpiry miliseconds from now.
 *
 * Returns:
 * Room exists and expiry value is updated.
 * HTTP 200
 *
 * Room does not exist:
 * HTTP 404
 *
 * Other errors:
 * HTTP 500
 */
router.put('/:rid/keep-alive', async (req, res) => {
  try {
    const room = await roomInfoModel
      .findOneAndUpdate(
        { roomID: req.params.rid },
        { $set: { expireAt: new Date(Date.now() + config.mongoRoomExpiry) } },
        { new: true, useFindAndModify: false },
      )
      .exec();

    if (room) {
      res.status(200).end();
    }
    res.status(404).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

export default router;
