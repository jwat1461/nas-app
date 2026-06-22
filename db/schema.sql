-- NAS Application Database Schema
-- Run this file against your PostgreSQL database to initialize the schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  mime_type VARCHAR(255),
  folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recurrence_rule TEXT,
  color VARCHAR(50) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_owner ON folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_events_owner ON calendar_events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events(start_time);
