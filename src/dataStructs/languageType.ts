/**
 * @file Defines {@link LanguageType}.
 */
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from './config';

/**
 * Language Type should contain the programming languages stored
 * in the Question service.
 *
 * This replication is not for replication sake, but rather for
 * validation of the user-input. Such validation could be forgone
 * if the matching system is written in a different way.
 */
export class LanguageType {
  private static _configuration = Config.get();
  private static _lastUpdate = new Date(Date.now());

  private static _languageTypes: string[] = [
    'cpp',
    'java',
    'python',
    'python3',
    'c',
    'csharp',
    'javascript',
    'typescript',
    'php',
    'swift',
    'kotlin',
    'dart',
    'golang',
    'ruby',
    'scala',
    'rust',
    'racket',
    'erlang',
    'elixir',
  ];

  /**
   * Retrieves the latest languages from question-service or
   * whatever that is stored in here.
   * @returns The latest languages.
   */
  public static get(): string[] {
    if (
      new Date().getTime() - LanguageType._lastUpdate.getTime() >
      10 * 60 * 1000
    ) {
      LanguageType.update();
      LanguageType._lastUpdate = new Date(Date.now());
    }
    return LanguageType._languageTypes;
  }

  /**
   * Queries question service for the languages that are supported.
   */
  public static async update(): Promise<void> {
    const baseUrl =
      LanguageType._configuration.questionServiceURL +
      '/question-service/languages';

    try {
      const query = await axios.get(baseUrl);
      if (query.data.data) {
        console.log(query.data.data);
        const langSlugs: string[] = query.data.data.map(
          (item: { language: string; langSlug: string }) => item['langSlug'],
        );

        if (langSlugs.length === 0) {
          console.log('Somehow question slugs returned empty');
        } else {
          LanguageType._languageTypes = langSlugs;
          console.log('Updated Languages');
        }
      } else {
        throw new Error(
          'question-service at /question-service/languages does not return expected results',
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Language Type: Error while contacting question-server');
        console.error(error);
      } else {
        console.error('Unknown server error');
        console.error(error);
      }
    }
  }
}
