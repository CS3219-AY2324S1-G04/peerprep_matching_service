/**
 * @file Defines {@link redisClient}
 */
import { Redis } from 'ioredis';

import Config from '../dataStructs/config';

export enum dbIndex {
  easy = 0,
  medium = 1,
  hard = 2,
}

/**
 * @deprecated
 *
 * Initial exploration involved using redis as a queue.
 * Why:
 * 1. We don't actually need Queue to be saved
 * 2. Lessen memory load of the server
 *
 * However:
 * 1. Unable to do a SELECT WHERE <CONDITION>
 * 2. Unable to mutex a particular entry
 *
 * But:
 * 1. Not deleting this file allows us to reuse this later if needed
 * 2. For example: If Matching service is maintaining session of ROOM, then
 * 2.1 Matching service will delete rooms that have > X minutes inactivity
 * 2.2 Collab service will need to continuously send updates (activity) to maintain the session lifetime
 * 2.3 To prevent overload, temporarily cache with Y minutes TTL is established
 * 2.4 Collab checks if cache exists, if it does do nothing, if not,
 *     send update to matching service to reset X minutes inactivity.
 *     create cache.
 */
export default class redisClient {
  private static readonly config: Config = new Config();

  private static instance: redisClient | null = null;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      host: redisClient.config.redisHost,
      port: redisClient.config.redisPort,
      password: redisClient.config.redisPass,
    });

    this.redis.on('connect', () => {
      console.log(
        `Connected to Redis at ${redisClient.config.redisHost}:${redisClient.config.redisPort}`,
      );
      this.redis
        .flushall()
        .then(() => {
          console.log('All keys in all databases have been deleted.');
        })
        .catch((err) => {
          console.error('Error deleting keys:', err);
        });
    });

    this.redis.on('error', (error) => {
      console.log('!Error connecting to Redis:', error);
      throw error;
    });
  }

  /**
   *
   * @returns returns instance of redis connection
   */
  public static getInstance(): redisClient {
    if (!redisClient.instance) {
      redisClient.instance = new redisClient();
    }
    return redisClient.instance;
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value, 'EX', redisClient.config.redisExpiry);
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
}
