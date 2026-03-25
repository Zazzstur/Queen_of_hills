import React, { useState, useEffect } from 'react';
import { routeService } from '../services/routeService';
import { ArrowRight, Users, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CarTypeModal from './CarTypeModal';

const PopularRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);

  const formatPrices = (route) => {
    const p4 = route.price4Seater ?? route.basePrice;
    const p6l = route.price6SeaterLuxurySuv ?? route.basePrice;
    const p610 = route.price6to10SeaterSuv ?? route.basePrice;
    return `₹${p4} / ₹${p6l} / ₹${p610}`;
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data, error } = await routeService.getTopBookedRoutes({
          limit: 10,
          routeType: 'sightseeing',
        });
        if (!error && data) {
          setRoutes(data.slice(0, 10));
        }
      } catch (err) {
        console.error("Failed to fetch routes for ticker", err);
      }
    };
    fetchRoutes();
  }, []);

  if (routes.length === 0) return null;

  const openCarPicker = (route) => {
    setActiveRoute(route);
    setCarModalOpen(true);
  };

  const closeCarPicker = () => {
    setCarModalOpen(false);
    setActiveRoute(null);
  };

  const handleSelectCar = (capacity) => {
    if (!activeRoute) return;
    const url = `/route/${activeRoute.id}?capacity=${encodeURIComponent(capacity)}`;
    closeCarPicker();
    navigate(url);
  };

  return (
    <section className="py-12 bg-white relative z-20 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8 text-center">
          Popular Sight Seeing
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar px-4" style={{ scrollBehavior: 'smooth' }}>
          {routes.map((route) => (
            <div 
              key={route.id} 
              onClick={() => navigate(`/route/${route.id}`)}
              className="flex-shrink-0 w-80 md:w-96 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer snap-center group"
            >
              {/* Image Area */}
              <div className="h-48 relative overflow-hidden bg-gray-100">
                 {route.coverImage ? (
                    <img 
                        src={route.coverImage} 
                        alt={`${route.origin} to ${route.destination}`} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Route className="w-12 h-12" />
                    </div>
                 )}
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    {formatPrices(route)}
                 </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Sight Seeing</span>
                </div>
                
                <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                    {route.name || (
                        <>
                            {route.origin} <span className="text-gray-400 mx-1">to</span> {route.destination}
                        </>
                    )}
                </h3>

                {route.name && route.origin && route.destination && (
                  <div className="text-xs text-gray-500 mb-2">
                    {route.origin} <span className="mx-1">→</span> {route.destination}
                  </div>
                )}
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {route.description || `Enjoy a scenic journey from ${route.origin} to ${route.destination}.`}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-4 h-4" /> 
                        <span>{route.capacity}</span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openCarPicker(route);
                        }}
                        className="flex items-center gap-1 text-sm text-primary font-bold group-hover:gap-2 transition-all"
                    >
                        Book Now <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CarTypeModal
        isOpen={carModalOpen}
        onClose={closeCarPicker}
        route={activeRoute}
        selectedCapacity={activeRoute?.capacity}
        onSelect={handleSelectCar}
        title="Select car & continue"
      />
    </section>
  );
};

export default PopularRoutes;
