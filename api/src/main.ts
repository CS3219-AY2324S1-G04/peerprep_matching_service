/**
 * @file Entry point to the program.
 */
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import languageType from './dataStructs/languageType';
import questionType from './dataStructs/questionType';
import { queueEntityModel } from './mongoModels/queueEntity';
import { roomInfoModel } from './mongoModels/roomInfo';
import { userMatchModel } from './mongoModels/userMatch';
import mongoClient from './service/mongo';

const app = express();
const port = 3000;

// no idea how to activate this before app.listen.
// could be achieved using docker
// const redis = redisClient.getInstance();
const mongo = mongoClient.getInstance();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express!');
});

app.use(bodyParser.json());
app.use(cookieParser());

// Quickmatch is same as this but no difficulty and language restrict
app.post('/queue', cookieValidator, jsonValidator, async (req, res) => {
  // const uid: string = req.params.uid;

  // Somehow retrieve userID from User Service
  const userID = req.cookies.session_token;
  const jsonData = req.body;

  const userMatched = await userMatchModel.findOne({ userID: userID }).exec();

  // not matched, means not in room.
  console.log('---------------');

  if (userMatched == null) {
    console.log(`${userID} is not matched yet.`);
    // Note: Important to grab from all Queues (easy med hard).
    const inQueue = await queueEntityModel.findOne({ userID: userID }).exec();

    const dd: string[] = jsonData.questions;
    const data = {
      userID: userID,
      difficulty: jsonData.difficulty,
      preferences: jsonData.questions,
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
        const matchedValues: string[] = samePrefUser.preferences.filter(
          (value) => jsonData.questions.includes(value),
        );

        const chosenQuestion =
          matchedValues[Math.floor(Math.random() * matchedValues.length)];

        console.log(chosenQuestion);
        // generate room UID here
        const roomID: string = uuidv4(); // any chance of collision?

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

      // if (inQueue.lock) {
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      //   const userMatched = await userMatchModel.findOne({ userID }).exec();
      //   if (userMatched != null) {
      //     return res.send(`You are already in ${userMatched.roomID}`);
      //   }
      //   throw error('inQueue locked but user no match');
      // }

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
  } else {
    // Is matched, and somehow is asking for room
    console.log(`${userID} is already matched`);
    return res.send(`You are already in ${userMatched.roomID}`);
  }
});

// Check
app.get('/match/room/:rid', async (req, res) => {
  const rid: string = req.params.rid;

  const roomMatched = await roomInfoModel.findOne({ roomID: rid }).exec();

  if (roomMatched) {
    res.status(200);
    res.json(roomMatched);
  } else {
    res.status(404);
    res.send();
  }
});

app.get('/match/user/:uid', async (req, res) => {
  const uid: string = req.params.uid;

  const userMatched = await userMatchModel.findOne({ userID: uid }).exec();
  console.log(userMatched);

  if (userMatched) {
    res.status(200);
    res.json(userMatched);
  } else {
    res.status(404);
    res.send();
  }
});

// Delete match
app.delete('/match/room/:rid', async (req, res) => {
  const rid: string = req.params.rid;
  console.log(`request to delete room ${rid}`);

  const roomMatched = await roomInfoModel
    .findOneAndDelete({ roomID: rid })
    .exec();

  if (roomMatched) {
    console.log('found room');
    for (let index = 0; index < roomMatched.userID.length; index++) {
      console.log(`Deleting user ${roomMatched.userID[index]}`);
      await userMatchModel
        .findOneAndDelete({ userID: roomMatched.userID[index] })
        .exec();
    }
    res.status(200);
    res.send('Success');
  } else {
    console.log('404');
    res.status(404);
    res.send('Room does not exist');
  }
});

// Last item
app.use((req: Request, res: Response) => {
  res.status(404);
  res.send('Not found.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  _deleteQueue();
});

function jsonValidator(req: Request, res: Response, next: NextFunction) {
  if (req.is('json')) {
    const jsonData = req.body;
    if (isValidJson(jsonData)) {
      next();
    } else {
      return res.status(400).json({ message: 'Incorrect Json format' });
    }
  } else {
    return res.status(400).json({ message: 'Json expected.' });
  }
}

function cookieValidator(req: Request, res: Response, next: NextFunction) {
  const session_token = req.cookies.session_token;
  if (session_token) {
    // check for valid session_token by contacting user service here
    next();
  } else {
    return res.status(401).json({ message: 'You are not logged in.' });
  }
}

function isValidJson(jsonData: any): boolean {
  /**
   * A valid json is one with
    {
        "difficulty" : "easy",
        "questions" : [<any from questionType>],
        "language" : <any from languageType>
    }
   */
  if (
    jsonData.difficulty == undefined ||
    jsonData.questions == undefined ||
    jsonData.language == undefined
  ) {
    // console.log('undefined');
    return false;
  }

  if (!['easy', 'medium', 'hard'].includes(jsonData.difficulty)) {
    return false;
  }

  if (!languageType.lTypes.includes(jsonData.language)) {
    return false;
  }

  if (!Array.isArray(jsonData.questions)) {
    return false;
  }

  // Contains invalid, so remove all invalids
  const validQuestions: string[] = jsonData.questions.filter((type: string) =>
    questionType.qTypes.includes(type),
  );

  // Somehow sent is length = 0
  if (validQuestions.length == 0) {
    jsonData.questions = questionType.qTypes;
  } else {
    jsonData.questions = validQuestions;
  }

  return true;
}

function _deleteQueue() {
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
