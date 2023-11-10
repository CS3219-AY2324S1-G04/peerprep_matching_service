/**
 * @file Start point of script.
 */
import Config from './dataStructs/config';
import MongoClient from './service/mongo';

new MongoClient().run(new Config(process.env));
