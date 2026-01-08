import React from 'react';

const PackageCard = ({ title, gradient, description, price }) => (
  <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
    {/* Background Gradient */}
    <div 
      className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
      style={{ background: gradient }}
    />
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
    
    {/* Content */}
    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
      <h3 className="text-2xl font-serif font-bold mb-2 transform group-hover:-translate-y-2 transition-transform duration-300">{title}</h3>
      
      <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <p className="text-sm font-medium mb-4 text-gray-100">{description}</p>
        <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/30">
          {price}
        </span>
      </div>
    </div>
  </div>
);

const Packages = ({ onNavigate }) => {
  const packages = [
    {
      title: "Tea Plucking",
      gradient: "linear-gradient(135deg, #064E3B 0%, #10B981 100%)",
      description: "Join the tea pickers at dawn and learn the art of 'two leaves and a bud'.",
      price: "From ₹2,500/person"
    },
    {
      title: "Monastery Loops",
      gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
      description: "Spiritual journey through Ghoom and Japanese Peace Pagoda.",
      price: "From ₹1,800/person"
    },
    {
      title: "Tiger Hill Sunrise",
      gradient: "linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)",
      description: "Witness the first light on Kanchenjunga from 8,400 ft.",
      price: "From ₹3,000/jeep"
    },
    {
      title: "River Rafting",
      gradient: "linear-gradient(135deg, #0E7490 0%, #22D3EE 100%)",
      description: "Adventure on the Teesta river with Grade 3 & 4 rapids.",
      price: "From ₹4,500/boat"
    }
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">Popular Packages</h2>
            <p className="text-gray-600">Designed for the discerning traveler seeking authenticity.</p>
          </div>
          <button 
            onClick={() => onNavigate('experiences', 'packages')}
            className="hidden md:block text-primary font-medium hover:text-accent transition-colors underline-offset-4 hover:underline mt-4 md:mt-0"
          >
            View all packages
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <PackageCard key={index} {...pkg} />
          ))}
        </div>

        <button 
          onClick={() => onNavigate('experiences', 'packages')}
          className="md:hidden w-full mt-8 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
        >
          View all packages
        </button>
      </div>
    </section>
  );
};

export default Packages;
