import axios from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';

const config = Config.getInstance();

export async function isValidSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = req.cookies['session-token'];

  if (!session) {
    return res.status(401).end();
  }

  const url = config.userServiceURI + '/user-service/user/identity';
  const param = '?session-token=' + session;

  try {
    await axios
      .get(url + param)
      .then((response) => {
        const data = response.data;
        const uid = data['user-id'];
        if (response.data) {
          res.locals['user-id'] = uid;
          next();
        } else {
          console.error('Warning: user service not acting as expected.');
          res.status(500).end();
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          res.status(401).end();
        } else if (error.response && error.response.status === 500) {
          console.error('Warning: user service returning 500');
          res.status(500).end();
        } else {
          console.error(error);
          res.status(500).end();
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
