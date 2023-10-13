import axios from 'axios';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';

import Config from '../../dataStructs/config';
import { roomInfo, roomInfoModel } from '../../mongoModels/roomInfo';

const router = express.Router();
const config = Config.getInstance();

router.use(bodyParser.json());

/**
 * Route is for retrieving room details given particular room id
 *
 * Require
 * {
 * "psk": string
 * }
 *
 * HTTP 200
 * json { user : string[], title : string, details: string }
 *
 * HTTP 404
 * HTTP 500
 */
router.get('/:rid', checkPSK, async (req, res) => {
  try {
    const room = await roomInfoModel.findOne({ roomID: req.params.rid }).exec();
    if (room) {
      res.status(200).json({
        users: room.userIDs,
        title: room.title,
        description: room.description,
      });
    } else {
      res.status(404).end();
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

router.delete('/:rid', checkPSK, async (req, res) => {
  try {
    const room = await roomInfoModel
      .findByIdAndDelete({ roomID: req.params.rid })
      .exec();

    if (room) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

/**
 * Mongo expires the room after a certain amount of time.
 * This route is to extend it by mongoRoomExpiry miliseconds from now.
 *
 * RETURN 200 if success
 * RETURN 404 if room is not found
 * RETURN 500 if any server error
 */
router.put('/:rid/expiry', async (req, res) => {
  try {
    const room = await roomInfoModel
      .findOneAndUpdate(
        { roomID: req.params.rid },
        { $set: { expireAt: new Date(Date.now() + config.mongoRoomExpiry) } },
        { new: true, useFindAndModify: false },
      )
      .exec();

    if (room) {
      return res.status(200).end();
    }
    res.status(404).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

/**
 * Route is for creating room.
 *
 * Here we assume that PSK is not lost, and therefore the information
 * provided is correct and has no need for validation.
 *
 * EXPECT:
 * {
 * psk: string,
 * users: string[],
 * categories: string[],
 * complexity: string,
 * }
 *
 * RETURN:
 * 200 { roomID : string }
 * 400
 * 500
 */
router.post('/', checkPSK, async (req, res) => {
  const users = req.body.users;
  const categories = req.body.categories;
  const complexity = req.body.complexity;

  if (!users || !categories || !complexity) {
    console.log('Adding to rooms failed for users', users);
    return res.status(400).end();
  }

  const baseUrl =
    config.questionServiceURI + '/question-service/question-matching/question';
  const queryParams = await buildQueryString({ 'categories[]': categories });
  const url = `${baseUrl}?complexity=${complexity}&${queryParams}`;

  console.log(url);

  let title = undefined;
  let description = undefined;

  try {
    const question_service_response = await axios.get(url);

    if (question_service_response.status === 500) {
      console.error('Querying question server returned error');
      return res.status(500).end();
    } else if (question_service_response.status === 200) {
      // Able to talk to URI (Returns success) but returns no data
      if (question_service_response.data.data == undefined) {
        return res.status(400).end();
      }
      title = question_service_response.data.data.title;
      description = question_service_response.data.data.description;
      console.log(title, description);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }

  if (title == undefined || description == undefined) {
    return res.status(500).end();
  }

  const room = new roomInfoModel({
    roomID: uuidV4(),
    userIDs: req.body.users,
    title: title,
    description: description,
    expireAt: new Date(Date.now() + config.mongoRoomExpiry),
  });

  room.save((error, doc) => {
    if (error) {
      console.error('Error occurred while saving the room:', error);
      res.status(500).end();
    } else {
      res.status(200).json({
        roomID: doc.roomID,
      });
    }
  });
});

/**
 * Returns whether a particular room is alive or not.
 *
 * HTTP 200: Alive
 * HTTP 404: Not found
 * HTTP 500: Internal server error.
 */
router.get('/:rid/alive', async (req, res) => {
  console.log('hello');
  try {
    const room = await roomInfoModel.findOne({ roomID: req.params.rid }).exec();
    if (room) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Middleware to check if the request contains the valid pre-shared key in the request body
 * Returns HTTP 404 if the key is not present or invalid.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
async function checkPSK(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const claim = req.body.psk;
  if (claim && typeof claim === 'string' && claim === config.psk) {
    next();
  } else {
    res.status(404).end();
  }
}

async function buildQueryString(params: {
  [key: string]: string[];
}): Promise<string> {
  return Object.keys(params)
    .map((key) => params[key].map((value) => `${key}=${value}`).join('&'))
    .join('&');
}

export default router;
