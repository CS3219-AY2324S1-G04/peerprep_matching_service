/**
 * Used for inquiring
 * @file Used to retrieve user-id from user-service using session-token
 */
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';

const config = Config.getInstance();

/**
 * Middleware to call _isValidSession after checking if 'session-token' param
 * or 'session-token' cookie exists.
 *
 * If no parameter is provided, cookie will be checked.
 *
 * @param req
 * @param res
 * @param next
 *
 * Responses with
 * next() on success
 * 401 if unable to find session-token
 *
 * @see isValidSessionCookie
 */
export async function isValidSessionParam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.query['session-token'] === undefined) {
    res.status(401).end();
  }
  res.locals['session-token'] = req.query['session-token'];
  _isValidSession(req, res, next);
}

/**
 * Middleware to call _isValidSession after checking if 'session-token' cookie
 * exists.
 *
 * @param req
 * @param res
 * @param next
 *
 * Responses with
 * next() on success
 * 401 if unable to find session-token
 *
 * @see _isValidSession
 */
export async function isValidSessionCookie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = req.cookies['session-token'];

  if (!session) {
    res.status(401).end();
  }

  res.locals['session-token'] = session;
  _isValidSession(req, res, next);
}

/**
 * Middleware which retrieves user-id based on session-token that is
 * stored in res.locals['session-token']
 *
 * @param req The Request
 * @param res The Response
 * @param next The NextFunction
 *
 * Responses with
 * next() on success, stores user-id in res.locals['user-id']
 * 401 on invalid session-token
 * 500 on server error
 */
async function _isValidSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const url = config.userServiceURI + '/user-service/user/identity';
  const param = '?session-token=' + res.locals['session-token'];

  try {
    await axios
      .get(url + param)
      .then((response) => {
        const data = response.data;
        const uid = data['user-id'];
        if (response.data) {
          res.locals['user-id'] = uid;
          delete res.locals['session-token'];
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
