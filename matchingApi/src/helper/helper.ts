/**
 * @file File containing helper functions.
 */
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from '../dataStructs/config';
import { LanguageType } from '../dataStructs/languageType';
// eslint-disable-next-line @typescript-eslint/naming-convention
import QuestionType from '../dataStructs/questionType';
import { MatchingUserInput } from './matchingUserInput';

const configuration = Config.get();

/**
 * Middleman that verifies if user's access-token is legitimate,
 * extracts information from JWT and save the user-id into
 * response locals as user-id.
 * @param req - The request received.
 * @param res - The response to send.
 * @param next - Part of Express middleman.
 */
export async function verifyJwt(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // No Token case
  if (!req.cookies['access-token']) {
    res.status(401).send({
      message: 'No access-token',
    });
  } else {
    // No Pub key case (shouldn't hit here but not impossible)
    if (process.env.JwtKey == undefined) {
      await getJWTKey();
    }

    const PUBLIC_KEY = process.env.JwtKey || '';
    const ACCESS_TOKEN = req.cookies['access-token'];

    if (PUBLIC_KEY == '') {
      throw new Error('Error retrieving JWT validator');
    }

    try {
      const decoded = jwt.verify(ACCESS_TOKEN, PUBLIC_KEY);
      if (decoded != undefined && typeof decoded !== 'string') {
        res.locals['user-id'] = decoded['user-id'];
        next();
      } else {
        console.error('Decode returned undefined or is a string');
        res.status(500).send('Unable to process JWT token.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).send('Unable to verify JWT token.');
      } else if (error.name === 'TokenExpiredError') {
        res.status(401).send('JWT Token expired.');
      } else {
        console.error('Server Error', error);
        res.status(500).send('Server Error. Unable to process JWT token.');
      }
    }
  }
}

/**
 * Takes in user's inputs and attempts to remove non-conforming entries.
 *
 * This is written to account for users who may utilize things like
 * Postman or Burp to send malformed requests. For example, if a user
 * tries to select the non-existent 'Mein Leben' difficulty, it will
 * default to a random difficulty. Or if the user attempts to
 * select the question category 'toothpaste', that category will be removed.
 * @param userInput - User's input.
 * @param userInput.complexity - User's preference for difficulty.
 * @param userInput.categories - User's preference for categories.
 * @param userInput.language - User's preference for language.
 * @returns Properly formatted and validated user input.
 */
export function parseUserInput(userInput: {
  complexity: string;
  categories: string[];
  language: string;
}): MatchingUserInput {
  /**
   * A valid json is one with
   * {
   * "complexity" : "Easy", // Note Case capitalization
   * "categories" : [<any from questionType>],
   * "language" : <one from languageType>
   * }.
   */
  const validData: MatchingUserInput = {
    complexity: '',
    categories: [],
    language: '',
  };

  const conformedComplexity = ['Easy', 'Medium', 'Hard'];

  // No difficulty or wrong difficulty
  if (
    userInput.complexity == undefined ||
    !conformedComplexity.includes(userInput.complexity)
  ) {
    // select 1 difficulty randomly
    validData.complexity =
      conformedComplexity[
        Math.floor(Math.random() * conformedComplexity.length)
      ];
  } else {
    validData.complexity = userInput.complexity;
  }

  // No language or wrong language
  // Choose one language, arbitrarily chose python 3.
  if (
    userInput.language == undefined ||
    !LanguageType.get().includes(userInput.language)
  ) {
    validData.language = 'python3';
  } else {
    validData.language = userInput.language;
  }

  // No questions or wrong questions. Select all.
  if (Array.isArray(userInput.categories)) {
    // Filter out invalids
    const validQuestions: string[] = userInput.categories.filter(
      (type: string) => QuestionType.get().includes(type),
    );
    if (validQuestions.length == 0) {
      validData.categories = QuestionType.get();
    } else {
      validData.categories = validQuestions;
    }
  } else {
    validData.categories = QuestionType.get();
  }

  return validData;
}

/**
 * Retrieve public-key from user-service to verify JWT tokens.
 * Stores it in environment.
 */
export async function getJWTKey() {
  const url =
    configuration.userServiceURL + '/' + 'user-service/access-token-public-key';
  try {
    const keyCall = await axios.get(url);
    process.env.JwtKey = keyCall.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.status == 404) {
        throw new Error('Unable to reach user service or resource turned 404.');
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
}
