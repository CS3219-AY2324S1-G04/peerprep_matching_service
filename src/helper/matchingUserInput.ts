/**
 * @file For matching.
 * Should follow the structure of the MongoDB collections closely.
 * More importantly, follow the question service closely.
 */
export interface MatchingUserInput {
  /**
   * Complexity of the question.
   */
  complexity: string;
  /**
   * Categories for the question/.
   */
  categories: string[];
  /**
   * Language for the question.
   */
  language: string;
}
