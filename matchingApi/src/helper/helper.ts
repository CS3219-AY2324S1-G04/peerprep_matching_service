import axios, { AxiosError } from 'axios';
import express, { NextFunction, Request, Response } from 'express';

import Config from '../dataStructs/config';
import languageType from '../dataStructs/languageType';
import questionType from '../dataStructs/questionType';
import jwt from 'jsonwebtoken'
import { matchingUserInput } from './matchingUserInput';

const config = Config.get();

/**
 * Middleman that verifies if user's access-token is legitimate, extracts information from JWT and
 * save the user-id into response locals as user-id.
 * 
 * @param req The request received
 * @param res The response to send
 * @param next Part of Express middleman
 */
export async function verifyJwt(req: Request, res: Response, next: NextFunction) {
  // No Token case
  if (!req.cookies['access-token']) {
    res.status(401).send({
      message: "No access-token",
    })
  } else {
    // No Pub key case (shouldn't hit here but not impossible)
    if (process.env.JwtKey == undefined) {
      await getJWTKey;
    }
    
    const PUBLIC_KEY = process.env.JwtKey || '';
    const ACCESS_TOKEN = req.cookies['access-token']

    if (PUBLIC_KEY == '') {
      throw new Error('Error retrieving JWT validator')
    }

    try {
      const decoded = jwt.verify(ACCESS_TOKEN, PUBLIC_KEY)
      if (decoded != undefined && typeof decoded !== 'string') {
        res.locals['user-id'] = decoded['user-id']
        next()
      } else {
        console.error("Decode returned undefined or is a string")
        res.status(500).send("Unable to process JWT token.");
      }
    } catch (error : any) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).send("Unable to verify JWT token.");
      } else if (error.name === 'TokenExpiredError') {
        res.status(401).send("JWT Token expired.");
      } else {
        console.error("Server Error", error)
        res.status(500).send("Server Error. Unable to process JWT token.");
      }
    }
  }
}

/**
 * Takes in user's inputs and attempts to remove non-conforming entries.
 * 
 * This is written to account for users who may utilize things like Postman or Burp to send
 * malformed requests. For example, if a user tries to select the non-existent 'Mein Leben' difficulty, 
 * it will default to a random difficulty. Or if the user attempts to select the question category 
 * 'toothpaste', that category will be removed.
 * 
 * @param userInput Json formatted user input.
 * @returns 
 */
export function parseUserInput(userInput: any): matchingUserInput {
  /**
   * A valid json is one with
    {
        "complexity" : "Easy", // Note Case capitalization 
        "categories" : [<any from questionType>], 
        "language" : <one from languageType>
    }
   */
  let validData: matchingUserInput = {
    complexity: '',
    categories: [],
    language: '',
  };

  const _complexity = ['Easy', 'Medium', 'Hard'];

  // No difficulty or wrong difficulty
  // Note: userInput.difficulty to change once front end's one changes to complexity
  if (
    userInput.difficulty == undefined ||
    !_complexity.includes(userInput.difficulty)
  ) {
    // select 1 difficulty randomly
    validData.complexity = _complexity[Math.floor(Math.random() * _complexity.length)];
  } else {
    validData.complexity = userInput.difficulty;
  }

  // No language or wrong language
  // Choose one language, arbitrarily chose python 3.
  if (
    userInput.language == undefined ||
    !languageType.get().includes(userInput.language)
  ) {
    const lang = languageType.get();
    validData.language = 'python3' //lang[Math.floor(Math.random() * lang.length)];
  }

  // No questions or wrong questions. Select all.
  if (Array.isArray(userInput.categories)) {
    // Filter out invalids
    const validQuestions: string[] = userInput.categories.filter(
      (type: string) => questionType.get().includes(type),
    );
    if (validQuestions.length == 0) {
      validData.categories = questionType.get();
    } else {
      validData.categories = validQuestions;
    }
  } else {
    validData.categories = questionType.get();
  }

  return validData;
}

/**
 * Retrieve public-key from user-service to verify JWT tokens.
 * Stores it in environment. 
 */
export async function getJWTKey() {
  const url = config.userServiceURL + '/' + 'user-service/access-token-public-key'
  try {
    const keyCall = await axios.get(url);
    process.env.JwtKey = keyCall.data
  } catch (error) {
    console.error(error)
    if (axios.isAxiosError(error) && error.response) {
      if (error.status == 404) {
        throw new Error("Unable to reach user service or resource turned 404.")
      } else { throw error }
    } else {
      throw error;
    }
  }
}

