import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { routeService } from '../services/routeService';
import { useBooking } from '../context/BookingContext';
import { ArrowLeft, MapPin, Clock, Info, Check } from 'lucide-react';
import StopDisplayCard from './StopDisplayCard';

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { initializeBooking } = useBooking();
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStops, setSelectedStops] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching route details for ID:', id);
        
        // Fetch Route Details
        const { data: routes } = await routeService.getRoutes();
        // Loose comparison for ID to handle string/number mismatch
        const foundRoute = routes?.find(r => String(r.id) === String(id));
        console.log('Found Route:', foundRoute);

        if (foundRoute) {
            setRoute(foundRoute);
            // Fetch Stops
            const { data: stopsData } = await routeService.getStopsByRouteId(foundRoute.id); // Use the found ID
            console.log('Stops Data from Service:', stopsData);
            
            // Fetch images for each stop to ensure the card has data
            const stopsWithImages = await Promise.all((stopsData || []).map(async (stop) => {
                 const { data: images } = await routeService.getStopImages(stop.id);
                 return { ...stop, images: images || [] };
            }));

            setStops(stopsWithImages);
        } else {
             console.error("Route not found in list:", routes);
        }
      } catch (err) {
        console.error('Error fetching route details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchData();
    }
  }, [id]);

  const handleAddStop = (stop) => {
      if (selectedStops.some(s => s.id === stop.id)) {
          setSelectedStops(prev => prev.filter(s => s.id !== stop.id));
      } else {
          setSelectedStops(prev => [...prev, stop]);
      }
  };

  const totalPrice = route ? (Number(route.basePrice) + selectedStops.reduce((sum, stop) => sum + (Number(stop.detourPrice) || 0), 0)) : 0;

  const handleBookNow = () => {
    // Pass the full route details + selected stops calculation
    initializeBooking('route', {
        ...route,
        totalPrice: totalPrice, // Use the calculated total with stops
        selectedStops: selectedStops // Pass stops for record
    });
    navigate('/book');
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  }

  if (!route) {
      return <div className="min-h-screen flex items-center justify-center">Route not found</div>;
  }

  return (
    <div className="min-h-screen bg-snow pt-24 pb-20">
      {/* Header / Breadcrumb */}
      <div className="container mx-auto px-4 mb-8">
        <button 
            onClick={() => {
                if (route.type === 'direct') {
                    navigate('/direct-travel');
                } else {
                    navigate('/experiences');
                }
            }}
            className="flex items-center text-gray-500 hover:text-primary transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            {route.type === 'direct' ? 'Back to Direct Travel' : 'Back to Sight Seeing'}
        </button>
        <h1 className="text-3xl md:text-4xl font-serif text-primary font-bold">
            {route.origin} to {route.destination}
        </h1>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="bg-secondary px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                {route.type === 'direct' ? 'Direct Travel' : 'Sight Seeing'}
            </span>
            <span>•</span>
            <span>Capacity: {route.capacity}</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Route Info */}
        <div className="lg:col-span-1 space-y-8">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Trip Details</h2>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Total Price</span>
                        <div className="text-right">
                            <span className="font-bold text-primary text-xl">₹{totalPrice}</span>
                            {selectedStops.length > 0 && (
                                <p className="text-xs text-gray-500">(Base ₹{route.basePrice} + Stops ₹{totalPrice - route.basePrice})</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Vehicle Type</span>
                        <span className="font-bold text-gray-800">{route.capacity}</span>
                    </div>
                     <div className="pt-2">
                        <span className="block text-gray-500 mb-1">Description</span>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {route.description || `Enjoy a comfortable journey from ${route.origin} to ${route.destination} with our expert drivers.`}
                        </p>
                    </div>
                </div>
                 <button 
                    onClick={handleBookNow}
                    className="w-full mt-6 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                >
                    Book Now
                </button>
            </div>
        </div>

        {/* Right Column: Stops List */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-accent" />
                {route.type === 'direct' ? 'Journey Details' : 'Stops & Sightseeing'}
            </h2>
            
            {stops.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500">
                    {route.type === 'direct' 
                        ? "This is a direct point-to-point journey without scheduled stops."
                        : "No specific stops listed for this route. It's a direct journey!"
                    }
                </div>
            ) : (
                <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-8 space-y-12 py-4">
                    {stops.map((stop, index) => (
                        <div key={stop.id} className="relative">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[41px] top-8 w-6 h-6 rounded-full bg-accent border-4 border-white shadow-sm z-10"></div>
                            
                            {/* New Responsive Stop Card */}
                            <StopDisplayCard 
                                stop={stop} 
                                onAdd={handleAddStop}
                                isSelected={selectedStops.some(s => s.id === stop.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
