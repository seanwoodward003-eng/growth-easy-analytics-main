-- 0001_add_marketing_consented.sql
ALTER TABLE users ADD COLUMN marketing_consented INTEGER DEFAULT 0;