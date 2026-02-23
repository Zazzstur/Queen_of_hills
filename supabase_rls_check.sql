-- SQL Script to Verify and Fix RLS Policies for Queen of Hills

-- Enable RLS on all tables
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE stop_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;

-- 1. Routes Policies
-- Allow public read access
CREATE POLICY "Public routes are viewable by everyone" 
ON routes FOR SELECT 
USING (true);

-- Allow authenticated users (admin) to insert/update/delete
CREATE POLICY "Admins can insert routes" 
ON routes FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can update routes" 
ON routes FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Admins can delete routes" 
ON routes FOR DELETE 
TO authenticated 
USING (true);

-- 2. Stops Policies
CREATE POLICY "Public stops are viewable by everyone" 
ON stops FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage stops" 
ON stops FOR ALL 
TO authenticated 
USING (true);

-- 3. Stop Images Policies
CREATE POLICY "Public stop images are viewable by everyone" 
ON stop_images FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage stop images" 
ON stop_images FOR ALL 
TO authenticated 
USING (true);

-- 4. Stays Policies
CREATE POLICY "Public stays are viewable by everyone" 
ON stays FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage stays" 
ON stays FOR ALL 
TO authenticated 
USING (true);

-- 5. Rooms Policies
CREATE POLICY "Public rooms are viewable by everyone" 
ON rooms FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage rooms" 
ON rooms FOR ALL 
TO authenticated 
USING (true);

-- 6. Room Images Policies
CREATE POLICY "Public room images are viewable by everyone" 
ON room_images FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage room images" 
ON room_images FOR ALL 
TO authenticated 
USING (true);

-- Storage Policies (Buckets)
-- Make sure 'routes' and 'stays' buckets exist and are public
-- This part is usually done in the Storage UI, but here is the policy logic:

-- policy for 'routes' bucket
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'routes' );
-- CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'routes' );
