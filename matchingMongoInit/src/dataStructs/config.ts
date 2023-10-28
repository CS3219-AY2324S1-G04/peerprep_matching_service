/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  /** Variable names that are found in environment  */
  private readonly envVarMongoHost: string = 'MS_MONGO_HOST';
  private readonly envVarMongoPort: string = 'MS_MONGO_PORT';

  private readonly envVarMongoAdminUser: string = 'MS_MONGO_ADMIN_USER';
  private readonly envVarMongoAdminPass: string = 'MS_MONGO_ADMIN_PASS';

  private readonly envVarMongoUser: string = 'MS_MONGO_USER';
  private readonly envVarMongoPass: string = 'MS_MONGO_PASS';

  private readonly envVarMongoDB: string = 'MS_MONGO_DB';
  private readonly envVarMongoCollection: string = 'MS_MONGO_COLLECTION';


  /** Copies from Environment and save into these variable names. */
  public readonly mongoHost: string;
  public readonly mongoPort: number;
  public readonly mongoUser: string;
  public readonly mongoPass: string;
  public readonly mongoDB: string;
  public readonly mongoCollection: string;
  public readonly mongoAdmUser: string;
  public readonly mongoAdmPass: string;

  /**
   * Constructs a Config and assigns to each field, the value stored in their
   * corresponding environment variable. If an environment variable does not
   * have a valid value, assigns a default value instead.
  *
  * @param env - Environment variables.
  */
  public constructor(env: NodeJS.ProcessEnv = process.env, debug: boolean = false) {
    if (debug) {
      this.mongoHost = 'localhost'
      this.mongoPort = 27018
      this.mongoUser = 'user'
      this.mongoPass = 'password'
      this.mongoDB = 'matchinginfo'
      this.mongoCollection = 'queueinfo'
      this.mongoAdmUser = 'admin'
      this.mongoAdmPass = 'password'
    } else {
      this.mongoHost = this.getEnvAsString(env, this.envVarMongoHost);
      this.mongoPort = this.getEnvAsInt(env, this.envVarMongoPort);
      this.mongoUser = this.getEnvAsString(env, this.envVarMongoUser);
      this.mongoPass = this.getEnvAsString(env, this.envVarMongoPass);
      this.mongoDB = this.getEnvAsString(env, this.envVarMongoDB);
      this.mongoCollection = this.getEnvAsString(env, this.envVarMongoCollection)
      this.mongoAdmUser = this.getEnvAsString(env, this.envVarMongoAdminUser);
      this.mongoAdmPass = this.getEnvAsString(env, this.envVarMongoAdminPass);
    }
  }

  /**
   * Retrieves the string value of key from Environments.
   * 
   * @param env NodeJS.ProcessEnv
   * @param key The environment variable name
   * @returns The string value of the variable
   * @throws Error if unable to process the key
   */
  private getEnvAsString(env: NodeJS.ProcessEnv, key: any): string {
    if (env[key] !== undefined) {
      const ret = this._parseString(env[key])
      if (ret !== undefined) {
        return ret
      }
    }
    throw Error(`${key} is not set in env or is not a string.`)
  }

  /**
 * Retrieves the int value of key from Environments.
 * 
 * @param env NodeJS.ProcessEnv
 * @param key The environment variable name
 * @returns The int value of the variable
 * @throws Error if unable to process the key
 */
  private getEnvAsInt(env: NodeJS.ProcessEnv, key: any): number {
    if (env[key] !== undefined) {
      const ret = this._parseInt(env[key])
      if (ret !== undefined) {
        return ret
      }
    }
    throw Error(`${key} is not set in env or is not a string.`)
  }

  /**
   * Returns undefined if string is empty or undefined.
   *
   * @param raw - The string to be parsed
   * @returns The string or undefined
   */
  private _parseString(raw: string | undefined): string | undefined {
    if (raw === undefined || raw === '') {
      return undefined;
    }
    return raw;
  }

  /**
   * Returns undefined if Integer is not a number or undefined.
   *
   * @param raw - The string to be parsed
   * @returns The string or undefined
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
