import express from 'express';
import { v4 as uuidV4 } from 'uuid';

import Config from '../dataStructs/config';
import { roomInfoModel } from '../mongoModels/roomInfo';
import room from './room-service/room';
import user from './room-service/user';

const router = express.Router();
const config = Config.getInstance();

/**
 * POST CREATE ROOM
 * Route is for creating room.
 *
 * Here assumes that the items are in the correct order and stuff.
 *
 * EXPECT:
 * {
 * users: string[],
 * question-id: string,
 * }
 *
 * RETURN:
 * Room is created:
 * 200 { roomID : string }
 *
 * System errors: (inclusive of UUID clashing)
 * 500
 */
router.post('/add', async (req, res) => {
  const users = req.body.users;
  const questionID = req.body['question-id'];

  if (!users || !questionID) {
    console.error('Missing users or question id');
    return res.status(400).end();
  }

  const room = new roomInfoModel({
    roomID: uuidV4(),
    userIDs: req.body.users,
    questionID: req.body['question-id'],
    expireAt: new Date(Date.now() + config.mongoRoomExpiry),
  });

  // could be failing due to uuidv4 clashing
  room.save((error, document) => {
    if (error) {
      console.error('Error occurred while saving the room:', error);
      res.status(500).end();
    } else {
      res.status(200).json({
        'room-id': document.roomID,
      });
    }
  });
});

router.use('/room', room);
router.use('/user', user);

export default router;
