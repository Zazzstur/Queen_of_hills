import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { routeService } from '../services/routeService';
import { useBooking } from '../context/BookingContext';
import { ArrowLeft, MapPin, Clock, Info, Check, ChevronDown } from 'lucide-react';
import StopDisplayCard from './StopDisplayCard';
import CarTypeModal from './CarTypeModal';

const CAR_OPTIONS = [
  { label: '4 Seater', value: '4 Seater' },
  { label: '6 Seater Luxury SUV', value: '6 Seater Luxury SUV' },
  { label: '6-10 Seater SUV', value: '6-10 Seater SUV' },
];

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { initializeBooking } = useBooking();
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const normalizeCapacity = (capacity) => {
    const c = String(capacity || '').toLowerCase();
    if (c.includes('luxury')) return '6 Seater Luxury SUV';
    if (c.includes('6-10') || c.includes('6 to 10') || c.includes('6–10')) return '6-10 Seater SUV';
    if (c.includes('4')) return '4 Seater';
    return '';
  };

  const getRoutePriceByCapacity = (r, capacity) => {
    const p4 = r.price4Seater ?? r.basePrice;
    const p6l = r.price6SeaterLuxurySuv ?? r.basePrice;
    const p610 = r.price6to10SeaterSuv ?? r.basePrice;
    const c = String(capacity || '').toLowerCase();
    if (c.includes('luxury')) return Number(p6l) || 0;
    if (c.includes('6-10') || c.includes('6 to 10')) return Number(p610) || 0;
    return Number(p4) || 0;
  };

  const getPriceSet = (r) => ({
    p4: r.price4Seater ?? r.basePrice,
    p6l: r.price6SeaterLuxurySuv ?? r.basePrice,
    p610: r.price6to10SeaterSuv ?? r.basePrice,
  });

  const getStopPriceByCapacity = (stop, capacity) => {
    const p4 = stop.price4Seater ?? stop.detourPrice ?? 0;
    const p6l = stop.price6SeaterLuxurySuv ?? stop.detourPrice ?? 0;
    const p610 = stop.price6to10SeaterSuv ?? stop.detourPrice ?? 0;
    const c = String(capacity || '').toLowerCase();
    if (c.includes('luxury')) return Number(p6l) || 0;
    if (c.includes('6-10') || c.includes('6 to 10')) return Number(p610) || 0;
    return Number(p4) || 0;
  };

  useEffect(() => {
    const fromQuery = new URLSearchParams(location.search).get('capacity');
    const normalized = normalizeCapacity(fromQuery);
    if (normalized) setSelectedCapacity(normalized);
  }, [location.search]);

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
            setSelectedCapacity((prev) => prev || normalizeCapacity(foundRoute.capacity) || '4 Seater');
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

  const basePrice = route ? getRoutePriceByCapacity(route, selectedCapacity || route.capacity) : 0;
  const stopsTotal = route
    ? selectedStops.reduce((sum, stop) => sum + getStopPriceByCapacity(stop, selectedCapacity || route.capacity), 0)
    : 0;
  const totalPrice = route ? (basePrice + stopsTotal) : 0;

  const proceedToBooking = (capacityOverride) => {
    if (!route) return;
    const capacity = capacityOverride || selectedCapacity || route.capacity;
    const b = getRoutePriceByCapacity(route, capacity);
    const s = selectedStops.reduce((sum, stop) => sum + getStopPriceByCapacity(stop, capacity), 0);
    const t = b + s;

    initializeBooking('route', {
      ...route,
      capacity,
      basePrice: b,
      totalPrice: t,
      selectedStops,
    });
    navigate('/book');
  };

  const handleBookNow = () => {
    proceedToBooking();
  };

  const handleSelectCar = (capacity) => {
    setSelectedCapacity(capacity);
    setShowDropdown(false);
    if (route) {
      navigate(`/route/${route.id}?capacity=${encodeURIComponent(capacity)}`, { replace: true });
    }
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
            <span>Capacity: {selectedCapacity || route.capacity}</span>
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
                                <p className="text-xs text-gray-500">(Base ₹{basePrice} + Stops ₹{stopsTotal})</p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Prices</span>
                        <div className="text-right text-sm text-gray-800">
                            {(() => {
                              const { p4, p6l, p610 } = getPriceSet(route);
                              return (
                                <>
                                  <div>4 Seater: ₹{p4}</div>
                                  <div>6 Seater Luxury SUV: ₹{p6l}</div>
                                  <div>6-10 Seater SUV: ₹{p610}</div>
                                </>
                              );
                            })()}
                        </div>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2 relative">
                        <span className="text-gray-500">Vehicle Type</span>
                        <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowDropdown(!showDropdown)}
                              className="font-bold text-gray-800 hover:text-primary transition-colors flex items-center gap-1"
                            >
                              {selectedCapacity || route.capacity}
                              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-2">
                                    {CAR_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleSelectCar(opt.value)}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${
                                                (selectedCapacity || route.capacity) === opt.value 
                                                    ? 'text-primary font-bold bg-primary/5' 
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                routeCapacity={selectedCapacity || route.capacity}
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
