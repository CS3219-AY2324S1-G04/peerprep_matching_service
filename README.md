# PeerPrep Matching Service

Handles the queuing and matching of users.

## Quickstart Guide

1. Clone this repository.
2. Build the docker images by running: `./run.bat`
3. Modify the `.env` file as per needed. Refer to [Environment Variables](#environment-variables) for a list of configs.
4. Create the docker containers by running: `docker compose up`

## Environment Variables

### MONGO

- `MONGO_USER` - Username of the Mongo database
- `MONGO_PASS` - Password of the Mongo database
- `MONGO_PORT` - Port of the Mongo database
- `MONGO_DB` - Name of the database.

### APP

- `EXPRESS_PORT` - Port of the Express server
- `PRE_SHARED_KEY` - Used for communicating between services.
- `QUEUE_EXPIRY` - TTL in seconds for users in the queue but are not matched

## REST API

### Join a user to the queue

> [POST] `/queue`

**Cookies**

- `session_token` - Session token.

**Parameters**

Json formatted preferences

```
{
  "difficulty" : "easy",
  "questions" : [<any from questionType>],
  "language" : <any from languageType>
}
```

Example:

```
{
  "difficulty" : "medium",
  "questions" : ["Strings", "Arrays"],
  "language" : "c"
}
```

Validation is handled by `validator.ts`, currently references `languageType.ts` and `questionType.ts`.

Currently only 3 types of difficulty is accepted.

### Check the properties of a room given room ID

> [Get] `/match/room/:rid`

This is primarily for collaboration service.

**Path Parameters**

- `rid` - ID of the room to query

### Find out which room a particular user is in.

> [Get] `/match/room/:uid`

This is primarily for collaboration service.

**Path Parameters**

- `uid` - User ID of the room to query

### Delete match

> [DELETE] `/match/room/:rid`

This is primarily for collaboration service.

**Path Parameters**

- `rid` - ID of the room to delete
