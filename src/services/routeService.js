import { mockDb } from './mockDb';
import { supabase } from '../lib/supabase';
import { executeWithRetry } from '../lib/dbHelper';

// Toggle this to switch between Local and Supabase
// Default to true if not specified in env
const USE_LOCAL_DB = import.meta.env.VITE_USE_LOCAL_DB !== 'false';

// If running in production (Cloudflare Pages), assume Supabase unless explicitly overridden
const isProduction = import.meta.env.PROD; 
// If it's production and VITE_USE_LOCAL_DB is NOT explicitly set to 'true', force Supabase
const effectiveUseLocalDb = isProduction ? (import.meta.env.VITE_USE_LOCAL_DB === 'true') : USE_LOCAL_DB;

export const routeService = {
  // Route Actions
  async createRoute(routeData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoute(routeData);
    }
    return executeWithRetry(
      () => supabase.from('routes').insert([routeData]).select().single(),
      'Create Route'
    );
  },

  async getRoutes() {
    if (effectiveUseLocalDb) {
      return mockDb.getRoutes();
    }
    return executeWithRetry(
      () => supabase.from('routes').select('*').order('created_at', { ascending: false }),
      'Get Routes'
    );
  },

  async updateRoute(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateRoute(id, updates);
    }
    return executeWithRetry(
      () => supabase.from('routes').update(updates).eq('id', id).select().single(),
      `Update Route ${id}`
    );
  },

  async deleteRoute(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoute(id);
    }
    return executeWithRetry(
      () => supabase.from('routes').delete().eq('id', id),
      `Delete Route ${id}`
    );
  },

  // Stop Actions
  async addStop(stopData) {
    if (!stopData.routeId) {
        return { data: null, error: new Error("routeId is required to create a stop") };
    }
    
    // Normalize routeId to string
    const sanitizedData = { ...stopData, routeId: String(stopData.routeId) };

    if (effectiveUseLocalDb) {
      return mockDb.createStop(sanitizedData);
    }
    // Map camelCase to snake_case for DB if needed, but assuming DB uses camelCase or we map it.
    // Let's stick to camelCase for now as we haven't defined the schema strictly to snake_case in JS yet, 
    // BUT typically Supabase/Postgres uses snake_case.
    // Let's assume we will use snake_case in DB: route_id.
    // However, the rest of the app uses camelCase.
    // For now, let's keep the JS property names matching DB column names for simplicity.
    // If DB has route_id, we should send route_id.
    // The current mockDb uses routeId.
    // To be safe and consistent with the existing code style, I will keep using the properties as they are,
    // assuming the Supabase table will use quotes or match.
    // WAIT: stayService uses snake_case in JS (stay_id) for rooms.
    // routeService uses camelCase (routeId).
    // I should probably map it.
    // sanitizedData has routeId.
    const dbData = { ...sanitizedData, route_id: sanitizedData.routeId };
    delete dbData.routeId;
    
    return executeWithRetry(
      () => supabase.from('stops').insert([dbData]).select().single(),
      'Add Stop'
    );
  },

  async getStopsByRouteId(routeId) {
    if (effectiveUseLocalDb) {
      return mockDb.getStopsByRouteId(routeId);
    }
    return executeWithRetry(
      () => supabase.from('stops').select('*').eq('route_id', routeId),
      `Get Stops for Route ${routeId}`
    );
  },

  async updateStop(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateStop(id, updates);
    }
    
    const dbUpdates = { ...updates };
    if (dbUpdates.routeId) {
        dbUpdates.route_id = dbUpdates.routeId;
        delete dbUpdates.routeId;
    }

    return executeWithRetry(
      () => supabase.from('stops').update(dbUpdates).eq('id', id).select().single(),
      `Update Stop ${id}`
    );
  },

  async deleteStop(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteStop(id);
    }
    return executeWithRetry(
      () => supabase.from('stops').delete().eq('id', id),
      `Delete Stop ${id}`
    );
  },

  // Image Actions
  async uploadImage(file, path) {
    // Reusing the same logic as stayService
    if (effectiveUseLocalDb) {
      const { data } = await mockDb.uploadImage(file, path);
      return data.publicUrl;
    }
    
    const { data, error } = await executeWithRetry(
      () => supabase.storage.from('routes').upload(path, file),
      'Upload Image'
    );
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('routes').getPublicUrl(data.path);
    return publicUrl;
  },

  async addStopImages(imagesDataArray) {
    // imagesDataArray is array of { stopId, url }
    if (effectiveUseLocalDb) {
        const results = [];
        for (const img of imagesDataArray) {
            const res = await mockDb.createStopImage(img);
            results.push(res.data);
        }
        return { data: results, error: null };
    }
    // Map stopId to stop_id
    const dbImages = imagesDataArray.map(img => ({
        stop_id: img.stopId,
        url: img.url
    }));
    return executeWithRetry(
      () => supabase.from('stop_images').insert(dbImages).select(),
      'Add Stop Images'
    );
  },

  async getStopImages(stopId) {
    if (effectiveUseLocalDb) {
      return mockDb.getStopImages(stopId);
    }
    return executeWithRetry(
      () => supabase.from('stop_images').select('*').eq('stop_id', stopId),
      `Get Images for Stop ${stopId}`
    );
  }
};
