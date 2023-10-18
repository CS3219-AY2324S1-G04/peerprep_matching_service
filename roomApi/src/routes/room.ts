import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';

import Config from '../dataStructs/config';
import { isValidSessionCookie, isValidSessionParam } from '../helper/session';
import { roomInfoModel } from '../mongoModels/roomInfo';
import user from './room/user';

const router = express.Router();
const config = Config.getInstance();

router.use('/user', user);

/**
 * GET ROOM INFO
 *
 * Returns:
 * Room exists:
 * HTTP 200
 * json { 'room-id' : string, users : string[], 'question-id' : string, expire-at: date }
 *
 * Room does not exist:
 * HTTP 404 Room does not exist
 *
 * Other errors:
 * HTTP 500
 */
router.get('/:rid/info', async (req, res) => {
  try {
    const room = await roomInfoModel.findOne({ roomID: req.params.rid }).exec();
    if (room) {
      res.status(200).json({
        'room-id': room.roomID,
        users: room.userIDs,
        'questions-id': room.questionID,
        'expire-at': room.expireAt,
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
 * GET ROOM ALIVE
 *
 * Returns:
 * Room exists:
 * HTTP 200
 *
 * Room does not exist:
 * HTTP 404 Room does not exist
 *
 * Other errors:
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

// TODO: Convert to event driven, so listen for create event
// TODO: Convert to event driven, so broadcast for create event
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
 * 200 { 'room-id' : string }
 *
 * System errors: (inclusive of UUID clashing)
 * 500
 */
router.post('/create', async (req, res) => {
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
        'expire-at': room.expireAt,
      });
    }
  });
});

// // Todo: Broadcast Deletion
// /**
//  * DELETE ROOM
//  *
//  * Returns:
//  * Room exists and is deleted:
//  * HTTP 200
//  *
//  * Room does not exist:
//  * HTTP 404
//  *
//  * Other errors:
//  * HTTP 500
//  */
// router.delete('/:rid', async (req, res) => {
//   try {
//     const room = await roomInfoModel
//       .findOneAndDelete({ roomID: req.params.rid })
//       .exec();

//     if (room) {
//       res.status(200).end();
//     } else {
//       res.status(404).end();
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500);
//   }
// });

/**
 * LEAVE ROOM
 *
 * Returns:
 * Left the room
 *
 * Room does not exist:
 * HTTP 404
 *
 * Other errors:
 * HTTP 500
 */
router.put('/leave-room', isValidSessionCookie, async (req, res) => {
  const uid = res.locals['user-id'];
  try {
    const room = await roomInfoModel
      .findOneAndUpdate(
        { userIDs: { $in: [uid] } },
        { $pull: { userIDs: uid } },
      )
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

export default router;
