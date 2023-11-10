/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  /** Variable names that are found in environment.  */

  private static readonly _envMongoURI: string = 'MS_MONGO_URI';

  private static readonly _envMongoAdminUser: string = 'MS_MONGO_ADMIN_USER';
  private static readonly _envMongoAdminPass: string = 'MS_MONGO_ADMIN_PASS';

  private static readonly _envMongoUser: string = 'MS_MONGO_USER';
  private static readonly _envMongoPass: string = 'MS_MONGO_PASS';

  private static readonly _envMongoDB: string = 'MS_MONGO_DB';
  private static readonly _envMongoCollection: string = 'MS_MONGO_COLLECTION';

  /** Copies from Environment and save into these variable names. */

  /**
   * Connection to the mongo database.
   */
  public readonly mongoURI: string;

  /**
   * Username required to create the database user.
   */
  public readonly mongoUser: string;
  /**
   * Password required to create the database user.
   */
  public readonly mongoPass: string;
  /**
   * The database to be created.
   */
  public readonly mongoDB: string;
  /**
   * The collection to be created.
   */
  public readonly mongoCollection: string;
  /**
   * The admin user used to create the user account.
   */
  public readonly mongoAdmUser: string;
  /**
   * The admin password used to create the user account.
   */
  public readonly mongoAdmPass: string;

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
      this.mongoUser = 'user';
      this.mongoPass = 'password';
      this.mongoDB = 'matchinginfo';
      this.mongoCollection = 'queueinfo';
      this.mongoAdmUser = 'admin';
      this.mongoAdmPass = 'password';
      this.mongoURI = `mongodb://${this.mongoAdmUser}:${this.mongoAdmPass}@localhost:27017`;
    } else {
      this.mongoURI = this._getEnvAsString(env, Config._envMongoURI);
      this.mongoUser = this._getEnvAsString(env, Config._envMongoUser);
      this.mongoPass = this._getEnvAsString(env, Config._envMongoPass);
      this.mongoDB = this._getEnvAsString(env, Config._envMongoDB);
      this.mongoCollection = this._getEnvAsString(
        env,
        Config._envMongoCollection,
      );
      this.mongoAdmUser = this._getEnvAsString(env, Config._envMongoAdminUser);
      this.mongoAdmPass = this._getEnvAsString(env, Config._envMongoAdminPass);
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
   * Retrieves the int value of key from Environments.
   * @param env - NodeJS.ProcessEnv.
   * @param key - The environment variable name.
   * @returns The int value of the variable.
   * @throws Error if unable to process the key.
   */
  private _getEnvAsInt(env: NodeJS.ProcessEnv, key: string): number {
    if (env[key] !== undefined) {
      const ret = this._parseInt(env[key]);
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

  /**
   * Returns undefined if Integer is not a number or undefined.
   * @param raw - The string to be parsed.
   * @returns The string or undefined.
   */
  private _parseInt(raw: string | undefined): number | undefined {
    if (raw === undefined) {
      return undefined;
    }

    const val: number = parseFloat(raw);
    if (isNaN(val) || !Number.isInteger(val)) {
      return undefined;
    }

    return val;
  }
}
