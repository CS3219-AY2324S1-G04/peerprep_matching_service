/**
 * @file Defines {@link MongoClient}
 */
import mongoose, { ConnectOptions } from 'mongoose';
import Config from '../dataStructs/config';

/** Represents the connection to a mongo instance. */
export default class mongoClient {

  public run(config: Config): void {
    mongoose.connect(`mongodb://${config.mongoAdmUser}:${config.mongoAdmPass}@${config.mongoHost}:${config.mongoPort}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 30000,
      // autoReconnect: false, // Disable automatic reconnection
      // idleTimeout: 10000,   // Disconnect after 10 seconds of inactivity
    } as ConnectOptions);

    const db = mongoose.connection;

    db.on('error', (error) => {
      if (error.name === 'MongoError') {
        if (error.codeName === 'AuthenticationFailed') {
          throw error(`Authentication failed for ${config.mongoHost}:${config.mongoPort}. Please check if supplied MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD is a correct and is a root account`)
        } else {
          throw error('Uncaught MongoError: ', error)
        }
      } else if (error.name == 'MongooseServerSelectionError') {
        throw error(`Unable to connect to ${config.mongoHost}:${config.mongoPort} within reasonable amount of time.`)
      } else {
        throw error('Uncaught Error: ', error)
      }
    });

    db.once('open', async () => {
      console.log(`Connected to mongodb://<CREDENTIALS>@${config.mongoHost}:${config.mongoPort}`);

      // Create or access the "matchinginfo" database
      // Equivalent of saying on mongosh 'use <MS_MONGO_DB`'
      // or 'db.getSiblingDB(<MS_MONGO_DB>)'
      const database = db.useDb(`${config.mongoDB}`);

      // Placed items in promises to ensure that they are all completed before disconnect happens
      const promises = [this.createUser(config, database), this.createCollection(config, database), this.setTTL(config, database)]
      await Promise.all(promises);

      // Disconnect once everything is complete
      console.log("MongoInit completed all tasks. You may delete this initialization container.")
      db.close()
    });
  }

  /**
     * Creates the user in mongoDB which matching-service-api access.
     * 
     * That is to grant read-write access to mongo via
     * `mongodb://<MS_MONGO_USER>:<MS_MONGO_PASS>@<MS_MONGO_HOST>:<MS_MONGO_PORT>/<MS_MONGO_DB>`
     * 
     * Essentially, this is what the code is doing:
     * `if (db.getUser(<MS_MONGO_USER>) == null)`
     * `db.createUser({ user: <MS_MONGO_USER>, pwd: <MS_MONGO_PASS>, roles: [ "readWrite" ] }`
     * 
     * @param req The authenticated Mongo Connection that has root level privileges.
     */
  private async createUser(config: Config, req: mongoose.Connection) {
    console.log(' -- Account setup start --')
    var query = await req.db.command({ usersInfo: { user: `${config.mongoUser}`, db: `${config.mongoDB}` } });

    if (query.users != undefined) {
      if (query.users.length === 0) {
        var user = await req.db.command({
          createUser: `${config.mongoUser}`,
          pwd: `${config.mongoPass}`,
          roles: [
            { "db": `${config.mongoDB}`, "role": "readWrite" },
          ]
        });
        if (user.ok) {
          console.log("Account for API service has been created!")
        }
      } else {
        console.log("Account already exists.")
      }
    }
    console.log(' -- Account setup complete --')
  }

  /**
   * Creates the collection in mongoDB which matching-service-api writes into.
   * 
   * Technically, this is not required, however, can be used to force shape the database.
   * This will throw error if you are trying to replace a collection.
   * See uncommented code. 
   * 
   * @param req The authenticated Mongo Connection that has root level privileges.
   */
  private async createCollection(config: Config, req: mongoose.Connection, dbAutoValidate: boolean = false) {
    console.log(' -- Collection setup start --')
    /**
     * The following is only if strict database is desired.
     * Not recommended unless unlikely to alter database.
     * Feel free to alter schema as required.
     */
    if (dbAutoValidate) {
      await req.createCollection(`${config.mongoCollection}`, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userID'],
            properties: {
              userID: {
                bsonType: 'string',
                description: 'must be a string',
              },
              difficulty: {
                bsonType: 'string',
                enum: ['Easy', 'Medium', 'Hard'],
                description: 'must be one of "Easy", "Medium", "Hard"',
              },
              categories: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'must be an array of strings',
              },
              language: {
                bsonType: 'string',
                description: 'must be a string',
              },
              expireAt: {
                bsonType: 'date',
                description: 'must be a date',
              },
            },
          },
        },
      })
        .then(() => { console.log("Collection Created!") })
        .catch((error) => {
          if (error.codeName == 'NamespaceExists') {
            console.error('Existing Collection exists and is configured differently from what initialization script is trying configure.')
            console.error(error.message)
          } else {
            console.error('Uncaught error')
            console.error(error)
          }
        });

      // await req.createCollection(`languagetype`, undefined)
      //   .then(() => console.log("Collection created or Exists"))
      //   .catch((error) => {
      //     if (error.codeName == 'NamespaceExists') {
      //       console.error('Existing Collection exists for language')
      //       console.error(error.message)
      //     } else {
      //       console.error('Uncaught error')
      //       console.error(error)
      //     }
      //   });

      // await req.createCollection(`questiontype`, undefined)
      //   .then(() => console.log("Collection created or Exists"))
      //   .catch((error) => {
      //     if (error.codeName == 'NamespaceExists') {
      //       console.error('Existing Collection exists for questions')
      //       console.error(error.message)
      //     } else {
      //       console.error('Uncaught error')
      //       console.error(error)
      //     }
      //   });
    } else {
      await req.createCollection(`${config.mongoCollection}`, undefined)
        .then(() => console.log("Collection created or Exists"))
        .catch((error) => {
          if (error.codeName == 'NamespaceExists') {
            console.error('Existing Collection exists and is configured differently from what initialization script is trying configure.')
            console.error(error.message)
          } else {
            console.error('Uncaught error')
            console.error(error)
          }
        });

      // Some thought was given into turning this into a cache instead. 
      // await req.createCollection(`languagetype`, undefined)
      //   .then(() => console.log("Collection created or Exists"))
      //   .catch((error) => {
      //     if (error.codeName == 'NamespaceExists') {
      //       console.error('Existing Collection exists for language')
      //       console.error(error.message)
      //     } else {
      //       console.error('Uncaught error')
      //       console.error(error)
      //     }
      //   });

      // await req.createCollection(`questiontype`, undefined)
      //   .then(() => console.log("Collection created or Exists"))
      //   .catch((error) => {
      //     if (error.codeName == 'NamespaceExists') {
      //       console.error('Existing Collection exists for questions')
      //       console.error(error.message)
      //     } else {
      //       console.error('Uncaught error')
      //       console.error(error)
      //     }
      //   });
    }
    console.log(' -- Collection setup end --')
  }

  private async setTTL(config: Config, req: mongoose.Connection) {

    console.log(' -- TLL setup start --')
    req.collection(`${config.mongoCollection}`).createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
      .then(() => { console.log('Created index on "expireAt" for automatic expiration'); })
      .catch((error) => { console.error(`Error creating index on 'expireAt': ${error}`); })

    // req.collection(`languagetype`).createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
    //   .then(() => { console.log('Created index for language "expireAt" for automatic expiration'); })
    //   .catch((error) => { console.error(`Error creating index on 'expireAt': ${error}`); })

    // req.collection(`questiontype`).createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
    //   .then(() => { console.log('Created index for question "expireAt" for automatic expiration'); })
    //   .catch((error) => { console.error(`Error creating index on 'expireAt': ${error}`); })

    console.log(' -- TLL setup end --')
  }

}
