import React, { createContext, useContext, useState, useEffect } from 'react';
import { experiencesData } from '../data/experiences';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Track if initial load is done
  const [data, setData] = useState({
    stays: [],
    cabs: [],
    tours: [],
    packages: [],
    routes: [], // Added for routes management
    rooms: [], // Added for relational integrity
    room_images: [] // Added for relational integrity
  });

  const refreshData = () => {
    const storedData = localStorage.getItem('adminData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Ensure all keys exist even if loading from old data
      setData({
        stays: parsedData.stays || [],
        cabs: parsedData.cabs || [],
        tours: parsedData.tours || [],
        packages: parsedData.packages || [],
        routes: parsedData.routes || [],
        rooms: parsedData.rooms || [],
        room_images: parsedData.room_images || []
      });
    }
  };

  // Initialize data from localStorage or fallback to experiencesData
  useEffect(() => {
    refreshData();
    if (!localStorage.getItem('adminData')) {
        setData(experiencesData);
    }
    setIsLoaded(true);
    
    const authStatus = localStorage.getItem('isAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Listen for external DB changes
    const handleDbChange = () => refreshData();
    window.addEventListener('db-change', handleDbChange);
    return () => window.removeEventListener('db-change', handleDbChange);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem('adminData', JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const login = (password) => {
    if (password === 'admin123') { // Mock password
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuth');
  };

  const logAction = (action, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        details
    };
    console.log('[Admin Audit Log]', logEntry);
    // In a real app, this would send to a backend endpoint
  };

  // Generic CRUD Operations
  const addItem = (category, item) => {
    const newItem = { ...item, id: Date.now().toString() };
    setData(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
    logAction('CREATE', { category, item: newItem });
  };

  const updateItem = (category, id, updatedItem) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, ...updatedItem } : item)
    }));
    logAction('UPDATE', { category, id, changes: updatedItem });
  };

  const deleteItem = (category, id) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
    logAction('DELETE', { category, id });
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      data,
      refreshData,
      addItem,
      updateItem,
      deleteItem
    }}>
      {children}
    </AdminContext.Provider>
  );
};
