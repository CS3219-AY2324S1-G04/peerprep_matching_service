import axios from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';
import { isValidSession } from '../helper/session';
import { queueInfo } from '../mongoModels/queueInfo';

const router = express.Router();
const config = Config.getInstance();

router.post('/join', (req, res) => {});

router.get('/', isValidSession, (req, res) => {
  res.status(200).send('yay');
});

async function inRoom(req: Request, res: Response, next: NextFunction) {
  const uid = res.locals['user-id'];

  const url =
    config.questionServiceURI + '/room-service/users/' + uid + '/room';

  try {
    const result = axios
      .get(url)
      .then((response) => {
        // User is in room
        response.data;
        res.status(303).json({ room });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          return { status: 404, message: undefined };
        } else if (error.response && error.response.status === 500) {
          return { status: 500, message: undefined };
        } else {
          throw error;
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}

export default router;
