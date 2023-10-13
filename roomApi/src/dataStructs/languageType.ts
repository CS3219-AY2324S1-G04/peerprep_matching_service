/**
 * @file Defines {@link languageType}.
 */

/**
 * Language Type should contain the programming languages stored in the Question service.
 */
export default class languageType {
  static lTypes: string[] = ['c', 'python', 'java'];

  // Todo: Connect to Question Service to update the language types. And provide a way to access this.
  /**
   * Queries question service for the languages that are supported.
   */
  public static update(): void {
    // Temporary placeholder until able to connect to question service
    languageType.lTypes = languageType.lTypes;

    // Query question server to get question types
    // What if query server not postgresql?

    // Template idea:
    //   const questionTypes = await getQuestionTypes();
    //   const QuestionTypeEnum = {};

    //   questionTypes.forEach((type) => {
    //     QuestionTypeEnum[type.name] = type.id;
    //   });
  }
}
