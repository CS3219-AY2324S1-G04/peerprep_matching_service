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

  private static instance: Config | undefined;

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

  public readonly isDevEnv: boolean;

  private readonly defaultMongoHost: string = '127.0.0.1';
  private readonly defaultMongoPort: number = 27018;
  private readonly defaultMongoUser: string = 'user';
  private readonly defaultMongoPass: string = 'password';
  private readonly defaultMongoDB: string = 'matchinginfo' ;
  private readonly defaultMongoCollection: string = 'queueinfo';

  private readonly defaultMongoQueueExpiry: number = 30 * 1000;
  private readonly defaultExpressPort: number = 9002;
  
  private readonly defaultUserServiceURL: string = '127.0.0.1';
  private readonly defaultQuestionServiceURL: string = '127.0.0.1';
  private readonly defaultRoomServiceURL: string = '127.0.0.1';

  /**
   * Constructs a Config and assigns to each field, the value stored in their
   * corresponding environment variable. If an environment variable does not
   * have a valid value, assigns a default value instead.
   *
   * @param env - Environment variables.
   */
  private constructor(env: NodeJS.ProcessEnv = process.env) {
    // Mongo
    this.mongoHost =
      Config._parseString(env[Config.envVarMongoHost]) ?? this.defaultMongoHost;
    this.mongoPort = Config._parseInt(env[Config.envVarMongoPort]) ?? this.defaultMongoPort;
    this.mongoUser = Config._parseString(env[Config.envVarMongoUser]) ?? this.defaultMongoUser;
    this.mongoPass = Config._parseString(env[Config.envVarMongoPass]) ?? this.defaultMongoPass;
    this.mongoDB =
      Config._parseString(env[Config.envVarMongoDB]) ?? this.defaultMongoDB;
    
    this.mongoCollection =
      Config._parseString(env[Config.envVarMongoCollection]) ?? this.defaultMongoCollection;

    this.mongoQueueExpiry =
      Config._parseInt(env[Config.envVarMongoQueueExpiry]) ?? this.defaultMongoQueueExpiry;

    this.expressPort = Config._parseInt(env[Config.envVarExpressPort]) ?? this.defaultExpressPort;

    this.isDevEnv = env[Config.appModeEnvVar] === 'development';

    // To uncomment once ready for docker
    // let _a = env[Config.envUserServiceHost]
    // let _b = env[Config.envUserServicePort]
    // if (_a !== undefined && _b !== undefined) {
    //   let _c = Config._parseString(_a)
    //   let _d = _b
    //   if (_c !== undefined && _d !== undefined) {
    //     this.userServiceURL = `http://${_c}:${_d}`;
    //   } else {
    //     throw new Error("User service is not defined well in the envs")
    //   }
    // } else {
    //   throw new Error("User service is not defined well in the envs") }

    // _a = env[Config.envQuestionServiceHost]
    // _b = env[Config.envQuestionServicePort]
    // if (_a !== undefined && _b !== undefined) {
    //   let _c = Config._parseString(_a)
    //   let _d = _b
    //   if (_c !== undefined && _d !== undefined) {
    //     this.questionServiceURL = `http://${_c}:${_d}`;
    //   } else {
    //     throw new Error("Question service is not defined well in the envs")
    //   }
    // }else {
    //   throw new Error("Question service is not defined well in the envs") }

    // _a = env[Config.envRoomServiceHost]
    // _b = env[Config.envRoomServicePort]
    // if (_a !== undefined && _b !== undefined) {
    //   let _c = Config._parseString(_a)
    //   let _d = _b
    //   if (_c !== undefined && _d !== undefined) {
    //     this.roomServiceURL = `http://${_c}:${_d}`;
    //   } else {
    //     throw new Error("Room service is not defined well in the envs")
    //   }
    // }else {
    //   throw new Error("Room service is not defined well in the envs") }

    const userServiceHost =
      Config._parseString(env[Config.envUserServiceHost]) ?? 'localhost';
    const userServicePort =
      Config._parseInt(env[Config.envUserServicePort]) ?? 9000;
    this.userServiceURL = `http://${userServiceHost}:${userServicePort}`;

    const questionServiceHost =
      Config._parseString(env[Config.envQuestionServiceHost]) ?? 'localhost';
    const questionServicePort =
      Config._parseInt(env[Config.envQuestionServicePort]) ?? 9001;

    this.questionServiceURL = `http://${questionServiceHost}:${questionServicePort}`;

    const roomServiceHost =
      Config._parseString(env[Config.envRoomServiceHost]) ?? 'localhost';
    const roomServicePort =
      Config._parseInt(env[Config.envRoomServicePort]) ?? 9003;

    this.roomServiceURL = `http://${roomServiceHost}:${roomServicePort}`;
  }

  public static getInstance(): Config {
    if (Config.instance == undefined) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Returns undefined if string is empty or undefined.
   *
   * @param raw - The string to be parsed
   * @returns The string or undefined
   */
  private static _parseString(raw: string | undefined): string | undefined {
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
  private static _parseInt(raw: string | undefined): number | undefined {
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
