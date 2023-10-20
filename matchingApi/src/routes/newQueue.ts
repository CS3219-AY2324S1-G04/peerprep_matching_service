import axios from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';
import questionType from '../dataStructs/questionType';
import { isValidSession, jsonValidator } from '../helper/validator';
import { queueInfo, queueInfoModel } from '../mongoModels/queueInfo';

const router = express.Router();
const config = Config.getInstance();

router.get('/status', isValidSession, async (req, res, next) => {
  const uid = res.locals['user-id'];
  const userInQueue = await queueInfoModel.findOne({ userID: uid }).exec();

  if (userInQueue) {
    res.status(200).json({
      message: 'In queue',
      'expires-at': userInQueue.expireAt,
    });
  } else {
    // not in queue but can be in a room :|
    res.status(404).json({
      message: 'Not in queue',
      'question-type': questionType.qTypes,
      difficulty: ['Easy', 'Medium', 'Hard'],
    });
  }
});

router.post('/join', isValidSession, async (req, res, next) => {
  const uid = res.locals['user-id'];
  const userInQueue = await queueInfoModel.findOne({ userID: uid }).exec();

  if (userInQueue) {
    res.status(200).json({
      message: 'In queue',
      'expires-at': userInQueue.expireAt,
    });
  } else if (inRoom) {
    inRoom(req, res, next);

    const jsonData = req.body;

    const preferences: string[] = jsonData.questions;
    const data = {
      userID: uid,
      difficulty: jsonData.difficulty,
      preferences: preferences,
      language: 'c',
      expireAt: new Date(Date.now() + config.mongoQueueExpiry),
    };

    const samePrefUser = await queueInfoModel
      .findOneAndDelete({
        difficulty: jsonData.difficulty,
        preferences: { $elemMatch: { $in: preferences } },
        language: jsonData.language,
        // lock: false,
      })
      .exec();

    if (samePrefUser) {
      const matchedValues: string[] = samePrefUser.preferences.filter((value) =>
        jsonData.questions.includes(value),
      );
    }

    if (samePrefUser) {
    }
  }
});

// Have FE to ask directly room-service
async function inRoom(req: Request, res: Response, next: NextFunction) {
  const uid = res.locals['user-id'];
  console.log(uid + ' passing in Room now.');

  const url =
    config.roomServiceURI + '/room-service/room/user' + '/?user-id=' + uid;

  try {
    const result = axios
      .post(url)
      .then((response) => {
        res
          .status(200)
          .json({ message: 'Already in room' + response.data['room-id'] });
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response && error.response.status === 404) {
          // Success condition, because 404 means not inside.
          next();
        } else if (error.response && error.response.status === 500) {
          res.status(500).send('sever error');
        } else {
          throw error;
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}

async function inQueue(req: Request, res: Response, next: NextFunction) {
  const uid = res.locals['user-id'];
  const userInQueue = await queueInfoModel.findOne({ userID: uid }).exec();

  if (userInQueue) {
    res.status(200).json({
      message: 'In queue',
      'question-type': questionType.qTypes,
      difficulty: ['Easy', 'Medium', 'Hard'],
    });
  } else {
    res.status(404).json({ message: 'Not in queue' });
  }
}

// /**
//  * Given a userID, find out if the user has a room matched.
//  *
//  * @param userID
//  * @returns roomID if success or null.
//  */
// async function checkMatched(userID: string): Promise<String | null> {
//   try {
//     const userMatched = await userMatchModel.findOne({ userID: userID }).exec();
//     if (userMatched != null) {
//       return userMatched.roomID;
//     }
//     return null;
//   } catch (error) {
//     throw error;
//   }
// }

export default router;
