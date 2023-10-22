/**
 * @file Defines {@link languageType}.
 */

/**
 * Language Type should contain the programming languages stored in the Question service.
 */
export default class languageType {
  static lTypes: string[] = ['Nil', 'C', 'Python', 'Java'];

  /**
   * Queries question service for the languages that are supported.
   */
  public static update(): void {
    languageType.lTypes = languageType.lTypes;
  }
}
