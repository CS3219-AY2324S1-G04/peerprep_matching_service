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

- `MONGO_USER` - Username of the Mongo database
- `MONGO_PASS` - Password of the Mongo database
- `MS_MONGO_ADMIN_USER` - Username of the Mongo admin account
- `MS_MONGO_ADMIN_PASS` - Password of the Mongo admin account
- `MS_MONGO_DB` - Name of the Mongo database 
- `MS_MONGO_COLLECTION` - Name of the Mongo collection

### APP

- `NODE_ENV` - Set this to an empty string
- `MS_EXPRESS_PORT` - Port for this API server
- `QUEUE_EXPIRY` - TTL for the document. Due to this using Mongo's auto delete, collection may take up to one minute to get deleted. 
- `JwtKey` - Do not change or write into this
- `SERVICE_USER_PORT` - port of the user service
- `SERVICE_QUESTION_PORT` - port of the question service
- `SERVICE_ROOM_PORT` - port of the room service

## REST API

### Check if the user is in the queue

> [GET] `/matching-service/queue/`

**Cookies**

- `access-token` - Access token.

**Returns**

- `200` - { message: "In queue" } 
- `303` - { message: "In room" } 
- `401` - { message: "Not authorized" }
- `404` - { message: "Not in queue", data : { difficulty : string[], categories : string[], language : string[] } }
- `500` - { message: "Sever Error" }

### Join the user to the queue

> [POST] `/matching-service/queue/join`

**Cookies**

- `access_token` - Access token.

**Parameters**

- `difficulty` - The complexity of the question. 
- `categories[]` - The categories of the question - Can be multiple
- `language` - The programming language of the question

**Returns**

- `200` - { message: "Joined queue" }. 
- `303` - { message: "In room" }
- `401` - { message: "Not authorized" }
- `409` - { message: "Already in queue" }
- `500` - { message: "Sever Error" }

**Examples**

Complexity and Categories provided
> `/matching-service/queue/join?difficulty=Easy&categories[]=Strings&categories[]=Arrays&language=cpp`
Will lead to paring with people of the same complexity and category and language.

No Complexity and no Categories provided, or bad request sent
> `/matching-service/queue/join`
Will lead to paring with people of the a randomized complexity and any category and python3 as language.


### Remove the user to the queue

> [DELETE] `/matching-service/queue/`

**Cookies**

- `access-token` - Access token.

**Returns**

- `200` - { message: "Received message" }. 
- `401` - { message: "Not authorized" }

### Remove a particular user from the queue

> [DELETE] `/matching-service/queue/:uid`

Primarily for testing