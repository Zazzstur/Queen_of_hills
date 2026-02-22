export interface Stay {
  id: string;
  created_at: string;
  name: string;
  description: string;
  type: 'Hotel' | 'Homestay' | 'Resort' | 'Heritage Stay';
  location: string;
  amenities: string[];
  thumbnail_url: string;
}

export interface Room {
  id: string;
  created_at: string;
  stay_id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
}

export interface RoomImage {
  id: string;
  created_at: string;
  room_id: string;
  url: string;
}

export interface StayWithRooms extends Stay {
  rooms: (Room & { images: RoomImage[] })[];
}
