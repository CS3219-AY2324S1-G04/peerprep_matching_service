/**
 * @file Route file for matching-service.
 */
import axios from 'axios';
import express from 'express';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from '../dataStructs/config';
import { LanguageType } from '../dataStructs/languageType';
// eslint-disable-next-line @typescript-eslint/naming-convention
import QuestionType from '../dataStructs/questionType';
import { parseUserInput, verifyJwt } from '../helper/helper';
import { queueInfoModel } from '../mongoModels/queueInfo';

const router = express.Router();
const config = Config.get();

// Am I in Queue? Am I in Room?
/**
 * API end point to check if in Queue or in Room.
 * Calls Room API.
 */
router.get('/', verifyJwt, async (req, res) => {
  const uid = res.locals['user-id'];

  const checkQueue = await inQueue(uid);
  if (checkQueue.status == 200) {
    console.log(`User ${uid}: In queue! - ${new Date(Date.now())}`);
    // console.log(checkQueue.data); --- @
    res.status(200).json({
      status: checkQueue.status,
      message: checkQueue.message,
      data: checkQueue.data,
    });
  } else if (checkQueue.status == 404) {
    const checkRoom = await inRoom(req.cookies['access-token']);
    if (checkRoom.status == 200) {
      // 303 See other.
      console.log(
        `User ${uid}: I have been matched or I am already in a room!`,
      );
      res.status(303).json({
        status: 303,
        message: 'In room!',
        data: undefined,
      });
    } else if (checkRoom.status == 404) {
      console.log(`User ${uid}: I am not in a room!`);
      res.status(checkRoom.status).json({
        status: checkRoom.status,
        message: 'Not in room or queue',
        data: checkQueue.data, // checkRoom does not give u what to post
      });
    } else {
      console.log('Unknown queue status');
      res.status(checkRoom.status).json({
        status: checkRoom.status,
        message: checkRoom.message,
        data: checkRoom.data,
      });
    }
  } else {
    // i actually don't know what checkQueue brings you here
    console.log('Unknown queue status');
    res.status(checkQueue.status).json({
      status: checkQueue.status,
      message: checkQueue.message,
      data: checkQueue.data,
    });
  }
});

// Strictly to join Queue.
router.post('/join', verifyJwt, async (req, res) => {
  const uid = res.locals['user-id'];

  const checkQueue = await inQueue(uid);

  if (checkQueue.status == 200) {
    console.log(
      `User ${uid}: I am already in queue! - ${new Date(Date.now())}`,
    );
    // Already in queue
    res.status(409).json({
      status: 409,
      message: checkQueue.message,
      data: checkQueue.data,
    });
  } else if (checkQueue.status == 404) {
    // not in queue, but in room?
    const checkRoom = await inRoom(req.cookies['access-token']);
    if (checkRoom.status == 200) {
      console.log(`User ${uid}: I am already in room!`);
      res.status(303).json({
        status: 303,
        message: checkRoom.message,
        data: checkRoom.data,
      });
    } else if (checkRoom.status == 404) {
      console.log(`User ${uid}: Not in room, means I can join queue!`);
      // Desireable outcome
      // not in room nor in queue - pull this out into new middleman

      // const jsonData = req.body;

      const complexity: string = req.query.complexity as string;

      const categories: Array<string> = req.query.categories as Array<string>;

      const language: string = req.query.language as string;

      const filter = {
        complexity: complexity,
        categories: categories,
        language: language,
      };

      const userPref = parseUserInput(filter);

      // Now have issue of What if I match before socket is open?
      // Means i need to create socket before joining queue
      const samePrefUser = await queueInfoModel
        .findOneAndDelete({
          complexity: userPref.complexity,
          categories: { $elemMatch: { $in: userPref.categories } },
          language: userPref.language,
        })
        .exec();

      // I found at least one preference match,
      // and (have same difficulty and language)
      if (samePrefUser) {
        // Find out what other preferences match
        // (again match one preference first)
        const matchedValues: string[] = samePrefUser.categories.filter(
          (value) => userPref.categories.includes(value),
        );

        console.log(
          `User ${uid}: I've matched with someone with same categories! : ${matchedValues}`,
        );

        const baseUrl =
          config.questionServiceURL +
          '/question-service/question-matching/question?';
        const complexityParam = `complexity=${userPref.complexity}`;
        const categoryParam = matchedValues
          .map((item) => `categories[]=${item}`)
          .join('&');
        const languageParam = `language=${userPref.language}`;

        const questionID = await getQuestion(
          baseUrl,
          complexityParam,
          categoryParam,
          languageParam,
        );

        if (questionID == undefined || questionID.id == null) {
          console.error('QuestionID returned null at /join');
          res
            .status(400)
            .json({ message: 'Unable to get questions at this time' });
          return;
        }

        // Close socket here Todo: Socket
        const roomBaseUrl = config.roomServiceURL + '/room-service/rooms';
        const roomCreateJson = {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'user-ids': [Number(uid), Number(samePrefUser.userID)],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'question-id': questionID.id,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'question-lang-slug': userPref.language,
        };
        try {
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
          const expiry = new Date(Date.now() + config.mongoQueueExpiry);
          new queueInfoModel({
            userID: uid,
            complexity: userPref.complexity,
            categories: userPref.categories,
            language: userPref.language,
            expireAt: expiry,
          }).save();
          console.log(
            `Joined queue with ${userPref.complexity}, ${userPref.language}, 
            ${JSON.stringify({
              data: {
                complexity: userPref.complexity,
                categories: userPref.categories,
                language: userPref.language,
                expireAt: expiry.toISOString(),
              },
            })}`,
          );
          res.status(200).json({
            status: 200,
            message: 'Joined Queue!',
            data: {
              complexity: userPref.complexity,
              categories: userPref.categories,
              language: userPref.language,
              expireAt: expiry.toISOString(),
            },
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

router.delete('/', verifyJwt, async (req, res) => {
  const uid = res.locals['user-id'];
  try {
    await queueInfoModel.findOneAndRemove({ userID: uid }).exec();
    res
      .status(200)
      .json({ message: 'Received command to remove user from queue' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Server error, unable to remove from queue' });
  }
});

// Have FE to ask directly room-service
async function inRoom(accessToken: string) {
  try {
    const url = config.roomServiceURL + '/room-service/room';
    const result = await axios.get(url, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { Cookie: `access-token=${accessToken}` },
    });

    return { status: 200, message: 'In Room', data: result.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status == 404) {
          return {
            status: error.response.status,
            message: 'Not In Room',
            data: undefined,
          };
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
      if (userInQueue?.expireAt < new Date()) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        queueInfoModel.findOneAndDelete({ _id: userInQueue._id }).exec();
        return {
          status: 404,
          message: 'Not in Queue',
          data: {
            complexity: ['Easy', 'Medium', 'Hard'],
            categories: QuestionType.get(),
            language: LanguageType.get(),
          },
        };
      } else {
        return {
          status: 200,
          message: 'In Queue!',
          data: userInQueue.toJSON(),
        };
      }
    } else {
      return {
        status: 404,
        message: 'Not in Queue',
        data: {
          complexity: ['Easy', 'Medium', 'Hard'],
          categories: QuestionType.get(),
          language: LanguageType.get(),
        },
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, message: 'Server error', data: undefined };
  }
}

async function getQuestion(
  baseUrl: string,
  complexityParam: string,
  categoryParam: string,
  languageParam: string,
) {
  try {
    // The expectations of what i recieve back from this link
    // as of October 21, 2023 is either 200 with the contents
    // or 200 without the contents. Where contents is `data : {}`

    const question = await axios.get(
      baseUrl + complexityParam + '&' + languageParam + '&' + categoryParam,
    );
    // returned 200 and data not empty
    if (question.data.data) {
      return {
        id: question.data.data._id,
        json: {
          status: 200,
          message: 'Obtained Question',
          data: undefined,
        },
      };
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
