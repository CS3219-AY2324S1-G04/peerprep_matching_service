/**
 * @file Defines {@link languageType}.
 */
import axios from 'axios';
import Config from './config';

/**
 * Language Type should contain the programming languages stored in the Question service.
 * 
 * This replication is not for replication sake, but rather for validation of the user-input.
 * Such validation could be forgone if the matching system is written in a different way. 
 */
export default class languageType {

  private static config = Config.get()
  private static lastUpdate = new Date(Date.now());

  private static _languageTypes: string[] = ["cpp", "java", "python", "python3", "c",
    "csharp", "javascript", "typescript", "php", "swift", "kotlin", "dart", "golang", 
    "ruby", "scala", "rust", "racket", "erlang", "elixir"];

  /**
   * 
   * @returns The latest languages
   */
  public static get(): string[] {
    if ((new Date()).getTime() - languageType.lastUpdate.getTime() > 10 * 60 * 1000) {
      languageType.update();
      languageType.lastUpdate = new Date(Date.now());
    }
    return languageType._languageTypes;
  }

  /**
   * Queries question service for the languages that are supported.
   */
  public static async update(): Promise<void> {

    const baseUrl = languageType.config.questionServiceURL + '/question-service/languages';

    try {
      const query = await axios.get(baseUrl);
      if (query.data.data) {
        let langSlugs: string[] = query.data.data.map((item: { 'language': string, 'langSlug': string }) => item['langSlug'])
        // langSlugs.push("none")

        languageType._languageTypes = langSlugs;
        console.log('Updated Languages')
      } else {
        throw new Error("question-service at /question-service/languages does not return expected results");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Language Type: Error while contacting question-server");
        console.error(error)

      } else {
        console.error("Unknown server error");
        console.error(error);
      }
    }

  }
}
