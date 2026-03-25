import React, { useEffect, useState } from 'react';
import { Bed, Star, Clock, Users, ArrowRight } from 'lucide-react';
import { stayService } from '../services/stayService';

const StayCard = ({ stay, onNavigate }) => {
  const [minPrice, setMinPrice] = useState(null);

  useEffect(() => {
    const fetchMinPrice = async () => {
      try {
        const { data: rooms } = await stayService.getRoomsByStayId(stay.id);
        if (rooms && rooms.length > 0) {
          const prices = rooms.map(r => parseFloat(r.price));
          const min = Math.min(...prices);
          setMinPrice(min);
        } else {
            // Fallback if no rooms, try to parse from stay.price or set null
            setMinPrice(null); 
        }
      } catch (err) {
        console.error('Error fetching rooms for price:', err);
      }
    };
    fetchMinPrice();
  }, [stay.id]);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row h-full">
      {/* Visual Area */}
      <div 
        className="h-40 md:h-auto md:w-1/3 relative flex items-center justify-center overflow-hidden"
        style={{ background: 'repeating-linear-gradient(90deg, #F3F4F6, #F3F4F6 10px, #E5E7EB 10px, #E5E7EB 20px)' }}
      >
        {stay.thumbnail_url || stay.image ? (
             <img src={stay.thumbnail_url || stay.image} alt={stay.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10 bg-primary">
                <Bed className="w-6 h-6 text-white" />
            </div>
        )}
        
        {/* Decorative Elements (only if no image) */}
        {(!stay.thumbnail_url && !stay.image) && (
            <>
                <div className="absolute inset-0 bg-black/5" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </>
        )}
      </div>

      {/* Info Area */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold tracking-wider text-accent uppercase">{stay.type}</span>
            <div className="flex items-center text-gray-400">
               <Star className="w-3 h-3 fill-current text-accent mr-1" />
               <span className="text-xs text-gray-600">4.8</span>
            </div>
          </div>
          
          <h3 className="font-serif text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
            {stay.title || stay.name}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {stay.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {(stay.amenities || stay.tags || []).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-secondary rounded text-[10px] text-gray-600 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
             <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" /> Per Night
             </div>
             <div className="flex items-center text-xs text-gray-500">
                <Users className="w-3 h-3 mr-1" /> {stay.capacity || '2 Guests'}
             </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
                {minPrice ? `₹${minPrice.toLocaleString()}` : (stay.price || 'On Request')}
            </div>
            <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate('stay-details', stay.id);
                }}
                className="text-xs font-semibold text-accent flex items-center hover:underline mt-1 group/btn"
            >
              Book Now <ArrowRight className="w-3 h-3 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StayCard;
