-- drizzle/migrations/0000_add_verification_columns/migration.sql
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_token_expires TEXT; 