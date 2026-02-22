-- Create Stays Table
CREATE TABLE stays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Hotel', 'Homestay', 'Resort', 'Heritage Stay')),
  location TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  thumbnail_url TEXT
);

-- Create Rooms Table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  stay_id UUID REFERENCES stays(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  description TEXT
);

-- Create Room Images Table
CREATE TABLE room_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL
);

-- Create Routes Table
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  "basePrice" DECIMAL(10, 2) NOT NULL, -- Quoted for camelCase preservation
  capacity TEXT, -- e.g. "4 seater", "6 seater"
  description TEXT,
  "coverImage" TEXT
);

-- Create Stops Table
CREATE TABLE stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  "detourPrice" DECIMAL(10, 2) DEFAULT 0,
  description TEXT
);

-- Create Stop Images Table
CREATE TABLE stop_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL
);

-- Create Storage Bucket for Stays
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stays', 'stays', true)
ON CONFLICT (id) DO NOTHING;

-- Create Storage Bucket for Routes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('routes', 'routes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to stay images
CREATE POLICY "Public Access Stays" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'stays' );

-- Policy to allow authenticated uploads to stays
CREATE POLICY "Authenticated Uploads Stays" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'stays' );

-- Policy to allow public read access to route images
CREATE POLICY "Public Access Routes" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'routes' );

-- Policy to allow authenticated uploads to routes
CREATE POLICY "Authenticated Uploads Routes" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'routes' );
