import express from 'express';

import { roomInfoModel } from '../../mongoModels/roomInfo';

const router = express.Router();

/**
 * GET USER IN ROOM
 *
 * RETURN:
 * User is in room
 * 200 { roomID : string }
 *
 * 404
 *
 * System errors:
 * 500
 */
router.get('/:uid/room', async (req, res) => {
  try {
    const room = await roomInfoModel
      .findOne({ userIDs: { $in: [req.params.uid] } })
      .exec();
    if (room) {
      res.status(200).json({
        'room-id': room.roomID,
      });
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

export default router;
