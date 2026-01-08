import React, { useState, useMemo } from 'react';
import { experiencesData } from '../data/experiences';
import { Filter, Star, Clock, Users, ArrowRight, Car, Coffee, Bed, Package, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// --- Components ---

const CompactHero = () => (
  <section className="relative h-[30vh] min-h-[250px] w-full overflow-hidden flex items-center justify-center bg-primary">
    {/* Animated Emerald Mesh Gradient */}
    <div className="absolute inset-0 opacity-80">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#0D9488] to-[#064E3B]" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            backgroundSize: '30px 30px'
        }}
      />
    </div>
    
    <div className="relative z-10 text-center px-4">
      <h1 className="text-3xl md:text-5xl font-serif text-white mb-2 drop-shadow-lg">
        Curated Experiences
      </h1>
      <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto font-light">
        Discover the finest stays, journeys, and stories Darjeeling has to offer.
      </p>
    </div>
  </section>
);

const CategoryNav = ({ activeCategory, setActiveCategory, activeFilter, setActiveFilter }) => {
  const [isServiceOpen, setServiceOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  
  const categories = [
    { id: 'stays', label: 'Heritage Stays', icon: Bed },
    { id: 'cabs', label: 'Expert Cabs', icon: Car },
    { id: 'tours', label: 'Tea Tours', icon: Coffee },
    { id: 'packages', label: 'Packages', icon: Package },
  ];

  const filters = ['All', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

  const activeLabel = categories.find(c => c.id === activeCategory)?.label;
  const activeFilterLabel = activeFilter.replace('Price: ', '');
  
  return (
    <div className="sticky top-[72px] md:top-[80px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-4 md:py-4">
        {/* Mobile: Two Dropdowns Side-by-Side */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {/* Service Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setServiceOpen(!isServiceOpen);
                setFilterOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-200 text-primary font-medium shadow-sm active:bg-gray-50 transition-colors h-[50px]"
            >
              <span className="mr-2 flex-1 text-center text-xs leading-tight line-clamp-2">{activeLabel}</span>
              <ChevronDown className={clsx("w-4 h-4 flex-shrink-0 transition-transform duration-300", isServiceOpen && "rotate-180")} />
            </button>
            
            <div className={clsx(
              "absolute top-full left-0 w-[200%] mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 origin-top z-50",
              isServiceOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
            )}>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setServiceOpen(false);
                    }}
                    className={clsx(
                      "w-full flex items-center px-4 py-3 text-left transition-colors",
                      activeCategory === cat.id ? "bg-primary/5 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setFilterOpen(!isFilterOpen);
                setServiceOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm active:bg-gray-50 transition-colors h-[50px]"
            >
               <span className="mr-2 flex-1 text-center text-xs leading-tight line-clamp-2">{activeFilterLabel}</span>
              <ChevronDown className={clsx("w-4 h-4 flex-shrink-0 transition-transform duration-300", isFilterOpen && "rotate-180")} />
            </button>

            <div className={clsx(
              "absolute top-full right-0 w-[200%] mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 origin-top z-50",
              isFilterOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
            )}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setFilterOpen(false);
                  }}
                  className={clsx(
                    "w-full px-4 py-3 text-left transition-colors text-sm",
                    activeFilter === filter ? "bg-primary/5 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {filter.replace('Price: ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex space-x-4 min-w-max overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'flex items-center px-4 py-2.5 rounded-full text-base font-medium transition-all duration-300 border',
                  isActive
                    ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                    : 'bg-white text-primary border-gray-200 hover:border-primary hover:bg-gray-50'
                )}
              >
                <Icon className={clsx("w-4 h-4 mr-2", isActive ? "text-accent" : "text-primary")} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FilterStrip = ({ activeFilter, setActiveFilter }) => {
  const filters = ['All', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

  return (
    <div className="bg-secondary/50 py-3 border-b border-gray-200 hidden md:block">
      <div className="container mx-auto px-4 flex items-center space-x-3 overflow-x-auto no-scrollbar">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              activeFilter === filter
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

const TicketCard = ({ item, category }) => {
  // Visual patterns based on category
  const getVisualPattern = () => {
    switch (category) {
      case 'stays':
        return {
          background: 'repeating-linear-gradient(90deg, #F3F4F6, #F3F4F6 10px, #E5E7EB 10px, #E5E7EB 20px)',
          iconBg: 'bg-primary',
          iconColor: 'text-white'
        };
      case 'cabs':
        return {
          background: '#064E3B',
          iconBg: 'bg-accent',
          iconColor: 'text-white'
        };
      case 'tours':
        return {
          background: 'radial-gradient(circle at top right, #D97706, #064E3B)',
          iconBg: 'bg-white/20 backdrop-blur-sm',
          iconColor: 'text-white'
        };
      case 'packages':
        return {
          background: 'linear-gradient(135deg, #064E3B, #0D9488, #D97706)',
          iconBg: 'bg-white',
          iconColor: 'text-primary'
        };
      default:
        return { background: '#F3F4F6' };
    }
  };

  const style = getVisualPattern();
  const Icon = category === 'stays' ? Bed : category === 'cabs' ? Car : category === 'tours' ? Coffee : Package;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row h-full">
      {/* Visual Area (Left/Top) */}
      <div 
        className="h-40 md:h-auto md:w-1/3 relative flex items-center justify-center overflow-hidden"
        style={{ background: style.background }}
      >
        <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10", style.iconBg)}>
          <Icon className={clsx("w-6 h-6", style.iconColor)} />
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Info Area (Right/Bottom) */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold tracking-wider text-accent uppercase">{item.type}</span>
            <div className="flex items-center text-gray-400">
               <Star className="w-3 h-3 fill-current text-accent mr-1" />
               <span className="text-xs text-gray-600">4.8</span>
            </div>
          </div>
          
          <h3 className="font-serif text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
            {item.title}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-secondary rounded text-[10px] text-gray-600 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
             <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" /> {item.duration}
             </div>
             <div className="flex items-center text-xs text-gray-500">
                <Users className="w-3 h-3 mr-1" /> {item.capacity}
             </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{item.price}</div>
            <button className="text-xs font-semibold text-accent flex items-center hover:underline mt-1 group/btn">
              View Details <ArrowRight className="w-3 h-3 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExperiencesListing = ({ initialCategory = 'stays' }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeFilter, setActiveFilter] = useState('All');

  // Update activeCategory when initialCategory changes and scroll to top
  React.useEffect(() => {
    setActiveCategory(initialCategory);
    window.scrollTo(0, 0);
  }, [initialCategory]);

  const filteredData = useMemo(() => {
    let data = experiencesData[activeCategory] || [];
    
    // Simple mock sorting logic
    if (activeFilter === 'Price: Low to High') {
       // Note: This is a string sort for now as prices are strings in mock data
       // In a real app, parse the price first
       return [...data].sort((a, b) => a.price.localeCompare(b.price));
    }
    if (activeFilter === 'Price: High to Low') {
       return [...data].sort((a, b) => b.price.localeCompare(a.price));
    }
    
    return data;
  }, [activeCategory, activeFilter]);

  return (
    <div className="min-h-screen bg-snow pb-20">
      <CompactHero />
      <CategoryNav 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <FilterStrip activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filteredData.map((item) => (
            <TicketCard key={item.id} item={item} category={activeCategory} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExperiencesListing;
