# PostgreSQL Query Plans (EXPLAIN ANALYZE)

This directory contains the execution plans (`EXPLAIN ANALYZE`) and performance interpretations for all 14 queries (8 Read queries and 6 Write queries) defined in `dbms/04_queries.sql` and evaluated in `dbms/05_query_timings.md`.

---

## Query Index

| Query ID | Code | Query Name / Operation | Scan Type | Avg Runtime | Plan File |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Q1** | **R1** | Dashboard Load (User Profile, Owned Rooms, Invites) | Index Scan | 0.129 ms | `q1_dashboard_load.txt` (`r1_dashboard_load.txt`) |
| **Q2** | **R2** | Room Access Authorization Check (Liveblocks Auth) | Index Scan | 0.022 ms | `q2_room_access.txt` (`r2_room_access.txt`) |
| **Q3** | **R3** | Room Details & Collaborator Profile List | Index Scan | 0.073 ms | `q3_room_details.txt` (`r3_room_details.txt`) |
| **Q4** | **W1** | Create Room (Insert New Room) | — (Insert) | 0.354 ms | `q4_create_room.txt` (`w1_create_room.txt`) |
| **Q5** | **R4** | Verify Room Ownership Before Title Update | Index Scan | 0.016 ms | `q5_verify_room_title_update.txt` (`r4_verify_room_title_update.txt`) |
| **Q6** | **W2** | Update Room Title | Index Scan | 0.130 ms | `q6_update_room_title.txt` (`w2_update_room_title.txt`) |
| **Q7** | **R5** | Verify Room Ownership Before Room Deletion | Index Scan | 0.016 ms | `q7_verify_room_delete.txt` (`r5_verify_room_delete.txt`) |
| **Q8** | **W3** | Delete Room by ID | Index Scan | 0.301 ms | `q8_delete_room.txt` (`w3_delete_room.txt`) |
| **Q9** | **R6** | Verify Room Ownership Before Sharing | Index Scan | 0.015 ms | `q9_verify_room_share.txt` (`r6_verify_room_share.txt`) |
| **Q10** | **R7** | Look Up Collaborator User ID by Email | Index Scan | 0.016 ms | `q10_lookup_user_by_email.txt` (`r7_lookup_user_by_email.txt`) |
| **Q11** | **W4** | Insert Room Invitation Linking User and Room | — (Insert) | 0.547 ms | `q11_insert_room_invite.txt` (`w4_insert_room_invite.txt`) |
| **Q12** | **W5** | Atomic Share Room (CTE Verify & Insert) | Index Scan | 0.265 ms | `q12_atomic_share_room.txt` (`w5_atomic_share_room.txt`) |
| **Q13** | **R8** | Verify Room Ownership Before Revoking Access | Index Scan | 0.017 ms | `q13_verify_room_revoke.txt` (`r8_verify_room_revoke.txt`) |
| **Q14** | **W6** | Revoke Room Collaborator Access by Email Subquery | Index Scan | 0.068 ms | `q14_revoke_room_invite.txt` (`w6_revoke_room_invite.txt`) |

---

## File Format

Each file is formatted as follows:

```sql
-- <Query ID>: <Query Name>
-- EXPLAIN ANALYZE command:

EXPLAIN ANALYZE
<Query SQL>;

-- Expected Plan Output:

<Plan tree with node costs, actual time, loops, buffers, planning time, execution time>

-- Interpretation:
-- <Detailed explanation of index usage, join methods, buffer hits, and latency improvements>
```
