/**
 * @file Defines {@link QuestionType}.
 */
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from './config';

/**
 * Question Type should contain the question types stored
 * in the Question service.
 */
export default class QuestionType {
  private static _configuration = Config.get();
  private static _lastUpdate = new Date(Date.now());

  private static _questionTypes: string[] = [
    'Array',
    'Binary Search',
    'Bit Manipulation',
    'Breadth-First Search',
    'Depth-First Search',
    'Design',
    'Divide and Conquer',
    'Doubly-Linked List',
    'Dynamic Programming',
    'Graph',
    'Greedy',
    'Hash Function',
    'Hash Table',
    'Heap (Priority Queue)',
    'Linked List',
    'Math',
    'Memoization',
    'Merge Sort',
    'Monotonic Queue',
    'Queue',
    'Recursion',
    'Rolling Hash',
    'Simulation',
    'Sliding Window',
    'Stack',
    'String',
    'Topological Sort',
    'Two Pointers',
  ];

  /**
   * Get the latest question types from question-service or
   * whatever that is stored in here.
   * @returns Question-types.
   */
  public static get(): string[] {
    if (
      new Date().getTime() - QuestionType._lastUpdate.getTime() >
      10 * 60 * 1000
    ) {
      QuestionType.update();
      QuestionType._lastUpdate = new Date(Date.now());
    }

    return QuestionType._questionTypes;
  }

  /**
   * Queries question service for the type of questions that are supported.
   */
  public static async update(): Promise<void> {
    const baseUrl =
      QuestionType._configuration.questionServiceURL +
      '/question-service/categories';

    try {
      const query = await axios.get(baseUrl);
      if (query.data.data) {
        QuestionType._questionTypes = query.data.data;
        console.log('Updated Questions');
      } else {
        throw new Error(
          'question-service at /question-service/categories does not return expected results',
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Questions Type: Error while contacting question-server');
        console.error(error);
      } else {
        console.error('Unknown server error');
        console.error(error);
      }
    }
  }
}
