import { mockDb } from './mockDb';
import { supabase } from '../lib/supabase';

// Toggle this to switch between Local and Supabase
// Default to true if not specified in env
const USE_LOCAL_DB = import.meta.env.VITE_USE_LOCAL_DB !== 'false';

// If running in production (Cloudflare Pages), assume Supabase unless explicitly overridden
const isProduction = import.meta.env.PROD; 
// If it's production and VITE_USE_LOCAL_DB is NOT explicitly set to 'true', force Supabase
const effectiveUseLocalDb = isProduction ? (import.meta.env.VITE_USE_LOCAL_DB === 'true') : USE_LOCAL_DB;


export const stayService = {
  async createStay(stayData) {
    if (effectiveUseLocalDb) {
      return mockDb.createStay(stayData);
    }
    return supabase.from('stays').insert([stayData]).select().single();
  },

  async getStays() {
    if (effectiveUseLocalDb) {
      return mockDb.getStays();
    }
    return supabase.from('stays').select('*');
  },

  async updateStay(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateStay(id, updates);
    }
    return supabase.from('stays').update(updates).eq('id', id).select().single();
  },

  async createRoom(roomData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoom(roomData);
    }
    return supabase.from('rooms').insert([roomData]).select().single();
  },

  async updateRoom(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateRoom(id, updates);
    }
    return supabase.from('rooms').update(updates).eq('id', id).select().single();
  },

  async deleteRoom(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoom(id);
    }
    return supabase.from('rooms').delete().eq('id', id);
  },

  async getRoomsByStayId(stayId) {
    if (effectiveUseLocalDb) {
      return mockDb.getRoomsByStayId(stayId);
    }
    return supabase.from('rooms').select('*').eq('stay_id', stayId);
  },

  async uploadImage(file, path) {
    if (effectiveUseLocalDb) {
      const { data } = await mockDb.uploadImage(file, path);
      return data.publicUrl;
    }
    
    const { data, error } = await supabase.storage.from('stays').upload(path, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('stays').getPublicUrl(data.path);
    return publicUrl;
  },

  async createRoomImage(imageData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoomImage(imageData);
    }
    return supabase.from('room_images').insert([imageData]);
  },

  async getRoomImages(roomId) {
    if (effectiveUseLocalDb) {
      return mockDb.getRoomImages(roomId);
    }
    return supabase.from('room_images').select('*').eq('room_id', roomId);
  },

  async deleteRoomImage(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoomImage(id);
    }
    return supabase.from('room_images').delete().eq('id', id);
  }
};
