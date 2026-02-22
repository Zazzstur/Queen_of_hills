import { mockDb } from './mockDb';
import { supabase } from '../lib/supabase';

// Toggle this to switch between Local and Supabase
// Default to true if not specified in env
const USE_LOCAL_DB = import.meta.env.VITE_USE_LOCAL_DB !== 'false';

export const routeService = {
  // Route Actions
  async createRoute(routeData) {
    if (USE_LOCAL_DB) {
      return mockDb.createRoute(routeData);
    }
    return supabase.from('routes').insert([routeData]).select().single();
  },

  async getRoutes() {
    if (USE_LOCAL_DB) {
      return mockDb.getRoutes();
    }
    return supabase.from('routes').select('*').order('created_at', { ascending: false });
  },

  async updateRoute(id, updates) {
    if (USE_LOCAL_DB) {
      return mockDb.updateRoute(id, updates);
    }
    return supabase.from('routes').update(updates).eq('id', id).select().single();
  },

  async deleteRoute(id) {
    if (USE_LOCAL_DB) {
      return mockDb.deleteRoute(id);
    }
    return supabase.from('routes').delete().eq('id', id);
  },

  // Stop Actions
  async addStop(stopData) {
    if (!stopData.routeId) {
        return { data: null, error: new Error("routeId is required to create a stop") };
    }
    
    // Normalize routeId to string
    const sanitizedData = { ...stopData, routeId: String(stopData.routeId) };

    if (USE_LOCAL_DB) {
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
    
    return supabase.from('stops').insert([dbData]).select().single();
  },

  async getStopsByRouteId(routeId) {
    if (USE_LOCAL_DB) {
      return mockDb.getStopsByRouteId(routeId);
    }
    return supabase.from('stops').select('*').eq('route_id', routeId);
  },

  async deleteStop(id) {
    if (USE_LOCAL_DB) {
      return mockDb.deleteStop(id);
    }
    return supabase.from('stops').delete().eq('id', id);
  },

  // Image Actions
  async uploadImage(file, path) {
    // Reusing the same logic as stayService
    if (USE_LOCAL_DB) {
      const { data } = await mockDb.uploadImage(file, path);
      return data.publicUrl;
    }
    
    const { data, error } = await supabase.storage.from('routes').upload(path, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('routes').getPublicUrl(data.path);
    return publicUrl;
  },

  async addStopImages(imagesDataArray) {
    // imagesDataArray is array of { stopId, url }
    if (USE_LOCAL_DB) {
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
    return supabase.from('stop_images').insert(dbImages).select();
  },

  async getStopImages(stopId) {
    if (USE_LOCAL_DB) {
      return mockDb.getStopImages(stopId);
    }
    return supabase.from('stop_images').select('*').eq('stop_id', stopId);
  }
};
