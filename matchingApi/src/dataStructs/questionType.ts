/**
 * @file Defines {@link questionType}.
 */

/**
 * Question Type should contain the question types stored in the Question service.
 */
export default class questionType {
  static qTypes: string[] = [
    'Strings',
    'Algorithms',
    'Data Structures',
    'Searching',
    'Bit Manipulation',
    'Recursion',
    'Algorithms, Bit Manipulation',
    'Dynamic Programming',
    'Arrays',
    'Algorithms, Searching',
    'Sorting',
    'Data Structure',
  ];

  // Todo: Connect to Question Service to update the question types. And provide a way to access this.
  /**
   * Queries question service for the type of questions that are supported.
   */
  public static update(): void {
    // Temporary placeholder until able to connect to question service
    questionType.qTypes = questionType.qTypes;

    // Query question server to get question types
  }
}
