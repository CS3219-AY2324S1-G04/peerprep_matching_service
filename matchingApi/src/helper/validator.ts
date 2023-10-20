import axios from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';
import languageType from '../dataStructs/languageType';
import questionType from '../dataStructs/questionType';

const config = Config.getInstance();

/**
 * Middleman function to check if json is in the correct format.
 *
 * @param req Request
 * @param res Response
 * @param next Next
 * @returns Bad request if not JSON or in the correct format. Else proceed.
 */
export function jsonValidator(req: Request, res: Response, next: NextFunction) {
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

  if (!['Easy', 'Medium', 'Hard'].includes(jsonData.difficulty)) {
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
    // jsonData.questions = questionType.qTypes;
    return false;
  } else {
    jsonData.questions = validQuestions;
  }

  return true;
}

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
