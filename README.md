# PeerPrep Matching Service

Handles the matching of users.

- [Quickstart Guide](#quickstart-guide)
- [Docker Images](#docker-images)
  - [API](#api)
  - [Database Initialiser](#database-initialiser)
- [REST API](#rest-api)
  - [Check if the user is in the queue](#check-if-the-user-is-in-the-queue)
  - [Join the user to the queue](#join-the-user-to-the-queue)
  - [Remove the user to the queue](#remove-the-user-to-the-queue)
  - [Remove a particular user from the queue](#remove-a-particular-user-from-the-queue)

## Quickstart Guide

Note that Matching Service relies on User Service, Question Service, and Room Service. Please ensure that these services are up and running before attempting to start Matching Service.

1. Clone this repository.
2. Build the docker images by running: `./build_images.sh`
3. Modify the ".env" file as per needed. Refer to [Docker Images](#docker-images) for the list of environment variables.
4. Create the docker containers by running: `docker compose up`

## Docker Images

### API

**Name:** ghcr.io/cs3219-ay2324s1-g04/peerprep_matching_service_api

**Description:** Runs the REST API.

**Environment Variables:**

- `NODE_ENV` - Mode the app is running on ("development" or "production").
- `MS_EXPRESS_PORT` - Port to listen on.
- `MS_MONGO_URI` - URI for connecting to the Mongo database.
  - Example `mongodb://<user>:<pass>@<address>:<port>/<database>`
- `MS_MONGO_COLLECTION` - Name of the Mongo collection.
- `QUEUE_EXPIRY` - Number of milliseconds a user's matching request will remain in the queue before timing out. Due to this using Mongo's auto delete, collection may take up to one additional minute to get deleted.
- `SERVICE_USER_HOST` - Address of the User Service host.
- `SERVICE_USER_PORT` - Port the User Service is listening on.
- `SERVICE_QUESTION_HOST` - Address of the Question Service host.
- `SERVICE_QUESTION_PORT` - Port the Question Service is listening on.
- `SERVICE_ROOM_HOST` - Address of the Room Service host.
- `SERVICE_ROOM_PORT` - Port the Room Service is listening on.

### Database Initialiser

**Name:** ghcr.io/cs3219-ay2324s1-g04/peerprep_matching_service_database_initialiser

**Description:** Initialises the database by creating and setting up the necessary collections.

**Environment Variables:**

- `MS_MONGO_URI` - URI for connecting to the Mongo database.
  - Example `mongodb://<user>:<pass>@<address>:<port>/<database>`
- `MS_MONGO_COLLECTION` - Name of the Mongo collection.
- `QUEUE_EXPIRY` - Number of milliseconds a user's matching request will remain in the queue before timing out. Due to this using Mongo's auto delete, collection may take up to one additional minute to get deleted.

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
