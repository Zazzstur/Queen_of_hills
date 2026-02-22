import React, { useState, useRef } from 'react';
import { Plus, MapPin, Image as ImageIcon, Minus } from 'lucide-react';

const StopDisplayCard = ({ stop, onAdd, isSelected }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef(null);

  // Handle image scrolling to update dots
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const width = carouselRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentImageIndex(index);
    }
  };

  const images = stop.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden flex flex-col relative group transition-shadow hover:shadow-lg">
      
      {/* 1. Carousel Section (40% height approx via aspect ratio) */}
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        {hasImages ? (
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full flex-shrink-0 snap-center h-full">
                <img 
                  src={img.url || img.preview} 
                  alt={`${stop.name} view ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {/* Indicators */}
        {hasImages && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentImageIndex === idx ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Gradient Overlay for text readability if needed, but we separate content below */}
      </div>

      {/* 2. Content Layout */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {stop.name}
            </h3>
        </div>

        {/* Price */}
        <div className="text-xl font-bold text-primary mb-2">
            {stop.detourPrice > 0 ? `₹${stop.detourPrice}` : <span className="text-green-600 text-lg">Free</span>}
            {stop.detourPrice > 0 && <span className="text-xs text-gray-500 font-normal ml-1">detour</span>}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
            {stop.description || "No description available for this stop."}
        </p>

        {/* Footer / Meta */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-400">
                <MapPin className="w-3 h-3 mr-1" />
                <span>Recommended Stop</span>
            </div>
            
            <button
                onClick={() => onAdd && onAdd(stop)}
                aria-label={isSelected ? `Remove ${stop.name} from route` : `Add ${stop.name} to route`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors active:scale-95 ${
                    isSelected 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
            >
                {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isSelected ? 'Remove' : 'Add Stop'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default StopDisplayCard;
