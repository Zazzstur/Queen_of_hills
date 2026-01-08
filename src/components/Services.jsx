import React from 'react';
import { Bed, Car, Coffee } from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, description, delay, onClick }) => (
  <div 
    className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 border border-gray-100 flex flex-col items-center text-center group h-full"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-2xl font-serif text-primary mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
    <button 
      onClick={onClick}
      className="mt-6 px-6 py-2 border border-[#064E3B] text-[#064E3B] text-xs uppercase tracking-wider font-medium rounded-full hover:bg-[#064E3B] hover:text-white transition-all duration-300"
    >
      Explore
    </button>
  </div>
);

const Services = ({ onNavigate }) => {
  const services = [
    {
      icon: Bed,
      title: "Heritage Stays",
      description: "Experience the charm of the colonial era in our carefully curated heritage bungalows and boutique hotels.",
      delay: 0,
      category: 'stays'
    },
    {
      icon: Car,
      title: "Expert Cabs",
      description: "Premium transportation services with experienced local drivers for a safe and comfortable journey.",
      delay: 100,
      category: 'cabs'
    },
    {
      icon: Coffee,
      title: "Tea Tours",
      description: "Guided visits to world-renowned tea estates. Witness the journey from leaf to cup.",
      delay: 200,
      category: 'tours'
    }
  ];

  return (
    <section id="experiences" className="py-20 px-4 md:px-8 bg-snow relative z-10">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">Curated Experiences</h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index} 
              {...service} 
              onClick={() => onNavigate('experiences', service.category)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
