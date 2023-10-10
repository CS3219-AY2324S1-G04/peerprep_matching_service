import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';

import languageType from '../dataStructs/languageType';
import questionType from '../dataStructs/questionType';

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
  const sessionID = req.cookies.sessionID;
  if (sessionID) {
    // check for valid sessionID by contacting user service here
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
