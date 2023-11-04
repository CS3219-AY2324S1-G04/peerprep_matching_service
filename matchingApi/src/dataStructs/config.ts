/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  /** Variable names that are found in environment  */
  private static readonly envVarMongoHost: string = 'MS_MONGO_HOST';
  private static readonly envVarMongoPort: string = 'MS_MONGO_PORT';
  private static readonly envVarMongoUser: string = 'MS_MONGO_USER';
  private static readonly envVarMongoPass: string = 'MS_MONGO_PASS';
  private static readonly envVarMongoDB: string = 'MS_MONGO_DB';
  private static readonly envVarMongoCollection: string = 'MS_MONGO_COLLECTION';

  private static readonly envVarMongoQueueExpiry: string = 'QUEUE_EXPIRY';
  private static readonly envVarExpressPort: string = 'MS_EXPRESS_PORT';

  private static readonly envUserServiceHost: string = 'SERVICE_USER_HOST';
  private static readonly envUserServicePort: string = 'SERVICE_USER_PORT';
  private static readonly envQuestionServiceHost: string =
    'SERVICE_QUESTION_HOST';
  private static readonly envQuestionServicePort: string =
    'SERVICE_QUESTION_PORT';
  private static readonly envRoomServiceHost: string = 'SERVICE_ROOM_HOST';
  private static readonly envRoomServicePort: string = 'SERVICE_ROOM_PORT';

  private static readonly appModeEnvVar: string = 'NODE_ENV';

  /** Copies from Environment and save into these variable names. */
  public readonly mongoHost: string;
  public readonly mongoPort: number;
  public readonly mongoUser: string;
  public readonly mongoPass: string;
  public readonly mongoDB: string;
  public readonly mongoCollection: string;
  public readonly mongoQueueExpiry: number;

  public readonly expressPort: number;

  public readonly userServiceURL: string;
  public readonly questionServiceURL: string;
  public readonly roomServiceURL: string;

  /** Copies from Development variables */
  public readonly isDevEnv: boolean;

  /** Other variables */
  private static instance: Config;

  /**
   * Constructs a Config and assigns to each field, the value stored in their
   * corresponding environment variable. If an environment variable does not
   * have a valid value, throws an error instead.
   * 
   * Only enable localDev mode if running outside docker (i.e. npm run start:dev)
   *
   * @param env - Location to find Environment variables.
   * @param localDev - Local testing switch (default false)
   */
  private constructor(env: NodeJS.ProcessEnv = process.env, localDev : boolean = false) {
    
    this.isDevEnv = env[Config.appModeEnvVar] === 'development';

    if (localDev) {
      // API
      this.expressPort = 9002;

      //Mongo
      this.mongoHost = 'localhost';
      this.mongoPort = 27018;
      this.mongoUser = 'user';
      this.mongoPass = 'password';
      this.mongoDB = 'matchinginfo'
      this.mongoCollection = 'queueinfo'
  
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
      this.expressPort = this.getEnvAsInt(env, Config.envVarExpressPort)
      
      //Mongo
      this.mongoHost = this.getEnvAsString(env, Config.envVarMongoHost)
      this.mongoPort = this.getEnvAsInt(env, Config.envVarMongoPort)
      this.mongoUser = this.getEnvAsString(env, Config.envVarMongoUser)
      this.mongoPass = this.getEnvAsString(env, Config.envVarMongoPass)
      this.mongoDB = this.getEnvAsString(env, Config.envVarMongoDB)
      this.mongoCollection = this.getEnvAsString(env, Config.envVarMongoCollection)
  
      this.mongoQueueExpiry = this.getEnvAsInt(env, Config.envVarMongoQueueExpiry)
  
      // Other Services
      const userServiceHost = this.getEnvAsString(env, Config.envUserServiceHost)
      const userServicePort = this.getEnvAsInt(env, Config.envUserServicePort)
      this.userServiceURL = `http://${userServiceHost}:${userServicePort}`;
      
      const questionServiceHost = this.getEnvAsString(env, Config.envQuestionServiceHost)
      const questionServicePort = this.getEnvAsInt(env, Config.envQuestionServicePort);
      this.questionServiceURL = `http://${questionServiceHost}:${questionServicePort}`;
 
      const roomServiceHost = this.getEnvAsString(env, Config.envRoomServiceHost);
      const roomServicePort = this.getEnvAsInt(env, Config.envRoomServicePort);
      this.roomServiceURL = `http://${roomServiceHost}:${roomServicePort}`;
    }
  }

  /**
   * Instantiates config if not yet done, else returns the config. 
   * 
   * @returns The current running configuration
   */
  public static get() : Config {
    if (Config.instance === undefined) {
      Config.instance = new Config()  
    }
    return Config.instance
  }

  /**
   * For testing
   */
  // public static resetInstance() : void {
  //   Config.instance = new Config();
  // }
  

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
