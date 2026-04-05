import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stayService } from '../services/stayService';
import { useBooking } from '../context/BookingContext';
import { ArrowLeft, Wifi, Car, Utensils, Bed, Wind, Dumbbell, Thermometer, Mountain, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const AMENITY_ICONS = {
  'Wifi': Wifi,
  'Parking': Car,
  'Restaurant': Utensils,
  'Room Service': Bed,
  'Pool': Wind, // Using Wind as placeholder for Pool if Waves not available
  'Spa': Wind,
  'Gym': Dumbbell,
  'Air Conditioning': Wind,
  'Heater': Thermometer,
  'View': Mountain
};

const StayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { initializeBooking } = useBooking();
  const [stay, setStay] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stay Details
        const { data: stays } = await stayService.getStays();
        const foundStay = stays?.find(s => String(s.id) === String(id));
        
        if (foundStay) {
            setStay(foundStay);
            // Fetch Rooms
            const { data: roomsData } = await stayService.getRoomsByStayId(foundStay.id);
            
            // Fetch Images for rooms
            const roomsWithImages = await Promise.all((roomsData || []).map(async (room) => {
                const { data: images } = await stayService.getRoomImages(room.id);
                return { ...room, images: images || [] };
            }));
            
            setRooms(roomsWithImages);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchData();
    }
  }, [id]);

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  }

  if (!stay) {
      return <div className="min-h-screen flex items-center justify-center">Stay not found</div>;
  }

  const handleBookNow = (room) => {
    // If booking a specific room, use that as the service item, but link to stay
    // For simplicity, let's treat the room as the item being booked
    initializeBooking('stay', {
        ...room,
        thumbnail_url: room.images?.[0]?.url || stay.thumbnail_url, // Fallback image
        title: `${stay.title} - ${room.name}`,
        location: stay.location
    });
    navigate('/book');
  };

  // Generate structured data
  const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 0;
  const maxPrice = rooms.length > 0 ? Math.max(...rooms.map(r => r.price)) : 0;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "name": stay.title || stay.name,
    "description": stay.description,
    "image": stay.thumbnail_url || stay.image,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": stay.location,
      "addressRegion": "West Bengal",
      "addressCountry": "IN"
    },
    ...(rooms.length > 0 && {
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": minPrice,
        "highPrice": maxPrice,
        "offerCount": rooms.length
      }
    }),
    "amenityFeature": (stay.amenities || []).map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    }))
  };

  return (
    <div className="min-h-screen bg-snow pt-24 pb-20">
      <Helmet>
        <title>{stay.title || stay.name} - Stay in {stay.location} | Toils Darjeeling</title>
        <meta name="description" content={stay.description?.substring(0, 160) || `Book your stay at ${stay.title || stay.name} in ${stay.location}. Find the best homestays and hotels with Toils Darjeeling.`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Header / Breadcrumb */}
      <div className="container mx-auto px-4 mb-8">
        <button 
            onClick={() => navigate('/experiences')}
            className="flex items-center text-gray-500 hover:text-primary transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stays
        </button>
        <h1 className="text-3xl md:text-4xl font-serif text-primary font-bold">{stay.title || stay.name}</h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="bg-secondary px-2 py-0.5 rounded text-xs font-medium text-gray-700">{stay.type}</span>
            <span>•</span>
            <span>{stay.location}</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Amenities */}
        <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden shadow-sm h-[400px] relative bg-gray-200">
                {stay.thumbnail_url || stay.image ? (
                    <img src={stay.thumbnail_url || stay.image} alt={stay.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image Available</div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About this stay</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {stay.description}
                </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(stay.amenities || []).map(amenity => {
                        const Icon = AMENITY_ICONS[amenity] || Check;
                        return (
                            <div key={amenity} className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm">{amenity}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Right Column: Rooms List */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Available Rooms</h2>
            {rooms.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500">
                    No rooms listed for this stay yet.
                </div>
            ) : (
                rooms.map(room => (
                    <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-100 relative">
                            {room.images && room.images.length > 0 ? (
                                <img src={room.images[0].url} alt={room.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Room Image</div>
                            )}
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{room.name}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                <span>{room.capacity} Guests</span>
                                <span>•</span>
                                <span>{room.description}</span>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <div>
                                    <span className="text-sm text-gray-500">Starts from</span>
                                    <div className="text-xl font-bold text-primary">₹{room.price}</div>
                                </div>
                                <button 
                                    onClick={() => handleBookNow(room)}
                                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default StayDetails;
