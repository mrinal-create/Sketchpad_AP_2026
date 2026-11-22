# CP4 · Query timings of the Sketchpad Platform

Every query the app runs, measured with `EXPLAIN (ANALYZE, BUFFERS)` in PostgreSQL.
Each query was run **3 times** and the table shows the **average** of the three.



There are **8 read queries** and **6 write queries**.

## The timing table

| Query | Type | What it does | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) | Scan type |
|---|---|---|---:|---:|---:|---:|---|
| R1 | READ | Dashboard: user profile details with owned rooms and room invites | 0.135 | 0.123 | 0.130 | 0.129 | Index Scan |
| R2 | READ | Room access: verify permission (owner OR invited collaborator via EXISTS) | 0.020 | 0.025 | 0.020 | 0.022 | Index Scan |
| R3 | READ | Room details: metadata and invited collaborator profile list | 0.079 | 0.073 | 0.066 | 0.073 | Index Scan |
| W1 | WRITE | Create room: insert a new room for the owner | 0.370 | 0.352 | 0.340 | 0.354 | — |
| R4 | READ | Update title: verify room exists and belongs to the user | 0.017 | 0.016 | 0.016 | 0.016 | Index Scan |
| W2 | WRITE | Update title: change room title/name | 0.138 | 0.128 | 0.125 | 0.130 | Index Scan |
| R5 | READ | Delete room: verify room exists and belongs to the user | 0.018 | 0.014 | 0.015 | 0.016 | Index Scan |
| W3 | WRITE | Delete room: remove room by id | 0.313 | 0.293 | 0.296 | 0.301 | Index Scan |
| R6 | READ | Share room: verify room ownership before sharing | 0.016 | 0.014 | 0.015 | 0.015 | Index Scan |
| R7 | READ | Share room: lookup collaborator user id by email | 0.014 | 0.015 | 0.019 | 0.016 | Index Scan |
| W4 | WRITE | Share room: insert room invitation linking user and room | 0.629 | 0.509 | 0.502 | 0.547 | — |
| W5 | WRITE | Share room (atomic): verify ownership and insert invite via CTE | 0.244 | 0.311 | 0.240 | 0.265 | Index Scan |
| R8 | READ | Revoke access: verify room ownership before revoking | 0.019 | 0.017 | 0.016 | 0.017 | Index Scan |
| W6 | WRITE | Revoke access: delete room invitation by email subquery | 0.070 | 0.067 | 0.066 | 0.068 | Index Scan |


**Scan type** is the top node of the plan: `Index Scan` (the index found the rows),
`Index Only Scan` (the index alone was enough), `Bitmap Heap Scan` (the index narrowed it down,
then the rows were read), `Seq Scan` (the whole table was read - the right choice for a small
table), `—` (a write, which has no scan), and `rule (no scan)` for the query the database
blocks on purpose.



## The query the database protects

The query that deletes a room (`Room`) with active collaborators in `RoomInvite` is rejected by the database constraint `fk_room_invite_room` (`ON DELETE RESTRICT`). PostgreSQL prevents orphaned invitations, so a room cannot be deleted without first removing or reassigning collaborator invitations. In W5, the database uses an atomic Common Table Expression (CTE) write that combines ownership authorization and invite insertion into one transaction, preventing unauthorized user additions at the database level.



## The indexes, and what they changed

The queries above already run against the indexes that are in `03_schema.sql`.
To see what those indexes are worth, the same queries were measured with and without them:

| Query | Before (ms) | After (ms) | What changed |
|---|---:|---:|---|
| Dashboard: user profile and owned rooms (R1) | 2.40 | **0.13** | Seq Scan of 25k rooms + 50k invites → Bitmap Index Scan on `idx_room_owner` and `idx_room_invite_user` |
| Room access check via collaborator exists (R2) | 1.49 | **0.02** | Seq Scan of 50k invites → Index Scan on `idx_room_invite_room` |
| Room details and invited collaborator list (R3) | 1.46 | **0.07** | Seq Scan of 50k invites → Nested Loop Index Scan on `idx_room_invite_room` |
| Delete room foreign key validation (W3) | 1.50 | **0.30** | Seq Scan of 50k invites during FK trigger check → Index Scan on `idx_room_invite_room` |
| Revoke room collaborator access by email (W6) | 1.33 | **0.07** | Seq Scan of 50k invites → Nested Loop Index Scan on `idx_room_invite_room` and `idx_user_email` |

