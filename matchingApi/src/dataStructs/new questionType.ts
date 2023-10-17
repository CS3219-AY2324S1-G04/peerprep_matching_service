/**
 * @file Defines {@link questionType}.
 */
import axios from 'axios';

import Config from '../../../roomApi/src/dataStructs/config';

const config = Config.getInstance();

/**
 * Question Type should contain the question types stored in the Question service.
 */
export default class questionType {
  static qTypes: string[] = [
    'Algorithms',
    'Algorithms, Bit Manipulation',
    'Algorithms, Searching',
    'Arrays',
    'Bit Manipulation',
    'Data Structure',
    'Data Structures',
    'Dynamic Programming',
    'Recursion',
    'Searching',
    'Sorting',
    'Strings',
  ];

  // Todo: Connect to Question Service to update the question types. And provide a way to access this.
  /**
   * Queries question service for the type of questions that are supported.
   */
  public static async update(): Promise<void> {
    // Temporary placeholder until able to connect to question service

    const baseUrl = config.questionServiceURI + '/question-service/categories';

    try {
      const list_of_questions = await axios.get(baseUrl);

      if (list_of_questions.status === 500) {
        console.error(
          'Querying question server returned error',
          list_of_questions.status,
        );
        return;
      } else if (list_of_questions.status === 200) {
        // Able to talk to URI (Returns success) but returns no data
        if (list_of_questions.data.data == undefined) {
          console.error('Querying question server turned undefined results');
          return;
        } else {
          console.log(questionType.qTypes, list_of_questions.data.data);
          questionType.qTypes = list_of_questions.data.data;
          console.log('Retrieved all question categories');
        }
      }
    } catch (error) {
      console.error(error);
    }

    // Query question server to get question types
  }
}
