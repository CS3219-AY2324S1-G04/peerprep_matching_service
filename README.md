# PeerPrep Matching Service

Handles the queuing and matching of users.

## Quickstart Guide

1. Clone this repository.
2. Build the npm images by running: `./run.bat`
3. Modify the `.env` file as per needed. Refer to [Environment Variables](#environment-variables) for the variables we suggest changing.
4. Create the docker containers by running: `docker compose up`
5. If you are using , initialize MongoDB by starting MongoDB and running the mongo initializer container.
6. If you have an existing MongoDB, please ensure that you edit the environment variables to allow the API to access the database.

## Environment Variables

### MONGO

#### My Own Mongo Server

If you are using your own mongo server, please change the following:

- `MONGO_USER` - Username of the Mongo database
- `MONGO_PASS` - Password of the Mongo database
- `MONGO_PORT` - Port of the Mongo database
- `MS_MONGO_DB` - Database to write to

And ensure that `MONGO_USER` `MONGO_PASS` has read-write access to `MS_MONGO_DB` on your server. You may see `initialization.txt` for what mongo-init does.

If you are not using simple credentials, you will need to edit the source code. 

#### Using the provided Mongo Container

If you are planning to use the provided docker container mongo server, please change the following:

** CRITICAL TO CHANGE **
- `MONGO_USER` - Username of the Mongo database
- `MONGO_PASS` - Password of the Mongo database
- `MS_MONGO_ADMIN_USER` - Username of the Mongo admin account
- `MS_MONGO_ADMIN_PASS` - Password of the Mongo admin account
  

### APP

- `NODE_ENV` - Set this to an empty string
- `MS_EXPRESS_PORT` - Port for the API server
- `QUEUE_EXPIRY` - TTL for the document. Due to this using Mongo's auto delete, collection may take up to one minute to get deleted. 

## REST API

### Check if the user is in the queue

> [GET] `/matching-service/queue/`

**Cookies**

- `session_token` - Session token.

**Returns**

- `200` - { message: "In queue" } 
- `303` - { message: "In room" } 
- `401` - { message: "Not authorized" }
- `404` - { message: "Not in queue", data : { difficulty : string[], categories : string[], language : string[] } }
- `500` - { message: "Sever Error" }

### Join the user to the queue

> [POST] `/matching-service/queue/`

**Cookies**

- `session_token` - Session token.

**Parameters**

- `complexity` - The complexity of the question
- `categories` - The categories of the question - Can be multiple
- `languages` - The programming language of the question

**Returns**

- `200` - { message: "Joined queue" }. 
- `303` - { message: "In room" }
- `401` - { message: "Not authorized" }
- `409` - { message: "Already in queue" }
- `500` - { message: "Sever Error" }

**Examples**

Complexity and Categories provided
> `/matching-service/queue/join?complexity=Easy&categories[]=Strings&categories[]=Arrays`
Will lead to paring with people of the same complexity and category.

No Complexity and no Categories provided, or bad request sent
> `/matching-service/queue/join`
Will lead to paring with people of the a randomized complexity and any category.

### Remove the user to the queue

> [DELETE] `/matching-service/queue/`

**Cookies**

- `session_token` - Session token.

### Remove a particular user from the queue

> [DELETE] `/matching-service/queue/:uid`

**Cookies**

- `session_token` - Session token.