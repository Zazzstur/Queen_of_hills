import React, { useEffect, useRef, useState } from 'react';

const ToyTrain = () => {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      
      // Calculate how much of the element has been scrolled past
      // 0 when element enters viewport, 1 when it leaves
      const scrollPercentage = (windowHeight - rect.top) / (windowHeight + elementHeight);
      
      if (scrollPercentage >= 0 && scrollPercentage <= 1) {
        setProgress(scrollPercentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-24 overflow-hidden bg-secondary/30 relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        {/* Track */}
        <div className="w-full border-t-4 border-dashed border-primary/30 relative top-[18px]" />
        
        {/* Train Container */}
        <div 
          className="relative transition-transform duration-100 ease-linear will-change-transform"
          style={{ transform: `translateX(${progress * 60 - 30}%)` }} // Moves from -30% to 30% of screen width
        >
          <div className="relative inline-block text-primary">
             {/* Steam Puff Animation */}
             <div className="absolute -top-8 right-4 flex space-x-1 opacity-60">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping delay-0" />
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-ping delay-100" />
              <div className="w-4 h-4 bg-gray-200 rounded-full animate-ping delay-200" />
            </div>

            {/* Simple CSS/SVG Steam Engine Silhouette */}
            <svg width="120" height="60" viewBox="0 0 120 60" fill="currentColor" className="drop-shadow-lg">
              {/* Wheels */}
              <circle cx="20" cy="50" r="8" />
              <circle cx="45" cy="50" r="8" />
              <circle cx="75" cy="50" r="10" />
              
              {/* Connecting Rod */}
              <rect x="20" y="48" width="55" height="4" rx="2" className="animate-pulse" />
              
              {/* Body */}
              <path d="M10 40 L85 40 L85 20 L60 20 L60 10 L45 10 L45 20 L10 20 Z" />
              
              {/* Cabin */}
              <path d="M85 40 L110 40 L110 15 L85 15 Z" />
              <rect x="90" y="20" width="15" height="10" fill="white" fillOpacity="0.5" />
              
              {/* Chimney */}
              <path d="M25 20 L25 5 L35 2 L40 5 L40 20 Z" />
              
              {/* Cowcatcher */}
              <path d="M10 40 L0 50 L10 50 Z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToyTrain;
