-- Initialization script for Docker PostgreSQL
-- This runs after schema.sql to set up initial data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any initial sequences or default data
-- This file can be used to seed initial data if needed

-- Note: Actual data import will be handled by the application
-- This is just for any required initial setup


