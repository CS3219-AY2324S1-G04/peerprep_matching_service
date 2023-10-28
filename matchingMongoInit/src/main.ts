import Config from "./dataStructs/config";
import mongoClient from "./service/mongo";

/**
 * @file Entry point to the program.
 */

new mongoClient().run(new Config(process.env))