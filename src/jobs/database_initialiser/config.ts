/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  /** Variable names that are found in environment.  */

  private static readonly _envMongoURI: string = 'MS_MONGO_URI';
  private static readonly _envMongoCollection: string = 'MS_MONGO_COLLECTION';

  /** Copies from Environment and save into these variable names. */

  /**
   * Connection to the mongo database.
   */
  public readonly mongoURI: string;
  /**
   * The collection to be created.
   */
  public readonly mongoCollection: string;

  /**
   * Constructs a Config and assigns to each field, the value stored in their
   * corresponding environment variable. If an environment variable does not
   * have a valid value, assigns a default value instead.
   * @param env - Environment variables.
   * @param debug - For non docker mode.
   */
  public constructor(
    env: NodeJS.ProcessEnv = process.env,
    debug: boolean = false,
  ) {
    if (debug) {
      this.mongoURI = `mongodb://admin:password@localhost:27017`;
      this.mongoCollection = 'queueinfo';
    } else {
      this.mongoCollection = this._getEnvAsString(
        env,
        Config._envMongoCollection,
      );
      this.mongoURI = this._getEnvAsString(env, Config._envMongoURI);
    }
  }

  /**
   * Retrieves the string value of key from Environments.
   * @param env - NodeJS.ProcessEnv.
   * @param key - The environment variable name.
   * @returns The string value of the variable.
   * @throws Error if unable to process the key.
   */
  private _getEnvAsString(env: NodeJS.ProcessEnv, key: string): string {
    if (env[key] !== undefined) {
      const ret = this._parseString(env[key]);
      if (ret !== undefined) {
        return ret;
      }
    }
    throw Error(`${key} is not set in env or is not a string.`);
  }

  /**
   * Returns undefined if string is empty or undefined.
   * @param raw - The string to be parsed.
   * @returns The string or undefined.
   */
  private _parseString(raw: string | undefined): string | undefined {
    if (raw === undefined || raw === '') {
      return undefined;
    }
    return raw;
  }
}
