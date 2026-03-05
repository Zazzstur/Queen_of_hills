-- Migration to fix schema for Darjeeling Website
-- Run this in your Supabase SQL Editor

-- 1. Add 'name' and 'type' to 'routes' table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'name') THEN 
        ALTER TABLE routes ADD COLUMN name TEXT; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'type') THEN 
        ALTER TABLE routes ADD COLUMN type TEXT DEFAULT 'sightseeing'; 
    END IF;
END $$;

-- 2. Ensure 'stays' table has correct columns (already has 'name', 'type', 'location', 'description', 'amenities', 'thumbnail_url')
-- No changes needed for 'stays' if schema.sql is accurate, but we will ensure code uses 'name' instead of 'title'.

-- 3. Check for 'stops' table columns
-- It has 'route_id', 'name', 'detourPrice', 'description'.
-- Ensure 'detourPrice' is handled correctly (case sensitivity).
-- If you encounter issues with "detourPrice", consider renaming to "detour_price" or ensuring it is quoted in queries.

-- 4. Verify RLS policies are enabled (as per previous check)
