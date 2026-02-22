import React, { useRef } from 'react';

// Reusable Boogie Component
const Boogie = ({ xOffset, delay }) => (
  <g transform={`translate(${xOffset}, 0)`}>
    {/* Connector */}
    <rect x="-5" y="45" width="5" height="4" fill="#4B5563" />
    
    {/* Body Container for Hover/Animation effects */}
    <g className="hover:-translate-y-1 transition-transform duration-300">
      {/* Main Body - Blue from reference */}
      <rect x="0" y="18" width="75" height="27" rx="2" fill="#1e3a8a" />
      
      {/* Roof - Slightly lighter/greyer */}
      <path d="M-1 18 Q37.5 14 76 18 L76 20 L-1 20 Z" fill="#374151" />
      
      {/* White Stripe */}
      <rect x="0" y="30" width="75" height="2" fill="white" fillOpacity="0.9" />
      
      {/* Windows - White with opacity */}
      <g fill="white" fillOpacity="0.7">
        <rect x="5" y="22" width="10" height="6" rx="1" />
        <rect x="18" y="22" width="10" height="6" rx="1" />
        <rect x="31" y="22" width="10" height="6" rx="1" />
        <rect x="44" y="22" width="10" height="6" rx="1" />
        <rect x="57" y="22" width="10" height="6" rx="1" />
      </g>
      
      {/* Door outline/detail */}
      <rect x="70" y="20" width="3" height="23" fill="black" fillOpacity="0.2" />
    </g>

    {/* Wheels with Spoke Animation */}
    <g className="wheel-anim" style={{ animationDelay: `${delay}ms` }}>
      <circle cx="15" cy="50" r="7" fill="#1f2937" />
      <circle cx="15" cy="50" r="3" fill="#4b5563" />
      <line x1="15" y1="43" x2="15" y2="57" stroke="#9ca3af" strokeWidth="1" />
      <line x1="8" y1="50" x2="22" y2="50" stroke="#9ca3af" strokeWidth="1" />
    </g>
    <g className="wheel-anim" style={{ animationDelay: `${delay}ms` }}>
      <circle cx="60" cy="50" r="7" fill="#1f2937" />
      <circle cx="60" cy="50" r="3" fill="#4b5563" />
      <line x1="60" y1="43" x2="60" y2="57" stroke="#9ca3af" strokeWidth="1" />
      <line x1="53" y1="50" x2="67" y2="50" stroke="#9ca3af" strokeWidth="1" />
    </g>
  </g>
);

// Pine Tree Component (Unused in current scene but kept for potential future use)
const PineTree = ({ x, scale = 1, opacity = 1, color = "#2E8B57" }) => {
  return (
    <g transform={`translate(${x}, 0) scale(${scale})`} opacity={opacity}>
      <rect x="12" y="50" width="6" height="20" fill="#4B3621" />
      <path d="M15 5 L28 35 L2 35 Z" fill={color} />
      <path d="M15 20 L30 50 L0 50 Z" fill={color} filter="brightness(0.9)" />
      <path d="M15 35 L32 65 L-2 65 Z" fill={color} filter="brightness(0.8)" />
    </g>
  );
};

const ToyTrain = () => {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="py-32 overflow-hidden bg-sky-50/50 relative">
      {/* Scene Layer: Track Only */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Track Div - Positioned absolutely to align with train wheels */}
        <div className="absolute top-1/2 left-0 w-full h-4 mt-[10px] z-0"> 
            <div className="w-full h-full relative">
                 {/* Sleepers */}
                 <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #5D4037 0px, #5D4037 6px, transparent 6px, transparent 24px)' }}></div>
                 {/* Rails */}
                 <div className="absolute top-[2px] w-full h-1 bg-gray-400"></div> {/* Far rail */}
                 <div className="absolute top-[10px] w-full h-1 bg-gray-500"></div> {/* Near rail */}
            </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10">
        {/* Train Container with Infinite Marquee Animation */}
        <style>{`
          @keyframes train-loop {
            from { transform: translateX(100vw); }
            to { transform: translateX(-100%); }
          }
          .train-moving {
            animation: train-loop 15s linear infinite;
            /* Ensures smoother animation on some devices */
            will-change: transform;
          }
        `}</style>
        <div 
          className="relative inline-block train-moving"
        >
          <div className="relative inline-block">
             {/* Steam Puff Animation */}
             <style>{`
               @keyframes smoke-puff {
                 0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                 100% { transform: translate(20px, -20px) scale(2.5); opacity: 0; }
               }
               .smoke-anim {
                 animation: smoke-puff 1.5s ease-out infinite;
               }
             `}</style>
             <div className="absolute -top-4 left-[30px] flex z-20 pointer-events-none">
              <div className="w-2 h-2 bg-gray-400 rounded-full smoke-anim" style={{ animationDelay: '0ms' }} />
              <div className="absolute w-3 h-3 bg-gray-300 rounded-full smoke-anim" style={{ animationDelay: '300ms' }} />
              <div className="absolute w-4 h-4 bg-gray-200 rounded-full smoke-anim" style={{ animationDelay: '600ms' }} />
            </div>

            <svg width="400" height="60" viewBox="0 0 400 60" fill="none" className="drop-shadow-lg overflow-visible">
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes rod-move {
                  0% { transform: translateX(0); }
                  50% { transform: translateX(3px); }
                  100% { transform: translateX(0); }
                }
                .wheel-anim {
                  animation: spin 2s linear infinite;
                  transform-box: fill-box;
                  transform-origin: center;
                }
                .rod-anim {
                  animation: rod-move 2s linear infinite;
                }
              `}</style>
              
              {/* --- ENGINE --- */}
              <g className="text-blue-900">
                {/* Wheels Group with Spokes */}
                <g>
                  <g className="wheel-anim">
                    <circle cx="20" cy="50" r="8" fill="#1f2937" />
                    <circle cx="20" cy="50" r="3" fill="#4b5563" />
                    <line x1="20" y1="42" x2="20" y2="58" stroke="#9ca3af" strokeWidth="1" />
                    <line x1="12" y1="50" x2="28" y2="50" stroke="#9ca3af" strokeWidth="1" />
                  </g>
                  <g className="wheel-anim">
                    <circle cx="45" cy="50" r="8" fill="#1f2937" />
                    <circle cx="45" cy="50" r="3" fill="#4b5563" />
                    <line x1="45" y1="42" x2="45" y2="58" stroke="#9ca3af" strokeWidth="1" />
                    <line x1="37" y1="50" x2="53" y2="50" stroke="#9ca3af" strokeWidth="1" />
                  </g>
                  <g className="wheel-anim">
                    <circle cx="75" cy="50" r="10" fill="#1f2937" />
                    <circle cx="75" cy="50" r="4" fill="#4b5563" />
                    <line x1="75" y1="40" x2="75" y2="60" stroke="#9ca3af" strokeWidth="1" />
                    <line x1="65" y1="50" x2="85" y2="50" stroke="#9ca3af" strokeWidth="1" />
                  </g>
                </g>
                
                {/* Connecting Rod */}
                <rect x="20" y="48" width="55" height="4" rx="2" fill="#9ca3af" className="rod-anim" />
                
                {/* Body - Main Engine Blue */}
                <path d="M10 40 L85 40 L85 20 L60 20 L60 10 L45 10 L45 20 L10 20 Z" fill="#1e3a8a" />
                
                {/* Cabin */}
                <path d="M85 40 L110 40 L110 15 L85 15 Z" fill="#1e3a8a" />
                {/* Cabin Roof */}
                <path d="M82 15 L113 15 L113 17 L82 17 Z" fill="#374151" />
                <rect x="90" y="20" width="15" height="10" fill="white" fillOpacity="0.5" />
                
                {/* Chimney */}
                <path d="M25 20 L25 5 L35 2 L40 5 L40 20 Z" fill="#1e3a8a" />
                <rect x="23" y="2" width="20" height="3" fill="#374151" />
                
                {/* Cowcatcher */}
                <path d="M10 40 L0 50 L10 50 Z" fill="#374151" />
                
                {/* White Stripe Details */}
                 <rect x="10" y="32" width="75" height="2" fill="white" fillOpacity="0.9" />
              </g>

              {/* --- BOOGIES --- */}
              <Boogie xOffset={115} delay={100} />
              <Boogie xOffset={195} delay={200} />
              <Boogie xOffset={275} delay={300} />

            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToyTrain;
