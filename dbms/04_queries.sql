-- Read Query
-- Purpose: Retrieve user profile details along with all rooms owned by the user and all rooms the user has been invited to (used to populate the user dashboard).
SELECT 
  u."id",
  u."name",
  u."email",
  u."emailVerified",
  u."image",
  u."createdAt",
  u."updatedAt",
  COALESCE(
    (
      SELECT json_agg(
        jsonb_build_object(
          'id', r."id",
          'ownerId', r."ownerId",
          'createdAt', r."createdAt",
          'title', r."title"
        )
      )
      FROM "Room" r
      WHERE r."ownerId" = u."id"
    ),
    '[]'::json
  ) AS "ownedRooms",
  COALESCE(
    (
      SELECT json_agg(
        jsonb_build_object(
          'id', ri."id",
          'roomId', ri."roomId",
          'userId', ri."userId",
          'room', jsonb_build_object(
            'id', ir."id",
            'ownerId', ir."ownerId",
            'createdAt', ir."createdAt",
            'title', ir."title"
          )
        )
      )
      FROM "RoomInvite" ri
      INNER JOIN "Room" ir ON ir."id" = ri."roomId"
      WHERE ri."userId" = u."id"
    ),
    '[]'::json
  ) AS "roomInvites"
FROM "user" u
WHERE u."id" = $1;




-- Read Query
-- Purpose: Verify access permissions to a room by checking if the user is either the room owner or an invited collaborator (used for Liveblocks authorization).
SELECT r."id"
FROM "Room" r
WHERE r."id" = $1
  AND (
    r."ownerId" = $2
    OR EXISTS (
      SELECT 1
      FROM "RoomInvite" ri
      WHERE ri."roomId" = r."id"
        AND ri."userId" = $2
    )
  )
LIMIT 1;




-- Read Query
-- Purpose: Fetch room metadata (title, ownerId) and list of all invited collaborator profiles for a specific room.
SELECT 
  r."title",
  r."ownerId",
  COALESCE(
    (
      SELECT json_agg(
        jsonb_build_object(
          'user', jsonb_build_object(
            'id', u."id",
            'name', u."name",
            'email', u."email",
            'emailVerified', u."emailVerified",
            'image', u."image",
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
          )
        )
      )
      FROM "RoomInvite" ri
      INNER JOIN "user" u ON u."id" = ri."userId"
      WHERE ri."roomId" = r."id"
    ),
    '[]'::json
  ) AS "roomInvites"
FROM "Room" r
WHERE r."id" = $1;






-- Write Query
-- Purpose: Create a new room associated with the specified owner.
INSERT INTO "Room" ("id", "ownerId")
VALUES ($1, $2)
RETURNING "id";



-- Read Query
-- Purpose: Verify that the room exists and belongs to the user before allowing a title update.
SELECT "id", "ownerId", "createdAt", "title"
FROM "Room"
WHERE "id" = $1
  AND "ownerId" = $2
LIMIT 1;






-- Write Query
-- Purpose: Update the title/name of a specific room.
UPDATE "Room"
SET "title" = $1
WHERE "id" = $2
RETURNING "id", "ownerId", "createdAt", "title";





-- Read Query
-- Purpose: Verify room ownership before allowing room deletion.
SELECT "id", "ownerId", "createdAt", "title"
FROM "Room"
WHERE "id" = $1
  AND "ownerId" = $2
LIMIT 1;




-- Write Query
-- Purpose: Delete a room from the database by its ID.
DELETE FROM "Room"
WHERE "id" = $1
RETURNING "id", "ownerId", "createdAt", "title";




-- Read Query
-- Purpose: Verify room ownership before sharing the room with another user.
SELECT "id", "ownerId", "createdAt", "title"
FROM "Room"
WHERE "id" = $1
  AND "ownerId" = $2
LIMIT 1;




-- Read Query
-- Purpose: Look up a user's ID by their email address to prepare a room invitation.
SELECT "id"
FROM "user"
WHERE "email" = $1
LIMIT 1;



-- Write Query
-- Purpose: Insert a room invitation linking a user to a room using known IDs.
INSERT INTO "RoomInvite" ("id", "roomId", "userId")
VALUES ($1, $2, $3)
RETURNING "id", "roomId", "userId";



-- Write Query
-- Purpose: Atomically verify room ownership and invite a collaborator by their email in a single operation using CTEs.
WITH authorized_room AS (
  SELECT "id"
  FROM "Room"
  WHERE "id" = $2
    AND "ownerId" = $3
),
target_user AS (
  SELECT "id"
  FROM "user"
  WHERE "email" = $4
)
INSERT INTO "RoomInvite" ("id", "roomId", "userId")
SELECT $1, authorized_room."id", target_user."id"
FROM authorized_room, target_user
RETURNING "id", "roomId", "userId";




-- Read Query
-- Purpose: Verify room ownership before revoking a collaborator's access.
SELECT "id", "ownerId", "createdAt", "title"
FROM "Room"
WHERE "id" = $1
  AND "ownerId" = $2
LIMIT 1;




-- Write Query
-- Purpose: Revoke a user's access to a room by deleting their room invitation by email.
DELETE FROM "RoomInvite"
WHERE "roomId" = $1
  AND "userId" IN (
    SELECT "id"
    FROM "user"
    WHERE "email" = $2
);
