import express, { NextFunction, Request, Response } from 'express';

import { cookieValidator, jsonValidator } from '../helper/validator';
import { queueEntityModel } from '../mongoModels/queueEntity';
import { roomInfoModel } from '../mongoModels/roomInfo';
import { userMatchModel } from '../mongoModels/userMatch';

const router = express.Router();

router.get('/room/:rid', async (req, res) => {
  // const userID = req.cookies['session-token'];
  const rid: string = req.params.rid;

  // if (userID == rid) {
  const roomMatched = await roomInfoModel.findOne({ roomID: rid }).exec();

  if (roomMatched) {
    res.status(200);
    res.json(roomMatched);
  } else {
    res.status(404);
    res.send();
  }
  // } else {
  //   res.status(401);
  //   res.send('Unauthorized');
  // }
});

router.get('/user/:uid', async (req, res) => {
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
router.delete('/room/:rid', async (req, res) => {
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

export default router;
