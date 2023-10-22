## Notice

There is no input validation for most parts of this server.

This is because room service is expected to be used with a gateway that prevents unauthorized access, and that authorized parties would send valid data (i.e. validation is done on their side)

## Endpoints

### Check if a user is in a room.

> [get] `/room-service/room/user`

This is for the user to check if they are in a room.

**Cookie**

- `session-token` - ID of the user to query

**Returns**

- `200` - If the user exists
- `404` - If the user is not in a room.
- `500` - For any sever error

### Check what room a user belongs to and the info regarding it

> [get] `/room-service/room/user`

For services, this is the preferred way to check if user is in a room.

**Path Parameters**

- `session-token` - ID of the user to query

**Returns**

- `200` - If the user is in a room and the details
  ```
  {
    'room-id': string,
    users: [string],
    'questions-id': string,
    'expire-at': date,
  }
  ```
- `404` - If the user is not in a room.
- `500` - For any sever error

### Retrieve room info

> [get] `/room-service/room/:rid`

This is for the user to retrieve information about the room they are in.

**Path Parameters**

- `rid` - ID of the room to query

**Returns**

- `200` - On success

  ```
  {
    'room-id': string,
    users: [string],
    'questions-id': string,
    'expire-at': date,
  }
  ```

- `404` - If room id is not found
- `500` - For any sever errors

### Check if room exists

> [get] `/room-service/room/:rid/alive`

This is used to check if a room is still exist (alive).

**Path Parameters**

- `rid` - ID of the room to query

**Returns**

- `200` - On room exists
- `404` - If room with the particular room id does not exist
- `500` - For any sever error

---

### Create room

> [post] `/room-service/create`

This is primarily for matching service. It is assumed that the provided data is correct and without errors.

Currently it allows > 2 users to be added. But it is not indended behavior.

**Parameters**

Json formatted

```
{
  "users" : string[],
  "questions-id" : string,
}
```

**Returns**

- `200` - On success

  ```
  {
    "room-id" : string,
  }
  ```

- `500` - For any sever errors

### Leave room

> [put] `/room-service/room/leave-room`

This is used by users to leave the room.

By default, a room will get deleted after some time (see environmental values).

**Cookies**

- `session-token` - Session Token of the user

**Returns**

- `200` - On leave success
- `404` - If room with the particular room id does not exist
- `500` - For any sever error

### Keep the room alive

> [put] `/room-service/room/keep-alive`

By default, all rooms get deleted after a specified time defined by environmental values.

In order for the room to not get deleted, this must be called frequently to keep the room alive.

**Cookies**

- `session-token` - Session Token of the user

**Returns**

- `200` - On room exists and time is extended
- `404` - If room with the particular room id does not exist
- `500` - For any sever error
