import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { routeService } from '../../services/routeService';
import AdminLogin from './AdminLogin';
import ServiceTable from './ServiceTable';
import AddRouteForm from './AddRouteForm';
import DeleteConfirmation from './DeleteConfirmation';
import BookingsManagement from './BookingsManagement';
import ContactMessagesManagement from './ContactMessagesManagement';
import { LayoutDashboard, LogOut, Route as RouteIcon, Car, ClipboardList, Mail } from 'lucide-react';

const TABS = [
  { id: 'routes', label: 'Sight Seeing', icon: RouteIcon },
  { id: 'direct', label: 'Direct Travel', icon: Car },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'contact', label: 'Contact', icon: Mail },
];

const FIELD_CONFIG = {
  routes: [
    { key: 'name', label: 'Route Name', required: true },
    { key: 'origin', label: 'Origin', required: true },
    { key: 'destination', label: 'Destination', required: true },
    { 
      key: 'prices', 
      label: 'Prices',
      render: (_v, item) => {
        const p4 = item.price4Seater ?? item.basePrice;
        const p6l = item.price6SeaterLuxurySuv ?? item.basePrice;
        const p610 = item.price6to10SeaterSuv ?? item.basePrice;
        return `₹${p4} | ₹${p6l} | ₹${p610}`;
      }
    },
    { key: 'capacity', label: 'Default Vehicle' },
    // Route display config for table
  ],
  direct: [
    { key: 'name', label: 'Route Name', required: true },
    { key: 'origin', label: 'Origin', required: true },
    { key: 'destination', label: 'Destination', required: true },
    { 
      key: 'prices', 
      label: 'Prices',
      render: (_v, item) => {
        const p4 = item.price4Seater ?? item.basePrice;
        const p6l = item.price6SeaterLuxurySuv ?? item.basePrice;
        const p610 = item.price6to10SeaterSuv ?? item.basePrice;
        return `₹${p4} | ₹${p6l} | ₹${p610}`;
      }
    },
    { key: 'capacity', label: 'Default Vehicle' },
  ]
};

const AdminDashboard = () => {
  const { isAuthenticated, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('routes');
  
  // Local state for routes fetched from Supabase
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState(null);
  
  // Modal States
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Delete States
  const [deleteId, setDeleteId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState('');

  // Fetch routes when activeTab is 'routes' or 'direct'
  useEffect(() => {
    if (activeTab === 'routes' || activeTab === 'direct') {
      fetchRoutes();
    }
  }, [activeTab]);

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    setRouteError(null);
    try {
      const { data: fetchedRoutes, error } = await routeService.getRoutes();
      if (error) throw error;
      setRoutes(fetchedRoutes || []);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      const errorMessage = err.message || "Failed to load routes from database.";
      setRouteError(errorMessage);
    } finally {
      setLoadingRoutes(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleAdd = () => {
    if (activeTab === 'routes' || activeTab === 'direct') {
        setEditingItem(null);
        setIsAddingRoute(true);
    }
  };

  const handleEdit = (item) => {
    // Process tags array to string for editing if needed
    const processedItem = { ...item };
    if (Array.isArray(item.tags)) {
        processedItem.tags = item.tags.join(', ');
    }
    setEditingItem(processedItem);
    
    if (activeTab === 'routes' || activeTab === 'direct') {
        setIsAddingRoute(true);
    }
  };

  const handleDeleteClick = (id) => {
    if (activeTab !== 'routes' && activeTab !== 'direct') return;
    // Determine the item source based on active tab
    const list = routes;
    const item = list.find(i => i.id === id);
    
    if (item) {
        setDeleteItemName(item.name || item.title || item.origin + ' to ' + item.destination);
        setDeleteId(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
        try {
            const { error } = await routeService.deleteRoute(deleteId);
            if (error) throw error;
            setRoutes(prev => prev.filter(r => r.id !== deleteId));
        } catch (err) {
            console.error("Failed to delete route:", err);
            alert("Failed to delete route. Please try again.");
        }
        setDeleteId(null);
    }
  };

  const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || LayoutDashboard;

  // Determine data source for current tab
  const currentData = (activeTab === 'routes' || activeTab === 'direct')
    ? routes.filter(r => {
        if (activeTab === 'direct') return r.type === 'direct';
        return !r.type || r.type === 'sightseeing';
    })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Admin</h1>
        </div>
        <nav className="p-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ActiveIcon className="w-6 h-6 text-gray-400" />
                    {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Manage your service offerings and details.</p>
            </div>
            <div className="text-sm text-gray-500">
                Logged in as Admin
            </div>
        </header>

        {isAddingRoute ? (
          <AddRouteForm 
            initialData={editingItem}
            defaultType={activeTab === 'direct' ? 'direct' : 'sightseeing'}
            onComplete={() => {
              setIsAddingRoute(false);
              setEditingItem(null);
              fetchRoutes(); // Refresh routes from Supabase
            }}
            onCancel={() => {
                setIsAddingRoute(false);
                setEditingItem(null);
            }}
          />
        ) : activeTab === 'bookings' ? (
          <BookingsManagement />
        ) : activeTab === 'contact' ? (
          <ContactMessagesManagement />
        ) : (
          <>
            {(activeTab === 'routes' || activeTab === 'direct') && routeError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {routeError}
                </div>
            )}
            
            {(activeTab === 'routes' || activeTab === 'direct') && loadingRoutes ? (
                <div className="text-center py-12 text-gray-500">Loading routes...</div>
            ) : (
                <ServiceTable
                    title={TABS.find(t => t.id === activeTab)?.label}
                    data={currentData}
                    fields={FIELD_CONFIG[activeTab]}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <DeleteConfirmation
              isOpen={!!deleteId}
              onClose={() => setDeleteId(null)}
              onConfirm={handleConfirmDelete}
              itemName={deleteItemName}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
