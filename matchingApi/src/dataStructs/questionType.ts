/**
 * @file Defines {@link questionType}.
 */
import axios from 'axios';
import Config from './config';

/**
 * Question Type should contain the question types stored in the Question service.
 */
export default class questionType {

  private static config = Config.get();
  // private static lastUpdate = new Date(Date.now());

  private static _questionTypes: string[] = [
    "Array",
    "Binary Search",
    "Bit Manipulation",
    "Breadth-First Search",
    "Depth-First Search",
    "Design",
    "Divide and Conquer",
    "Doubly-Linked List",
    "Dynamic Programming",
    "Graph",
    "Greedy",
    "Hash Function",
    "Hash Table",
    "Heap (Priority Queue)",
    "Linked List",
    "Math",
    "Memoization",
    "Merge Sort",
    "Monotonic Queue",
    "Queue",
    "Recursion",
    "Rolling Hash",
    "Simulation",
    "Sliding Window",
    "Stack",
    "String",
    "Topological Sort",
    "Two Pointers"
  ];

  public static get(): string[] {
    return questionType._questionTypes;
  }

  /**
   * Queries question service for the type of questions that are supported.
   */
  public async update(): Promise<void> {
    const baseUrl = questionType.config.questionServiceURL + '/question-service/categories';

    try {
      const query = await axios.get(baseUrl);
      if (query.data.data) {
        questionType._questionTypes = query.data.data;
        console.log('Updated Questions')
      } else {
        throw new Error("question-service at /question-service/categories does not return expected results");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Questions Type: Error while contacting question-server");
        console.error(error)
      
      } else {
        console.error("Unknown server error");
        console.error(error);
      }
    }
  }
}
