import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeService } from '../services/routeService';
import CarTypeModal from './CarTypeModal';
import { Filter, Star, ArrowRight, ChevronDown, Route, Car } from 'lucide-react';
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
    { id: 'routes', label: 'Sight Seeing', icon: Route },
    { id: 'direct', label: 'Direct Travel', icon: Car },
  ];

  const filters = ['Popular', 'All', 'Price: Low to High', 'Price: High to Low'];

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
  const filters = ['Popular', 'All', 'Price: Low to High', 'Price: High to Low'];

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

const TicketCard = ({ item, category, onNavigate }) => {
  const navigate = useNavigate();
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState('');

  const normalizeCapacity = (capacity) => {
    const c = String(capacity || '').toLowerCase();
    if (c.includes('luxury')) return '6 Seater Luxury SUV';
    if (c.includes('6-10') || c.includes('6 to 10') || c.includes('6–10')) return '6-10 Seater SUV';
    if (c.includes('4')) return '4 Seater';
    return '';
  };

  useEffect(() => {
    const normalized = normalizeCapacity(item?.capacity);
    setSelectedCapacity(normalized || '');
  }, [item?.id]);

  // Visual patterns based on category
  const getVisualPattern = () => {
    switch (category) {
      case 'routes':
        return {
          background: '#064E3B',
          iconBg: 'bg-accent',
          iconColor: 'text-white'
        };
      case 'direct':
        return {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Blue gradient for direct travel
          iconBg: 'bg-white',
          iconColor: 'text-blue-600'
        };
      default:
        return { background: '#F3F4F6' };
    }
  };

  const style = getVisualPattern();
  const Icon = category === 'direct' ? Car : Route;

  const handleViewDetails = () => {
      if (category === 'routes' || category === 'direct') {
          onNavigate('route-details', item.id);
      } else {
          // Fallback or generic navigation for other categories
          console.log('Navigate to details for', category, item.id);
      }
  };

  const handleBookNow = () => {
    if (category === 'routes' || category === 'direct') {
      setCarModalOpen(true);
      return;
    }
    handleViewDetails();
  };

  const handleSelectCar = (capacity) => {
    setSelectedCapacity(capacity);
    setCarModalOpen(false);
    navigate(`/route/${item.id}?capacity=${encodeURIComponent(capacity)}`);
  };

  return (
    <>
      <div 
        onClick={() => handleViewDetails()}
        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
      >
        {/* Visual Area */}
        <div className="w-full relative overflow-hidden bg-gray-100 aspect-[3/2]">
          {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
          ) : (
              <div className={clsx("w-full h-full flex items-center justify-center shadow-lg z-10", style.iconBg)}>
                  <Icon className={clsx("w-12 h-12", style.iconColor)} />
              </div>
          )}
          
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
             {item.price}
          </div>
        </div>

        {/* Info Area */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">{item.type}</span>
          </div>
          
          <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {(category === 'routes' || category === 'direct') && item.origin && item.destination && item.title !== `${item.origin} to ${item.destination}` && (
            <div className="text-xs text-gray-500 mb-2">
              {item.origin} <span className="mx-1">→</span> {item.destination}
            </div>
          )}
          
          <p className="text-sm text-gray-500 whitespace-pre-line line-clamp-3 md:line-clamp-4 mb-4 flex-1">
            {item.description}
          </p>

          <div className="flex items-center justify-end pt-4 border-t border-gray-50 mt-auto">
            <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookNow();
                }}
                className="flex items-center gap-1 text-sm text-primary font-bold group-hover:gap-2 transition-all"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <CarTypeModal
        isOpen={carModalOpen}
        onClose={() => setCarModalOpen(false)}
        route={item}
        selectedCapacity={selectedCapacity}
        onSelect={handleSelectCar}
        title="Choose Vehicle"
      />
    </>
  );
};

const ExperiencesListing = ({ initialCategory = 'routes', onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState(() =>
    initialCategory === 'direct' || initialCategory === 'routes' ? initialCategory : 'routes'
  );
  const [activeFilter, setActiveFilter] = useState('Popular');
  const navigate = useNavigate();
  const [realRoutes, setRealRoutes] = useState([]); // State for real routes from DB
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Update activeCategory when initialCategory changes and scroll to top
  React.useEffect(() => {
    setActiveCategory(initialCategory === 'direct' || initialCategory === 'routes' ? initialCategory : 'routes');
    window.scrollTo(0, 0);
  }, [initialCategory]);

  // Fetch Routes from Service
  useEffect(() => {
    const fetchRoutes = async () => {
        setLoadingRoutes(true);
        try {
            const { data } = await routeService.getRoutes();
            setRealRoutes(data || []);
        } catch (error) {
            console.error("Failed to fetch routes", error);
        } finally {
            setLoadingRoutes(false);
        }
    };

    if (activeCategory === 'routes' || activeCategory === 'direct') {
        fetchRoutes();
    }
  }, [activeCategory]);

  const filteredData = useMemo(() => {
    let data = [];

    const formatPrices = (route) => {
        const p4 = route.price4Seater ?? route.basePrice;
        const p6l = route.price6SeaterLuxurySuv ?? route.basePrice;
        const p610 = route.price6to10SeaterSuv ?? route.basePrice;
        return `₹${p4} | ₹${p6l} | ₹${p610}`;
    };
    
    if (activeCategory === 'routes') {
        // Map Routes to TicketCard format
        data = realRoutes
            .filter(r => !r.type || r.type === 'sightseeing')
            .map(route => ({
                id: route.id,
                title: route.name || `${route.origin} to ${route.destination}`,
                type: 'Sight Seeing', // or route.type if available
                price: formatPrices(route),
                duration: 'Flexible', // Route doesn't have duration in schema, maybe add or mock
                capacity: route.capacity,
                description: route.description || `Journey from ${route.origin} to ${route.destination}`,
                tags: ['Route', 'Travel'], // Mock tags
                image: route.coverImage,
                origin: route.origin,
                destination: route.destination,
                basePrice: route.basePrice,
                price4Seater: route.price4Seater,
                price6SeaterLuxurySuv: route.price6SeaterLuxurySuv,
                price6to10SeaterSuv: route.price6to10SeaterSuv,
                bookingCount: route.bookingCount ?? 0,
                // Add other fields required by TicketCard if any
            }));
    } else if (activeCategory === 'direct') {
        data = realRoutes
            .filter(r => r.type === 'direct')
            .map(route => ({
                id: route.id,
                title: route.name || `${route.origin} to ${route.destination}`,
                type: 'Direct Travel',
                price: formatPrices(route),
                duration: 'Point to Point',
                capacity: route.capacity,
                description: route.description || `Direct travel from ${route.origin} to ${route.destination}`,
                tags: ['Direct', 'Transfer'],
                image: route.coverImage,
                origin: route.origin,
                destination: route.destination,
                basePrice: route.basePrice,
                price4Seater: route.price4Seater,
                price6SeaterLuxurySuv: route.price6SeaterLuxurySuv,
                price6to10SeaterSuv: route.price6to10SeaterSuv,
                bookingCount: route.bookingCount ?? 0,
            }));
    } else {
        data = [];
    }
    
    // Simple mock sorting logic
    if (activeFilter === 'Popular') {
      return [...data].sort((a, b) => {
        const countA = Number(a.bookingCount ?? 0);
        const countB = Number(b.bookingCount ?? 0);
        if (countB !== countA) return countB - countA;
        return String(a.title || '').localeCompare(String(b.title || ''));
      });
    }
    if (activeFilter === 'Price: Low to High') {
       return [...data].sort((a, b) => {
           // Handle string price with symbols for mock data, number for real data
           const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0);
           const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0);
           return priceA - priceB;
       });
    }
    if (activeFilter === 'Price: High to Low') {
       return [...data].sort((a, b) => {
           const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price?.replace(/[^0-9.]/g, '') || 0);
           const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price?.replace(/[^0-9.]/g, '') || 0);
           return priceB - priceA;
       });
    }
    
    return data;
  }, [activeCategory, activeFilter, realRoutes]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {(activeCategory === 'routes' || activeCategory === 'direct') && loadingRoutes ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading routes...</div>
          ) : (
            filteredData.map((item) => (
              <TicketCard 
                  key={item.id} 
                  item={item} 
                  category={activeCategory} 
                  onNavigate={(page, id) => {
                      if (page === 'route-details') navigate(`/route/${id}`);
                      else if (page === 'experiences') navigate('/sight-seeing'); // Fallback
                  }} 
              />
            ))
          )}
          
          {(!loadingRoutes) && filteredData.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                  No items found in this category.
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExperiencesListing;
