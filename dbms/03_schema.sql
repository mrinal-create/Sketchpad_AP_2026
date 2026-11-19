-- ============================================================
-- SKETCHPAD — COMPLETE DATABASE SCHEMA
-- PostgreSQL
-- ============================================================
--
-- Project: Sketchpad
-- Database: PostgreSQL
-- Total Tables: 7
--
-- Tables:
-- 1. user
-- 2. account
-- 3. session
-- 4. verification
-- 5. Post
-- 6. Room
-- 7. RoomInvite
--
-- IMPORTANT:
-- This script creates tables only if they do not already exist.
-- It does not delete existing tables or existing records.
--
-- Execute using pgAdmin 4 Query Tool.
-- ============================================================


-- ============================================================
-- STEP 1: USER TABLE
-- ============================================================
-- Stores registered users and their basic information.


CREATE TABLE IF NOT EXISTS "user" (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    image           TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_email
ON "user" (email);


-- ============================================================
-- STEP 2: ACCOUNT TABLE
-- ============================================================
-- Stores authentication provider accounts.


CREATE TABLE IF NOT EXISTS account (
    id                      TEXT PRIMARY KEY,
    "accountId"             TEXT NOT NULL,
    "providerId"            TEXT NOT NULL,
    "userId"                TEXT NOT NULL,
    "accessToken"           TEXT,
    "refreshToken"          TEXT,
    "idToken"               TEXT,
    "accessTokenExpiresAt"  TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    scope                   TEXT,
    password                TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_account_user
        FOREIGN KEY ("userId")
        REFERENCES "user"(id)
        ON DELETE CASCADE
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_account_user
ON account ("userId");


-- ============================================================
-- STEP 3: SESSION TABLE
-- ============================================================
-- Stores authenticated user sessions.


CREATE TABLE IF NOT EXISTS session (
    id          TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    token       TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId"    TEXT NOT NULL,

    CONSTRAINT fk_session_user
        FOREIGN KEY ("userId")
        REFERENCES "user"(id)
        ON DELETE CASCADE
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_user
ON session ("userId");


-- ============================================================
-- STEP 4: VERIFICATION TABLE
-- ============================================================
-- Stores verification records.


CREATE TABLE IF NOT EXISTS verification (
    id          TEXT PRIMARY KEY,
    identifier  TEXT NOT NULL,
    value       TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_verification_identifier
ON verification (identifier);


-- ============================================================
-- STEP 5: POST TABLE
-- ============================================================
-- Stores posts created by users.


CREATE TABLE IF NOT EXISTS "Post" (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT fk_post_user
        FOREIGN KEY ("createdById")
        REFERENCES "user"(id)
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_name
ON "Post" (name);

CREATE INDEX IF NOT EXISTS idx_post_created_by
ON "Post" ("createdById");


-- ============================================================
-- STEP 6: ROOM TABLE
-- ============================================================
-- Stores Sketchpad rooms.


CREATE TABLE IF NOT EXISTS "Room" (
    id          TEXT PRIMARY KEY,
    "ownerId"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title       TEXT NOT NULL DEFAULT 'Untitled',

    CONSTRAINT fk_room_owner
        FOREIGN KEY ("ownerId")
        REFERENCES "user"(id)
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_owner
ON "Room" ("ownerId");


-- ============================================================
-- STEP 7: ROOM INVITE TABLE
-- ============================================================
-- Stores invitations connecting users with rooms.


CREATE TABLE IF NOT EXISTS "RoomInvite" (
    id      TEXT PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT fk_room_invite_room
        FOREIGN KEY ("roomId")
        REFERENCES "Room"(id),

    CONSTRAINT fk_room_invite_user
        FOREIGN KEY ("userId")
        REFERENCES "user"(id)
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_invite_room
ON "RoomInvite" ("roomId");

CREATE INDEX IF NOT EXISTS idx_room_invite_user
ON "RoomInvite" ("userId");



-- ============================================================
-- STEP 8: SUBMISSION TABLE
-- ============================================================
-- Stores code submissions made by users.

CREATE TABLE IF NOT EXISTS "Submission" (
    id          TEXT PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "roomId"    TEXT,
    language    TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submission_user
        FOREIGN KEY ("userId")
        REFERENCES "user"(id),

    CONSTRAINT fk_submission_room
        FOREIGN KEY ("roomId")
        REFERENCES "Room"(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submission_user
ON "Submission" ("userId");

CREATE INDEX IF NOT EXISTS idx_submission_room
ON "Submission" ("roomId");


-- ============================================================
-- STEP 9: RUN TABLE
-- ============================================================
-- Stores individual execution attempts for submissions.

CREATE TABLE IF NOT EXISTS "Run" (
    id              TEXT PRIMARY KEY,
    "submissionId"  TEXT NOT NULL,
    "triggeredById" TEXT NOT NULL,
    status          TEXT NOT NULL,
    stdin           TEXT,
    stdout          TEXT,
    stderr          TEXT,
    "exitCode"      INTEGER,
    "startedAt"     TIMESTAMP(3),
    "completedAt"   TIMESTAMP(3),

    CONSTRAINT fk_run_submission
        FOREIGN KEY ("submissionId")
        REFERENCES "Submission"(id),

    CONSTRAINT fk_run_user
        FOREIGN KEY ("triggeredById")
        REFERENCES "user"(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_run_submission
ON "Run" ("submissionId");

CREATE INDEX IF NOT EXISTS idx_run_triggered_by
ON "Run" ("triggeredById");


-- ============================================================
-- STEP 10: ERROR TABLE
-- ============================================================
-- Stores individual errors and diagnostics produced by runs.

CREATE TABLE IF NOT EXISTS "Error" (
    id          TEXT PRIMARY KEY,
    "runId"     TEXT NOT NULL,
    kind        TEXT NOT NULL,
    message     TEXT NOT NULL,
    line        INTEGER,
    "column"    INTEGER,
    "stackTrace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_error_run
        FOREIGN KEY ("runId")
        REFERENCES "Run"(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_error_run
ON "Error" ("runId");


-- ============================================================
-- STEP 11: VERIFY ALL TABLES
-- ============================================================

-- Check all seven tables
SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- ============================================================
-- END OF SKETCHPAD DATABASE SCHEMA
-- ============================================================