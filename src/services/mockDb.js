// Simulates a database using localStorage for metadata and IndexedDB for images
const getStorageKey = () => {
    const key = window.MOCK_DB_KEY || 'adminData';
    // console.log(`MockDB: Using key '${key}'`); // Verbose but useful
    return key;
};
// DEBUG: Hardcoded key to rule out environment issues
// const getStorageKey = () => 'adminData_DEBUG_FIXED';

const DB_NAME = 'DarjeelingMediaDB';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';

// --- IndexedDB Adapter ---
const initImageDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE);
      }
    };
  });
};

const saveImageToDB = async (blob) => {
  const db = await initImageDB();
  return new Promise((resolve, reject) => {
    const id = `img_${crypto.randomUUID()}`;
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    
    // Store with metadata if needed, but simple blob is fine for now
    const request = store.put(blob, id);
    
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
};

const getImageFromDB = async (id) => {
  const db = await initImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Helper to Rehydrate Data ---
// Recursively scans object and replaces "idb:img_..." with Blob URLs
const rehydrateImages = async (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return Promise.all(data.map(item => rehydrateImages(item)));
  }
  
  if (typeof data === 'object') {
    const newData = { ...data };
    for (const key in newData) {
        const value = newData[key];
        if (typeof value === 'string' && value.startsWith('idb:img_')) {
            try {
                const id = value.replace('idb:', '');
                const blob = await getImageFromDB(id);
                if (blob) {
                    newData[key] = URL.createObjectURL(blob);
                } else {
                    console.warn(`Image ${id} not found in DB`);
                    // Prevent returning raw idb: string which causes network errors
                    newData[key] = null;
                }
            } catch (e) {
                console.error("Failed to rehydrate image", e);
                newData[key] = null;
            }
        } else if (typeof value === 'object') {
            newData[key] = await rehydrateImages(value);
        }
    }
    return newData;
  }
  
  return data;
};

// --- LocalStorage Logic ---

const getDb = () => {
  const key = getStorageKey();
  const data = localStorage.getItem(key);
  if (!data) {
      console.warn(`MockDB: localStorage key '${key}' is empty. Initializing new DB.`);
  } else {
      console.log(`MockDB: Read ${data.length} chars from '${key}'.`);
  }
  try {
      return data ? JSON.parse(data) : { stays: [], rooms: [], room_images: [], routes: [], stops: [], stop_images: [] };
  } catch (e) {
      console.error("Data corruption detected. Resetting DB.", e);
      localStorage.setItem(key + '_corrupted', data);
      return { stays: [], rooms: [], room_images: [], routes: [], stops: [], stop_images: [] };
  }
};

const saveDb = (data) => {
  try {
    const key = getStorageKey();
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    console.log(`MockDB: Saved ${serialized.length} chars to '${key}'.`);
    
    // --- Verify After Write ---
    const verified = localStorage.getItem(key);
    if (!verified || verified !== serialized) {
        console.error(`MockDB: CRITICAL FAILURE. Verification failed for key '${key}'.`);
        console.error(`Expected length: ${serialized.length}, Got: ${verified ? verified.length : 'null'}`);
        throw new Error("Storage Verification Failed: Data was not saved correctly.");
    }
    
    // Only dispatch event if not in test mode
    if (!window.MOCK_DB_KEY) {
        window.dispatchEvent(new Event('db-change'));
    }
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
    // You might want to throw this so the caller knows save failed
    throw new Error("Storage full or unavailable. Data could not be saved.");
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
  // Stays
  async createStay(stayData) {
    await delay(500); 
    const db = getDb();
    
    const newStay = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...stayData
    };

    if (!db.stays) db.stays = [];
    db.stays.push(newStay);
    saveDb(db);

    return { data: newStay, error: null };
  },

  async getStays() {
    await delay(300);
    const db = getDb();
    const hydratedStays = await rehydrateImages(db.stays || []);
    return { data: hydratedStays, error: null };
  },

  async updateStay(id, updates) {
    await delay(500);
    const db = getDb();
    const index = db.stays.findIndex(s => s.id === id);
    
    if (index === -1) return { data: null, error: new Error('Stay not found') };
    
    const updatedStay = { ...db.stays[index], ...updates };
    db.stays[index] = updatedStay;
    saveDb(db);
    
    // Return hydrated data for UI
    const hydrated = await rehydrateImages(updatedStay);
    return { data: hydrated, error: null };
  },

  // Rooms
  async createRoom(roomData) {
    await delay(500);
    const db = getDb();

    const newRoom = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...roomData
    };

    if (!db.rooms) db.rooms = [];
    db.rooms.push(newRoom);
    saveDb(db);

    return { data: newRoom, error: null };
  },

  async getRoomsByStayId(stayId) {
    await delay(300);
    const db = getDb();
    const rooms = (db.rooms || []).filter(r => r.stay_id === stayId);
    const hydrated = await rehydrateImages(rooms);
    return { data: hydrated, error: null };
  },

  async updateRoom(id, updates) {
    await delay(500);
    const db = getDb();
    const index = db.rooms.findIndex(r => r.id === id);
    
    if (index === -1) return { data: null, error: new Error('Room not found') };
    
    const updatedRoom = { ...db.rooms[index], ...updates };
    db.rooms[index] = updatedRoom;
    saveDb(db);
    
    const hydrated = await rehydrateImages(updatedRoom);
    return { data: hydrated, error: null };
  },

  async deleteRoom(id) {
    await delay(300);
    const db = getDb();
    db.rooms = (db.rooms || []).filter(r => r.id !== id);
    // Also delete associated images
    db.room_images = (db.room_images || []).filter(img => img.room_id !== id);
    saveDb(db);
    return { error: null };
  },

  // Images
  async uploadImage(file, path) {
    await delay(500); // Simulate upload
    try {
        const id = await saveImageToDB(file);
        const ref = `idb:${id}`;
        // Return the reference string. 
        // Note: The UI will receive this immediately. 
        // If the UI tries to display it directly as src, it will fail.
        // BUT: StopCard displays the *file preview* (URL.createObjectURL(file)) while editing.
        // It only uses the returned value to save to DB.
        // So this is safe.
        // Wait, RouteDetailsForm displays imagePreview from initialData?.coverImage.
        // If initialData comes from getRoutes(), it will be rehydrated.
        // If it comes from immediate response of createRoute, we need to ensure that is also hydrated.
        
        // Actually, let's return an object that mocks the structure expected?
        // No, the services expect a string URL.
        // We return the reference string. 
        // The calling service (routeService) passes this to createRoute/Stop.
        // createRoute saves it. 
        // Then it returns the saved object.
        // We should ensure createRoute returns a rehydrated object.
        
        return { data: { path, publicUrl: ref }, error: null };
    } catch (e) {
        console.error("Upload failed", e);
        return { data: null, error: e };
    }
  },

  async getRoomImages(roomId) {
    await delay(300);
    const db = getDb();
    const images = (db.room_images || []).filter(img => img.room_id === roomId);
    const hydrated = await rehydrateImages(images);
    return { data: hydrated, error: null };
  },

  async deleteRoomImage(id) {
    await delay(300);
    const db = getDb();
    db.room_images = (db.room_images || []).filter(img => img.id !== id);
    saveDb(db);
    return { error: null };
  },

  async createRoomImage(imageData) {
    await delay(300);
    const db = getDb();

    const newImage = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...imageData
    };

    if (!db.room_images) db.room_images = [];
    db.room_images.push(newImage);
    saveDb(db);

    const hydrated = await rehydrateImages(newImage);
    return { data: hydrated, error: null };
  },

  // Routes
  async createRoute(routeData) {
    await delay(500);
    const db = getDb();
    
    const newRoute = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...routeData
    };

    if (!db.routes) db.routes = [];
    db.routes.push(newRoute);
    saveDb(db);

    const hydrated = await rehydrateImages(newRoute);
    return { data: hydrated, error: null };
  },

  async getRoutes() {
    await delay(300);
    const db = getDb();
    const hydrated = await rehydrateImages(db.routes || []);
    return { data: hydrated, error: null };
  },

  async updateRoute(id, updates) {
    await delay(500);
    const db = getDb();
    const index = (db.routes || []).findIndex(r => r.id === id);
    
    if (index === -1) return { data: null, error: new Error('Route not found') };
    
    const updatedRoute = { 
      ...db.routes[index], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    db.routes[index] = updatedRoute;
    saveDb(db);
    
    const hydrated = await rehydrateImages(updatedRoute);
    return { data: hydrated, error: null };
  },

  async deleteRoute(id) {
    await delay(300);
    const db = getDb();
    db.routes = (db.routes || []).filter(r => r.id !== id);
    // Cascade delete stops
    const stopsToDelete = (db.stops || []).filter(s => s.routeId === id);
    db.stops = (db.stops || []).filter(s => s.routeId !== id);
    
    // Cascade delete stop images
    const stopIds = stopsToDelete.map(s => s.id);
    db.stop_images = (db.stop_images || []).filter(img => !stopIds.includes(img.stopId));
    
    saveDb(db);
    return { error: null };
  },

  // Stops
  async createStop(stopData) {
    await delay(300);
    const db = getDb();
    
    console.log("MockDB: Creating stop with data:", stopData);

    // --- Validation ---
    if (!stopData.routeId) {
        return { data: null, error: new Error("Validation Error: routeId is required") };
    }
    if (!stopData.name || stopData.name.trim() === "") {
        return { data: null, error: new Error("Validation Error: Stop name is required") };
    }
    if (stopData.price4Seater < 0 || stopData.price6SeaterLuxurySuv < 0 || stopData.price6to10SeaterSuv < 0) {
        return { data: null, error: new Error("Validation Error: Price cannot be negative") };
    }

    // Ensure routeId is stored as a string
    const sanitizedData = { 
        ...stopData, 
        routeId: String(stopData.routeId),
        name: stopData.name.trim()
    };

    // --- Duplicate Check ---
    const existingStops = db.stops || [];
    console.log(`MockDB: Checking ${existingStops.length} existing stops for duplicates...`);
    
    // Debug: Dump existing stops names/routeIds for analysis
    // console.table(existingStops.map(s => ({ id: s.id, routeId: s.routeId, name: s.name })));

    const isDuplicate = existingStops.some(s => {
        const routeMatch = String(s.routeId) === sanitizedData.routeId;
        const nameMatch = s.name && s.name.toLowerCase() === sanitizedData.name.toLowerCase();
        
        // Detailed debug for potential matches
        if (routeMatch && nameMatch) {
            console.log(`MockDB: Found duplicate! Stop ID: ${s.id}`);
        }
        
        return routeMatch && nameMatch;
    });

    if (isDuplicate) {
        return { data: null, error: new Error(`Duplicate Error: A stop named "${sanitizedData.name}" already exists for this route.`) };
    }

    const newStop = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...sanitizedData
    };

    if (!db.stops) db.stops = [];
    db.stops.push(newStop);
    try {
        saveDb(db);
        console.log("MockDB: Stop saved. Total stops:", db.stops.length);
        
        // --- Sanity Check: Read back immediately via getDb ---
    const freshDb = getDb();
    const savedStop = (freshDb.stops || []).find(s => s.id === newStop.id);
    
    // DEBUG: Force manual verification
    if (!savedStop) {
        console.error("MockDB: CRITICAL. Stop verified in localStorage but not found via getDb()!");
        console.error("MockDB: getDb returned:", freshDb);
        throw new Error("Persistence Logic Failure: Data saved but cannot be parsed back.");
    }
    
    // DEBUG: Dump the DB stops count to prove it persists
    console.log(`MockDB: Post-save verification successful. DB now has ${freshDb.stops.length} stops.`);

    // Note: rehydrateImages was suspected of async issues.
    // We will still call it but catch errors strictly.
    try {
        const hydrated = await rehydrateImages(newStop);
        return { data: hydrated, error: null };
    } catch (hydrateErr) {
        console.error("Hydration failed, returning raw:", hydrateErr);
        return { data: newStop, error: null };
    }
    } catch (e) {
        console.error("MockDB: Failed to save stop:", e);
        return { data: null, error: e };
    }
  },

  async getStopsByRouteId(routeId) {
    await delay(300);
    const db = getDb();
    // Convert input routeId to string for comparison
    const targetRouteId = String(routeId);
    
    console.log(`MockDB: Fetching stops for routeId: ${targetRouteId}`);
    // console.log("MockDB: All stops:", db.stops); // Uncomment if needed, can be verbose

    const stops = (db.stops || []).filter(s => {
        const match = String(s.routeId) === targetRouteId;
        return match;
    });
    
    console.log(`MockDB: Found ${stops.length} stops for routeId ${targetRouteId}`);
    
    if (stops.length === 0) {
        console.warn("MockDB: No stops match! Dumping all available stops for debugging:");
        console.table((db.stops || []).map(s => ({ 
            id: s.id, 
            routeId: s.routeId, 
            routeIdType: typeof s.routeId,
            target: targetRouteId,
            match: String(s.routeId) === targetRouteId 
        })));
    }
    
    try {
        const hydrated = await rehydrateImages(stops);
        return { data: hydrated, error: null };
    } catch (err) {
        console.error("MockDB: Failed to rehydrate stops:", err);
        // Fallback to raw data if hydration fails
        return { data: stops, error: null };
    }
  },

  async updateStop(id, updates) {
    await delay(300);
    const db = getDb();
    const index = (db.stops || []).findIndex(s => s.id === id);
    
    if (index === -1) return { data: null, error: new Error('Stop not found') };
    
    // Normalize routeId if present
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.routeId) {
        sanitizedUpdates.routeId = String(sanitizedUpdates.routeId);
    }
    
    const updatedStop = { 
      ...db.stops[index], 
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    };
    db.stops[index] = updatedStop;
    saveDb(db);
    
    const hydrated = await rehydrateImages(updatedStop);
    return { data: hydrated, error: null };
  },

  async deleteStop(id) {
    await delay(300);
    const db = getDb();
    db.stops = (db.stops || []).filter(s => s.id !== id);
    // Cascade delete images
    db.stop_images = (db.stop_images || []).filter(img => img.stopId !== id);
    saveDb(db);
    return { error: null };
  },

  // Stop Images
  async createStopImage(imageData) {
    await delay(200);
    const db = getDb();
    
    const newImage = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...imageData
    };

    if (!db.stop_images) db.stop_images = [];
    db.stop_images.push(newImage);
    saveDb(db);

    const hydrated = await rehydrateImages(newImage);
    return { data: hydrated, error: null };
  },

  async getStopImages(stopId) {
    await delay(200);
    const db = getDb();
    const images = (db.stop_images || []).filter(img => img.stopId === stopId);
    
    try {
        const hydrated = await rehydrateImages(images);
        return { data: hydrated, error: null };
    } catch (err) {
        console.error("MockDB: Failed to rehydrate stop images:", err);
        return { data: images, error: null };
    }
  }
};
