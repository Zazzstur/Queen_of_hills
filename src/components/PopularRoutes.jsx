import React, { useState, useEffect } from 'react';
import { routeService } from '../services/routeService';
import { ArrowRight, Users, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PopularRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data, error } = await routeService.getRoutes();
        if (!error && data) {
          setRoutes(data);
        }
      } catch (err) {
        console.error("Failed to fetch routes for ticker", err);
      }
    };
    fetchRoutes();
  }, []);

  if (routes.length === 0) return null;

  return (
    <section className="py-12 bg-white relative z-20 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8 text-center">
          Popular Routes
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
                        <Car className="w-12 h-12" />
                    </div>
                 )}
                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    ₹{route.basePrice}
                 </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Expert Cab</span>
                </div>
                
                <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                    {route.origin} <span className="text-gray-400 mx-1">to</span> {route.destination}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {route.description || `Enjoy a scenic journey from ${route.origin} to ${route.destination}.`}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-4 h-4" /> 
                        <span>{route.capacity}</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-primary font-bold group-hover:gap-2 transition-all">
                        Book Now <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
