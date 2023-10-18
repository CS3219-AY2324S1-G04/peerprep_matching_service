import express, { NextFunction, Request, Response } from 'express';

import Config from '../../dataStructs/config';
import {
  isValidSessionCookie,
  isValidSessionParam,
} from '../../helper/session';
import { roomInfoModel } from '../../mongoModels/roomInfo';

const router = express.Router();
const config = Config.getInstance();

/**
 * For user to query if they have a room.
 *
 * Requires a cookie called session-token.
 *
 * Returns
 * 200: if they have a room
 * 401: if session is invalid
 * 404: if they don't have a room
 * 500: sever errors
 */
router.get('/user', isValidSessionCookie, async (req, res) => {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOne({ userIDs: { $in: [uid] } })
      .exec();
    if (room) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

/**
 * For collab service to query if a particular session-token is in a room.
 *
 * Returns
 * 200: if the specified session-token has a room, and return the details in json format
 * {
 * 'room-id': room.roomID,
 * users: room.userIDs,
 * 'questions-id': room.questionID,
 * 'expire-at': room.expireAt,
 * }
 * 401: if session is invalid
 * 404: if they don't have a room
 * 500: sever errors
 */
router.post('/user/:session-token', isValidSessionParam, async (req, res) => {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOne({ userIDs: { $in: [uid] } })
      .exec();
    if (room) {
      res.status(200).json({
        'room-id': room._id,
        users: room.userIDs,
        'questions-id': room.questionID,
        'expire-at': room.expireAt,
      });
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
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
router.get('/user/alive', isValidSessionCookie, async (req, res) => {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOne({ userIDs: { $in: [uid] } })
      .exec();
    if (room) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

/**
 * PUT EXTEND ROOM LIFESPAN
 *
 * Mongo expires the room after a certain amount of time.
 * This route is to extend the user's by mongoRoomExpiry miliseconds from now.
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
router.put('/user/keep-alive', isValidSessionCookie, async (req, res) => {
  const uid = res.locals['user-id'];

  try {
    const room = await roomInfoModel
      .findOneAndUpdate(
        { userIDs: { $in: [uid] } },
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
