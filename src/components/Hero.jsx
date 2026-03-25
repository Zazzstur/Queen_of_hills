import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-start justify-center pt-20">
      {/* Abstract Landscape Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-50" />
        
        {/* Sun/Light Source */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        {/* Far Hills */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-b from-[#0D9488] to-[#064E3B] opacity-60 transition-transform duration-[20s] ease-in-out hover:scale-105"
          style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 45%, 75% 35%, 50% 50%, 25% 40%, 0% 55%)' }}
        />
        
        {/* Mist Layer 1 */}
        <div className="absolute bottom-20 left-0 right-0 h-32 bg-white/30 blur-2xl" />

        {/* Mid Hills */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-b from-[#0F766E] to-[#064E3B] opacity-80"
          style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 60%, 60% 40%, 0% 70%)' }}
        />

        {/* Mist Layer 2 */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/40 to-transparent blur-xl" />

        {/* Foreground Hills */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[35%] bg-primary"
          style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 80%, 40% 50%, 0% 80%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl px-4 text-center mt-10 h-full">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-primary mb-6 animate-fade-in-up">
          Build your own <span className="text-orange-500">Journey</span>
          <span className="block mt-6 text-lg md:text-2xl lg:text-3xl font-normal text-gray-700">
            With Toils - Your favorite travel partner
          </span>
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-200 absolute left-0 right-0 bottom-[calc(28vh+200px)] px-4 sm:static sm:px-0 sm:bottom-auto">
          <Link to="/sight-seeing" className="bg-primary text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block">
            Sight Seeing
          </Link>
          <Link to="/direct-travel" className="bg-white/80 backdrop-blur-md text-primary border border-primary/20 px-8 py-3 rounded-full text-lg font-medium hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block">
            Direct Travel
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
