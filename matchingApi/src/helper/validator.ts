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
export function middleJsonValidator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.is('json')) {
    const jsonData = req.body;
    if (isValidJson(jsonData)) {
      next();
    } else {
      return res.status(400).json({ status: 400, message: 'Incorrect Json format', data: undefined });
    }
  } else {
    return res.status(400).json({ status: 400, message: 'Json Required', data: undefined });
  }
}

// passed by reference
export function isValidJson(jsonData: any): boolean {
  /**
   * A valid json is one with
    {
        "difficulty" : "Easy",
        "questions" : [<any from questionType>],
        // language" : <any from languageType>
    }
   */
  if (
    jsonData.difficulty == undefined ||
    jsonData.categories == undefined // ||
    // jsonData.language == undefined
  ) {
    // console.log('undefined');
    return false;
  }

  if (!['Easy', 'Medium', 'Hard'].includes(jsonData.difficulty)) {
    return false;
  }

  // if (!languageType.lTypes.includes(jsonData.language)) {
  //   return false;
  // }

  if (!Array.isArray(jsonData.categories)) {
    return false;
  }

  questionType.update();

  // Contains invalid, so remove all invalids
  const validQuestions: string[] = jsonData.categories.filter((type: string) =>
    questionType.qTypes.includes(type),
  );

  // Somehow sent is length = 0
  if (validQuestions.length == 0) {
    // jsonData.questions = questionType.qTypes;
    return false;
  } else {
    jsonData.categories = validQuestions;
  }

  return true;
}

export async function middleIsValidSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = req.cookies['session-token'];

  if (!session) {
    return res.status(401).json({
      status: 401,
      message: "Missing session-token cookie",
      data: undefined
    })
  }

  const url = config.userServiceURL + '/user-service/user/identity';
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
          res.status(500).json({
            status: 500,
            message: "User-servicer sent an arrow",
            data: undefined
          });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          res.status(401).json({
            status: 401,
            message: "Unauthorized",
            data: undefined
          });
        } else if (error.response && error.response.status === 500) {
          console.error('Warning: user service returning 500');
          res.status(500).json({
            status: 500,
            message: "User service sending 500",
            data: undefined
          })
        } else {
          console.error(error);
          res.status(500).json({
            status: 500,
            message: "User service sending 500",
            data: undefined
          });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "User service sending 500",
      data: undefined
    });
  }
}

// should just convert that into an interface
export function parseJson(jsonData: any): {
  difficulty: string;
  categories: string[];
  language: string;
} {
  /**
   * A valid json is one with
    {
        "difficulty" : "Easy", // Note Case cap
        "questions" : [<any from questionType>],
        "language" : "Nil" // Currently fixed to Nil
    }
   */
  let validJson: {
    difficulty: string;
    categories: string[];
    language: string;
  } = {
    difficulty: '',
    categories: [],
    language: 'Nil',
  };

  // No difficulty or wrong difficulty
  if (
    jsonData.difficulty == undefined ||
    !['Easy', 'Medium', 'Hard'].includes(jsonData.difficulty)
  ) {
    validJson.difficulty = 'Hard';
  } else {
    validJson.difficulty = jsonData.difficulty;
  }

  // No language or wrong language
  if (
    jsonData.language == undefined ||
    !languageType.lTypes.includes(jsonData.language)
  ) {
    validJson.language = 'Nil';
  }

  // No questions or wrong questions. Select all.
  if (Array.isArray(jsonData.categories)) {
    // Contains invalid, so remove all invalids
    const validQuestions: string[] = jsonData.categories.filter(
      (type: string) => questionType.qTypes.includes(type),
    );
    if (validQuestions.length == 0) {
      validJson.categories = questionType.qTypes;
    } else {
      validJson.categories = validQuestions;
    }
  } else {
    validJson.categories = questionType.qTypes;
  }

  return validJson;
}
