## Notice

There is no input validation for most parts of this server.

This is because room service is expected to be used with a gateway that prevents unauthorized access, and that authorized parties would send valid data (i.e. validation is done on their side)

## Endpoints

### Check what room a user belongs to

> [get] `/room-service/users/:uid/room`

This checks if a particular user is already in a room.

Returns the room-id if the user is already in a room.

**Path Parameters**

- `uid` - ID of the user to query

**Returns**

- `200` - If the user exists

  ```
  {
    "room-id" : string,
  }
  ```

- `404` - If the user is not in a room.
- `500` - For any sever error

---

### Create room

> [post] `/room-service/add`

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

### Retrieve room info

> [get] `/room-service/room/:rid`

This is used to query the users and the question id of a particular room.

**Path Parameters**

- `rid` - ID of the room to query

**Returns**

- `200` - On success

  ```
  {
    "users" : string[],
    "questions-id" : string,
  }
  ```

- `404` - If room id is not found
- `500` - For any sever errors

### Deletes room

> [delete] `/room-service/room/:rid`

This is primarily for collaboration service. It is assumed that the provided data is correct and without errors.

This is used to delete the room.

**Path Parameters**

- `rid` - ID of the room to delete

**Returns**

- `200` - On deletion success

- `404` - If room with the particular room id does not exist
- `500` - For any sever error

### Check if room exists

> [get] `/room-service/room/:rid/alive`

This is used to check if a room is still alive.

**Path Parameters**

- `rid` - ID of the room to query

**Returns**

- `200` - On room exists

- `404` - If room with the particular room id does not exist
- `500` - For any sever error

### Keep the room alive

> [put] `/room-service/room/:rid/keep-alive`

By default, all rooms get deleted after a specified time defined by the environmental values.

In order to not get deleted, this can be used to keep the room alive.

This is used to keep the record from being deleted.

**Path Parameters**

- `rid` - ID of the room to query

**Returns**

- `200` - On room exists and time is extended

- `404` - If room with the particular room id does not exist
- `500` - For any sever error
