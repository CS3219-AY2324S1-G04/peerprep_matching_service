import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';

import { jsonValidator, sessionCookieValidator } from '../helper/validator';
import { queueEntityModel } from '../mongoModels/queueEntity';
import { roomInfoModel } from '../mongoModels/roomInfo';
import { userMatchModel } from '../mongoModels/userMatch';

const router = express.Router();

router.use(sessionCookieValidator);
// router.use(jsonValidator);

router.post('/', jsonValidator, async (req, res) => {
  // const uid: string = req.params.uid;

  // Somehow retrieve userID from User Service
  // SessionCookieValidator able to put within res.userID
  const userID = req.cookies['session-token'];
  const jsonData = req.body;

  //
  try {
    const matched = await checkMatched(userID);
    if (matched) {
      return res.status(200).json({
        message: 'Already assigned a room!',
        roomID: matched,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(503).send('Something wrong with our servers, please.');
  }

  // --------------------------
  // not matched, means not in room.
  console.log('---------------');

  console.log(`${userID} is not matched yet.`);
  // Note: Important to grab from all Queues (easy med hard).
  const inQueue = await queueEntityModel.findOne({ userID: userID }).exec();

  const dd: string[] = jsonData.questions;
  const data = {
    userID: userID,
    difficulty: jsonData.difficulty,
    preferences: dd,
    language: jsonData.language,
    timeStamp: new Date(),
  };

  // not in queue, check and join queue
  if (inQueue == null) {
    console.log(`${userID} is not in a queue yet.`);
    // attempt match

    // using match at least one has the issue of what if no difficulty for
    // that question exists

    // Grab first possible one, lock it and give me that one
    // Locking if i want to return it back
    const samePrefUser = await queueEntityModel
      .findOneAndDelete(
        {
          difficulty: jsonData.difficulty,
          preferences: { $elemMatch: { $in: dd } },
          language: jsonData.language,
          // lock: false,
        },
        // .findOneAndUpdate(
        //   {
        //     difficulty: jsonData.difficulty,
        //     preferences: { $in: jsonData.questions },
        //     language: jsonData.language,
        //     lock: false,
        //   },
        //   { lock: true },
        //   { new: true },
      )
      .exec();

    // I don't know if this can have mutex errors or not. By right findOneAndDelete works
    if (samePrefUser) {
      console.log(
        `${userID} is has the same preference as ${samePrefUser.userID}`,
      );
      // Small chance that chosen question does not exist in this difficulty
      const matchedValues: string[] = samePrefUser.preferences.filter((value) =>
        jsonData.questions.includes(value),
      );

      const chosenQuestion =
        matchedValues[Math.floor(Math.random() * matchedValues.length)];

      console.log(chosenQuestion);
      // generate room UID here
      const roomID: string = uuidV4(); // any chance of collision?

      const user1 = new userMatchModel({
        userID: userID,
        roomID: roomID,
      }).save();
      const user2 = new userMatchModel({
        userID: samePrefUser.userID,
        roomID: roomID,
      }).save();
      const room = new roomInfoModel({
        roomID: roomID, // by right this is unique
        userID: [userID, samePrefUser.userID],
        difficulty: jsonData.difficulty,
        question: chosenQuestion,
      }).save();
      console.log(`${userID} is matched with ${samePrefUser.userID}`);

      return res.send(`You are now matched to ${roomID}`);
    } else {
      // fail match, join
      new queueEntityModel(data).save();
      console.log(`${userID} has failed to match, joining queue`);
      console.log(`${userID} has joined the ${jsonData.difficulty} queue`);
      return res.send(`Added you to the ${jsonData.difficulty} queue!`);
    }
  } else {
    // you are already in queue what are you doing?
    console.log(`${userID} is already in queue.`);

    // if expired but not deleted, join queue
    if (Date.now() - inQueue.timeStamp.getTime() > 30 * 1000) {
      inQueue.delete();
      console.log(`${userID} expired!`);
      return res.send(`You have expired, deleted from queue`);
    } else {
      // else wait in queue.
      console.log(`${userID} is already in the queue before hand!!!!`);
      return res.send(`You are already in a ${inQueue.difficulty} queue!`);
    }
  }
});

function joinQueue() {}

async function checkQueue(userID: string) {
  const inQueue = await queueEntityModel.findOne({ userID: userID }).exec();
}

/**
 * Given a userID, find out if the user has a room matched.
 *
 * @param userID
 * @returns roomID if success or null.
 */
async function checkMatched(userID: string): Promise<String | null> {
  try {
    const userMatched = await userMatchModel.findOne({ userID: userID }).exec();
    if (userMatched != null) {
      return userMatched.roomID;
    }
    return null;
  } catch (error) {
    throw error;
  }
}

export default router;
