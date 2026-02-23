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


export const stayService = {
  async createStay(stayData) {
    if (effectiveUseLocalDb) {
      return mockDb.createStay(stayData);
    }
    return executeWithRetry(
      () => supabase.from('stays').insert([stayData]).select().single(),
      'Create Stay'
    );
  },

  async getStays() {
    if (effectiveUseLocalDb) {
      return mockDb.getStays();
    }
    return executeWithRetry(
      () => supabase.from('stays').select('*'),
      'Get Stays'
    );
  },

  async updateStay(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateStay(id, updates);
    }
    return executeWithRetry(
      () => supabase.from('stays').update(updates).eq('id', id).select().single(),
      `Update Stay ${id}`
    );
  },

  async createRoom(roomData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoom(roomData);
    }
    return executeWithRetry(
      () => supabase.from('rooms').insert([roomData]).select().single(),
      'Create Room'
    );
  },

  async updateRoom(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateRoom(id, updates);
    }
    return executeWithRetry(
      () => supabase.from('rooms').update(updates).eq('id', id).select().single(),
      `Update Room ${id}`
    );
  },

  async deleteRoom(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoom(id);
    }
    return executeWithRetry(
      () => supabase.from('rooms').delete().eq('id', id),
      `Delete Room ${id}`
    );
  },

  async getRoomsByStayId(stayId) {
    if (effectiveUseLocalDb) {
      return mockDb.getRoomsByStayId(stayId);
    }
    return executeWithRetry(
      () => supabase.from('rooms').select('*').eq('stay_id', stayId),
      `Get Rooms for Stay ${stayId}`
    );
  },

  async uploadImage(file, path) {
    if (effectiveUseLocalDb) {
      const { data } = await mockDb.uploadImage(file, path);
      return data.publicUrl;
    }
    
    const { data, error } = await executeWithRetry(
      () => supabase.storage.from('stays').upload(path, file),
      'Upload Image'
    );
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('stays').getPublicUrl(data.path);
    return publicUrl;
  },

  async createRoomImage(imageData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoomImage(imageData);
    }
    return executeWithRetry(
      () => supabase.from('room_images').insert([imageData]),
      'Create Room Image'
    );
  },

  async getRoomImages(roomId) {
    if (effectiveUseLocalDb) {
      return mockDb.getRoomImages(roomId);
    }
    return executeWithRetry(
      () => supabase.from('room_images').select('*').eq('room_id', roomId),
      `Get Images for Room ${roomId}`
    );
  },

  async deleteRoomImage(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoomImage(id);
    }
    return executeWithRetry(
      () => supabase.from('room_images').delete().eq('id', id),
      `Delete Room Image ${id}`
    );
  }
};
