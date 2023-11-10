/**
 * @file Start point of script.
 */
import Config from './dataStructs/config';
import MongoClient from './service/mongo';

/**
 * @file Entry point to the program.
 */

new MongoClient().run(new Config(process.env));
