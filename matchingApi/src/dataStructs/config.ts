/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  /** Variable names that are found in environment.  */
  private static readonly _envMongoURI: string = 'MS_MONGO_URI';
  private static readonly _envMongoCollection: string = 'MS_MONGO_COLLECTION';

  private static readonly _envMongoQueueExpiry: string = 'QUEUE_EXPIRY';
  private static readonly _envExpressPort: string = 'MS_EXPRESS_PORT';

  private static readonly _envUserServiceHost: string = 'SERVICE_USER_HOST';
  private static readonly _envUserServicePort: string = 'SERVICE_USER_PORT';
  private static readonly _envQuestionServiceHost: string =
    'SERVICE_QUESTION_HOST';
  private static readonly _envQuestionServicePort: string =
    'SERVICE_QUESTION_PORT';
  private static readonly _envRoomServiceHost: string = 'SERVICE_ROOM_HOST';
  private static readonly _envRoomServicePort: string = 'SERVICE_ROOM_PORT';

  private static readonly _appModeEnvVar: string = 'NODE_ENV';

  /** Other variables. */
  private static _instance: Config;

  /** Copies from Environment and save into these variable names. */

  /**
   * Mongo URI
   * mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDB}.
   */
  public readonly mongoURI: string;

  /**
   *
   */
  public readonly mongoCollection: string;
  /**
   *
   */
  public readonly mongoQueueExpiry: number;

  /**
   *
   */
  public readonly expressPort: number;

  /**
   *
   */
  public readonly userServiceURL: string;
  /**
   *
   */
  public readonly questionServiceURL: string;
  /**
   *
   */
  public readonly roomServiceURL: string;

  /** Copies from Development variables */
  public readonly isDevEnv: boolean;

  /**
   * Constructs a Config and assigns to each field, the value stored in their
   * corresponding environment variable. If an environment variable does not
   * have a valid value, throws an error instead.
   *
   * Only enable localDev mode if running outside docker
   * (i.e. Npm run start:dev).
   * @param env - Location to find Environment variables.
   * @param localDev - Local testing switch (default false).
   */
  private constructor(
    env: NodeJS.ProcessEnv = process.env,
    localDev: boolean = false,
  ) {
    this.isDevEnv = env[Config._appModeEnvVar] === 'development';

    if (localDev) {
      // API
      this.expressPort = 9002;

      //Mongo
      this.mongoURI = 'mongodb://user:password@localhost:27018/matchinginfo';
      this.mongoCollection = 'queueinfos';

      this.mongoQueueExpiry = 30 * 1000;

      // Other Services
      const userServiceHost = 'localhost';
      const userServicePort = 9000;
      this.userServiceURL = `http://${userServiceHost}:${userServicePort}`;

      const questionServiceHost = 'localhost';
      const questionServicePort = 9001;
      this.questionServiceURL = `http://${questionServiceHost}:${questionServicePort}`;

      const roomServiceHost = 'localhost';
      const roomServicePort = 9003;
      this.roomServiceURL = `http://${roomServiceHost}:${roomServicePort}`;
    } else {
      // API
      this.expressPort = this._getEnvAsInt(env, Config._envExpressPort);

      //Mongo
      this.mongoURI = this._getEnvAsString(env, Config._envMongoURI);
      this.mongoCollection = this._getEnvAsString(
        env,
        Config._envMongoCollection,
      );

      this.mongoQueueExpiry = this._getEnvAsInt(
        env,
        Config._envMongoQueueExpiry,
      );

      // Other Services
      const userServiceHost = this._getEnvAsString(
        env,
        Config._envUserServiceHost,
      );
      const userServicePort = this._getEnvAsInt(
        env,
        Config._envUserServicePort,
      );
      this.userServiceURL = `http://${userServiceHost}:${userServicePort}`;

      const questionServiceHost = this._getEnvAsString(
        env,
        Config._envQuestionServiceHost,
      );
      const questionServicePort = this._getEnvAsInt(
        env,
        Config._envQuestionServicePort,
      );
      this.questionServiceURL = `http://${questionServiceHost}:${questionServicePort}`;

      const roomServiceHost = this._getEnvAsString(
        env,
        Config._envRoomServiceHost,
      );
      const roomServicePort = this._getEnvAsInt(
        env,
        Config._envRoomServicePort,
      );
      this.roomServiceURL = `http://${roomServiceHost}:${roomServicePort}`;
    }
  }

  /**
   * Instantiates config if not yet done, else returns the config.
   * @returns The current running configuration.
   */
  public static get(): Config {
    if (Config._instance === undefined) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  /**
   * For testing.
   */
  // public static resetInstance() : void {
  //   Config.instance = new Config();
  // }

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
