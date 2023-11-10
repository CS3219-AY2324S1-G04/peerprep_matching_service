// eslint-disable-next-line @typescript-eslint/naming-convention
import Config from './config';
// eslint-disable-next-line @typescript-eslint/naming-convention
import MongoClient from './mongo';

/**
 * @file Start point of script.
 */
new MongoClient().run(new Config(process.env));
