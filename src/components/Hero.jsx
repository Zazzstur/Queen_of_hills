import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
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
      <div className="relative z-10 w-full max-w-4xl px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-primary mb-6 animate-fade-in-up">
          Find your peace in <span className="text-accent italic">Darjeeling</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-100">
          Discover the Queen of the Hills through curated heritage experiences and breathtaking landscapes.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-200">
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
