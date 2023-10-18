/**
 * @file Defines {@link Config}.
 */

/** Represents the app's configs. */
export default class Config {
  /** Variable names that are found in environment  */
  private static readonly envVarMongoHost: string = 'MONGO_HOST';
  private static readonly envVarMongoPort: string = 'MONGO_PORT';
  private static readonly envVarMongoUser: string = 'MONGO_USER';
  private static readonly envVarMongoPass: string = 'MONGO_PASS';
  private static readonly envVarMongoDB: string = 'MONGO_DB';
  private static readonly envVarMongoQueueExpiry: string = 'QUEUE_EXPIRY';

  private static readonly envVarExpressPort: string = 'EXPRESS_PORT';

  private static readonly envUserServiceHost: string = 'SERVICE_USER_HOST';
  private static readonly envUserServicePort: string = 'SERVICE_USER_PORT';
  private static readonly envQuestionServiceHost: string =
    'SERVICE_QUESTION_HOST';
  private static readonly envQuestionServicePort: string =
    'SERVICE_QUESTION_PORT';

  private static instance: Config | undefined;

  /** Copies from Environment and save into these variable names. */
  public readonly mongoHost: string;
  public readonly mongoPort: number;
  public readonly mongoUser: string;
  public readonly mongoPass: string;
  public readonly mongoDB: string;
  public readonly mongoQueueExpiry: number;

  public readonly expressPort: number;
  public readonly psk: string | undefined;

  public readonly userServiceURI: string | undefined;
  public readonly questionServiceURI: string | undefined;

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
      Config._parseString(env[Config.envVarMongoHost]) ?? '127.0.0.1';
    this.mongoPort = Config._parseInt(env[Config.envVarMongoPort]) ?? 27018;
    this.mongoUser = Config._parseString(env[Config.envVarMongoUser]) ?? '';
    this.mongoPass = Config._parseString(env[Config.envVarMongoPass]) ?? '';
    this.mongoDB =
      Config._parseString(env[Config.envVarMongoDB]) ?? 'matchingservice';
    this.mongoQueueExpiry =
      Config._parseInt(env[Config.envVarMongoQueueExpiry]) ?? 30 * 1000;

    this.expressPort = Config._parseInt(env[Config.envVarExpressPort]) ?? 3001;

    const userServiceHost =
      Config._parseString(env[Config.envUserServiceHost]) ?? '127.0.0.1';
    const userServicePort =
      Config._parseInt(env[Config.envUserServicePort]) ?? 3000;
    this.userServiceURI = `http://${userServiceHost}:${userServicePort}`;

    const questionServiceHost =
      Config._parseString(env[Config.envQuestionServiceHost]) ?? 'localhost';
    const questionServicePort =
      Config._parseInt(env[Config.envQuestionServicePort]) ?? 9001;

    this.questionServiceURI = `http://${questionServiceHost}:${questionServicePort}`;
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
