import axios, { AxiosError } from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';
import questionType from '../dataStructs/questionType';
import {
  middleIsValidSession,
  middleJsonValidator,
  parseJson,
} from '../helper/validator';
import { queueInfo, queueInfoModel } from '../mongoModels/queueInfo';
// import { Socks } from '../service/sockets';

const router = express.Router();
const config = Config.getInstance();

// Am I in Queue? Am I in Room?
router.get('/', middleIsValidSession, async (req, res) => {
  const uid = res.locals['user-id'];

  const checkQueue = await inQueue(uid);
  if (checkQueue.status == 200) {
    res.status(200).json({
      status: checkQueue.status,
      message: checkQueue.message,
      data: checkQueue.data,
    });
  } else if (checkQueue.status == 404) {
    const checkRoom = await inRoom(uid);
    if (checkRoom.status == 200) {
      // 303 See other.
      res.status(303).json({
        status: 303,
        message: 'In room!',
        data: undefined,
      });
    } else if (checkRoom.status == 404) {
      res.status(checkRoom.status).json({
        status: checkRoom.status,
        message: 'Not in room or queue',
        data: checkQueue.data, // checkRoom does not give u what to post
      });
    } else {
      res.status(checkRoom.status).json({
        status: checkRoom.status,
        message: checkRoom.message,
        data: checkRoom.data,
      });
    }
  } else {
    // i actually don't know what checkQueue brings you here
    res.status(checkQueue.status).json({
      status: checkQueue.status,
      message: checkQueue.message,
      data: checkQueue.data,
    });
  }
});

// Strictly to join Queue.
router.post('/join', middleIsValidSession, async (req, res, next) => {
  const uid = res.locals['user-id'];

  const checkQueue = await inQueue(uid);

  if (checkQueue.status == 200) {
    // Already in queue
    res.status(409).json({
      status: 409,
      message: checkQueue.message,
      data: checkQueue.data,
    });
  } else if (checkQueue.status == 404) {
    // not in queue, but in room?
    const checkRoom = await inRoom(uid);
    if (checkRoom.status == 200) {
      res.status(303).json({
        status: 303,
        message: checkRoom.message,
        data: checkRoom.data,
      });
    } else if (checkRoom.status == 404) {
      // Desireable outcome
      // not in room nor in queue - pull this out into new middleman

      const jsonData = req.body;
      const properJson = parseJson(jsonData);

      // Now have issue of What if I match before socket is open?
      // Means i need to create socket before joining queue
      const samePrefUser = await queueInfoModel
        .findOneAndDelete({
          difficulty: properJson.difficulty,
          categories: { $elemMatch: { $in: properJson.categories } },
        })
        .exec();

      // I found same preference
      if (samePrefUser) {
        // console.log(`${uid} has same preference as ${samePrefUser.userID}`);
        // Deal with socket here Todo:
        // samePrefUser.socketID <<<<<< tell socket to close
        // how though

        // try {
        //   Socks.otherUserMatch(samePrefUser.userID);
        //   console.log('Sent to socks');
        // } catch (error) {
        //   console.error('Unable to inform other party that room matched');
        // }

        const matchedValues: string[] = samePrefUser.categories.filter(
          (value) => properJson.categories.includes(value),
        );

        const baseUrl =
          config.questionServiceURL +
          '/question-service/question-matching/question?';
        const complexityParam = `complexity=${properJson.difficulty}`;
        const categoryParam = matchedValues
          .map((item) => `category[]=${item}`)
          .join('&');

        const questionID = await getQuestion(
          baseUrl,
          complexityParam,
          categoryParam,
        );

        if (questionID.id == null) {
          res
            .status(questionID.json.status)
            .send(questionID.json.message);
        }

        // Close socket here Todo: Socket
        const roomBaseUrl = config.roomServiceURL + '/room-service/room/create';
        const roomCreateJson = {
          users: [uid.toString(), samePrefUser.userID],
          'question-id': questionID.id,
        };
        try {
          console.log('Creating Room');
          const roomRes = await axios.post(roomBaseUrl, roomCreateJson);
          res.status(200).json({
            status: 200,
            message: 'Room Created',
            data: roomRes.data,
          });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.log(error);
            res.status(error.response.status).json({
              status: error.response.status,
              message: 'Server Error',
              data: error.response.data,
            });
          } else {
            console.error(error);
            res.status(500).json({
              status: 500,
              message: 'Sever Error',
              data: undefined,
            });
          }
        }
      }
      // I found no same preference.
      else {
        try {
          new queueInfoModel({
            userID: uid,
            difficulty: properJson.difficulty,
            categories: properJson.categories,
            language: properJson.language,
            expireAt: new Date(Date.now() + config.mongoQueueExpiry),
          }).save();
          res.status(200).json({
            status: 200,
            message: 'Open Sockets',
            data: undefined,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            status: 500,
            message: 'Server Error while adding to queue',
            data: undefined,
          });
        }
      }
    } else {
      res.status(500).json({
        status: 500,
        message: 'Server Error while checking room state',
        data: undefined,
      });
    }
  } else {
    res.status(500).json({
      status: 500,
      message: 'Server Error while checking room state',
      data: undefined,
    });
  }
});

// Have FE to ask directly room-service
async function inRoom(uid: string) {
  try {
    const url =
      config.roomServiceURL + '/room-service/room/user' + '/?user-id=' + uid;
    const result = await axios.post(url);
    return { status: 200, message: 'In Room', data: result.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status == 404) {
          return { status: error.response.status, message: 'Not In Room', data: undefined };
        }
      }
    }
    console.error(error);
    return {
      status: 500,
      message: 'Server Error while checking room state',
      data: undefined,
    };
  }
}

// do the same thing but two different expectation
async function inQueue(uid: string) {
  try {
    const userInQueue = await queueInfoModel.findOne({ userID: uid }).exec();

    if (userInQueue) {
      return {
        status: 200,
        message: 'In Queue!',
        data: userInQueue.toJSON,
      };
    } else {
      return {
        status: 404,
        message: 'Not in Queue',
        data: {
          'question-type': questionType.qTypes,
          difficulty: ['Easy', 'Medium', 'Hard'],
        },
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, message: 'Server error', data: undefined };
  }
}
////////////////////////////////////////////////////////////
async function getQuestion(
  baseUrl: string,
  complexityParam: string,
  categoryParam: string,
) {
  try {
    // The expectations of what i recieve back from this link
    // as of October 21, 2023 is either 200 with the contents
    // or 200 without the contents. Where contents is `data : {}`

    const getQuestion = await axios.get(
      baseUrl + complexityParam + '&' + categoryParam,
    );
    // returned 200 and data not empty
    if (getQuestion.data.data) {
      return {
        id: getQuestion.data.data._id,
        json: {
          status: 200,
          message: 'Obtained Question',
          data: undefined,
        },
      };
    } else {
      // returned 200 and data is empty
      try {
        // Because possible to get 200 but empty data, call for one question of same complexity
        const getQuestionAny = await axios.get(baseUrl + complexityParam);
        return {
          id: getQuestionAny.data.data._id,
          json: {
            status: 200,
            message: 'Obtained Question',
            data: undefined,
          },
        };
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    // Catch axios, and all other errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status == 400) {
          return {
            id: null,
            json: {
              status: 400,
              message: 'Bad request while retrieving questions',
              data: undefined,
            },
          };
        }
      }
    }
    console.log(error);
    return {
      id: null,
      json: {
        status: 500,
        message: 'Sever Error while getting questions',
        data: undefined,
      },
    };
  }
}

export default router;
