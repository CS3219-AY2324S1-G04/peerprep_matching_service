import express from 'express';

import Config from '../dataStructs/config';
import { isValidSessionCookie, isValidSessionParam } from '../helper/session';
import { roomInfoModel } from '../mongoModels/roomInfo';
import user from './room/user';

const router = express.Router();
const config = Config.getInstance();

router.use('/user', user);

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
    console.error('');
    return res.status(400).json({
      status: 400,
      message: 'Missing parameters.',
      data: undefined,
    });
  }

  const room = new roomInfoModel({
    userIDs: req.body.users,
    questionID: req.body['question-id'],
    expireAt: new Date(Date.now() + config.mongoRoomExpiry),
  });

  room.save((error, document) => {
    if (error) {
      console.error('Error occurred while creating the room:', error);
      res.status(500).json({
        status: 500,
        message: 'Server error',
        data: undefined,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: 'Room has been created!',
        data: {
          'room-id': document._id,
          'expire-at': room.expireAt,
        },
      });
    }
  });
});

// Todo: Broadcast Deletion
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
      .findOneAndDelete({ roomID: req.params.rid })
      .exec();

    if (room) {
      res.status(200).json({
        status: 200,
        message: 'Room has been deleted!',
        data: undefined,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'Room not found',
        data: undefined,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Sever Error',
      data: undefined,
    });
  }
});

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
      res.status(200).json({
        status: 200,
        message: 'User has left the room.',
        data: undefined,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'User is not in a room',
        data: undefined,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Server Error',
      data: undefined,
    });
  }
});

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
    const room = await roomInfoModel.findOne({ _id: req.params.rid }).exec();
    if (room) {
      res.status(200).json({
        status: 200,
        message: 'Room Info:',
        data: {
          'room-id': room._id,
          users: room.userIDs,
          'questions-id': room.questionID,
          'expire-at': room.expireAt,
        },
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'Room is not found',
        data: undefined,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Server Internal Error',
      data: undefined,
    });
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
    const room = await roomInfoModel.findOne({ _id: req.params.rid }).exec();
    if (room) {
      res.status(200).json({
        status: 200,
        message: 'Room is alive',
        data: undefined,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: 'Unable to find room specified',
        data: undefined,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      data: undefined,
    });
  }
});

export default router;
