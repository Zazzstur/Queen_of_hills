import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { routeService } from '../../services/routeService';
import AdminLogin from './AdminLogin';
import ServiceTable from './ServiceTable';
import ServiceModal from './ServiceModal';
import AddStayForm from './AddStayForm';
import AddRouteForm from './AddRouteForm';
import DeleteConfirmation from './DeleteConfirmation';
import { LayoutDashboard, Home, Car, Map, Coffee, LogOut, Route as RouteIcon } from 'lucide-react';

const TABS = [
  { id: 'stays', label: 'Homestays', icon: Home },
  { id: 'cabs', label: 'Cabs', icon: Car },
  { id: 'routes', label: 'Routes', icon: RouteIcon },
  { id: 'packages', label: 'Packages', icon: Map },
  { id: 'tours', label: 'Tea Tours', icon: Coffee },
];

const FIELD_CONFIG = {
  stays: [
    { key: 'title', label: 'Name', required: true },
    { key: 'type', label: 'Type', type: 'select', options: ['Heritage Stay', 'Homestay', 'Hotel', 'Resort'] },
    { key: 'price', label: 'Price', required: true, hiddenInTable: true },
    { key: 'capacity', label: 'Capacity', hiddenInTable: true },
    { key: 'image', label: 'Image URL', type: 'text', hiddenInTable: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma separated)', hiddenInTable: true },
  ],
  routes: [
    { key: 'origin', label: 'Origin', required: true },
    { key: 'destination', label: 'Destination', required: true },
    { key: 'basePrice', label: 'Base Price', required: true },
    { key: 'capacity', label: 'Capacity' },
    // Route display config for table
  ],
  cabs: [
    { key: 'title', label: 'Vehicle Name', required: true },
    { key: 'type', label: 'Service Type', type: 'select', options: ['Expert Cab', 'Shared', 'Rental'] },
    { key: 'price', label: 'Price', required: true },
    { key: 'duration', label: 'Duration' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'image', label: 'Image URL', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  packages: [
    { key: 'title', label: 'Package Name', required: true },
    { key: 'duration', label: 'Duration' },
    { key: 'price', label: 'Price', required: true },
    { key: 'capacity', label: 'Ideal For' },
    { key: 'image', label: 'Image URL', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  tours: [
    { key: 'title', label: 'Tour Name', required: true },
    { key: 'duration', label: 'Duration' },
    { key: 'price', label: 'Price', required: true },
    { key: 'image', label: 'Image URL', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ]
};

const AdminDashboard = () => {
  const { isAuthenticated, logout, data, addItem, updateItem, deleteItem, refreshData } = useAdmin();
  const [activeTab, setActiveTab] = useState('stays');
  
  // Local state for routes fetched from Supabase
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingStay, setIsAddingStay] = useState(false);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Delete States
  const [deleteId, setDeleteId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState('');

  // Fetch routes when activeTab is 'routes'
  useEffect(() => {
    if (activeTab === 'routes') {
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
      setRouteError("Failed to load routes from database.");
    } finally {
      setLoadingRoutes(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const handleAdd = () => {
    if (activeTab === 'stays') {
        setEditingItem(null);
        setIsAddingStay(true);
    } else if (activeTab === 'routes') {
        setEditingItem(null);
        setIsAddingRoute(true);
    } else {
        setEditingItem(null);
        setIsModalOpen(true);
    }
  };

  const handleEdit = (item) => {
    // Process tags array to string for editing if needed
    const processedItem = { ...item };
    if (Array.isArray(item.tags)) {
        processedItem.tags = item.tags.join(', ');
    }
    setEditingItem(processedItem);
    
    if (activeTab === 'stays') {
        setIsAddingStay(true);
    } else if (activeTab === 'routes') {
        setIsAddingRoute(true);
    } else {
        setIsModalOpen(true);
    }
  };

  const handleDeleteClick = (id) => {
    // Determine the item source based on active tab
    const list = activeTab === 'routes' ? routes : data[activeTab];
    const item = list.find(i => i.id === id);
    
    if (item) {
        setDeleteItemName(item.title || item.origin + ' to ' + item.destination);
        setDeleteId(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
        if (activeTab === 'routes') {
            try {
                const { error } = await routeService.deleteRoute(deleteId);
                if (error) throw error;
                // Refresh routes locally
                setRoutes(prev => prev.filter(r => r.id !== deleteId));
            } catch (err) {
                console.error("Failed to delete route:", err);
                alert("Failed to delete route. Please try again.");
            }
        } else {
            deleteItem(activeTab, deleteId);
        }
        setDeleteId(null);
    }
  };

  const handleFormSubmit = (formData) => {
    // Process tags string back to array
    const processedData = { ...formData };
    if (typeof processedData.tags === 'string') {
        processedData.tags = processedData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (editingItem) {
        updateItem(activeTab, editingItem.id, processedData);
    } else {
        addItem(activeTab, processedData);
    }
    setIsModalOpen(false);
  };

  const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon || LayoutDashboard;

  // Determine data source for current tab
  const currentData = activeTab === 'routes' ? routes : data[activeTab];

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

        {isAddingStay ? (
          <AddStayForm 
            initialData={editingItem}
            onComplete={() => {
              setIsAddingStay(false);
              setEditingItem(null);
              refreshData();
            }}
            onCancel={() => {
                setIsAddingStay(false);
                setEditingItem(null);
            }}
          />
        ) : isAddingRoute ? (
          <AddRouteForm 
            initialData={editingItem}
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
        ) : (
          <>
            {activeTab === 'routes' && routeError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {routeError}
                </div>
            )}
            
            {activeTab === 'routes' && loadingRoutes ? (
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

            <ServiceModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleFormSubmit}
              initialData={editingItem}
              title={TABS.find(t => t.id === activeTab)?.label.slice(0, -1)} // Singularize roughly
              fields={FIELD_CONFIG[activeTab]}
            />

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
