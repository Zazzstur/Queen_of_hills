import { mockDb } from './mockDb';
import { executeWithRetry } from '../lib/dbHelper';
import { getConvex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

// Toggle this to switch between Local and Supabase
// Default to true if not specified in env
const USE_LOCAL_DB = import.meta.env.VITE_USE_LOCAL_DB !== 'false';

// If running in production (Cloudflare Pages), assume Supabase unless explicitly overridden
const isProduction = import.meta.env.PROD; 
const isTest = import.meta.env.MODE === 'test' || import.meta.env.VITEST;
// If it's production and VITE_USE_LOCAL_DB is NOT explicitly set to 'true', force Supabase
const effectiveUseLocalDb = isTest ? true : (isProduction ? (import.meta.env.VITE_USE_LOCAL_DB === 'true') : USE_LOCAL_DB);


export const stayService = {
  async createStay(stayData) {
    if (effectiveUseLocalDb) {
      return mockDb.createStay(stayData);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.createStay, stayData),
        error: null,
      }),
      'Create Stay'
    );
  },

  async getStays() {
    if (effectiveUseLocalDb) {
      return mockDb.getStays();
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().query(api.stays.getStays, {}),
        error: null,
      }),
      'Get Stays'
    );
  },

  async updateStay(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateStay(id, updates);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.updateStay, {
          id,
          name: updates.name,
          description: updates.description,
          type: updates.type,
          location: updates.location,
          amenities: updates.amenities,
          thumbnail_url: updates.thumbnail_url,
        }),
        error: null,
      }),
      `Update Stay ${id}`
    );
  },

  async createRoom(roomData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoom(roomData);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.createRoom, {
          stayId: roomData.stay_id,
          name: roomData.name,
          price: roomData.price,
          capacity: roomData.capacity,
          description: roomData.description,
        }),
        error: null,
      }),
      'Create Room'
    );
  },

  async updateRoom(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateRoom(id, updates);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.updateRoom, {
          id,
          name: updates.name,
          price: updates.price,
          capacity: updates.capacity,
          description: updates.description,
        }),
        error: null,
      }),
      `Update Room ${id}`
    );
  },

  async deleteRoom(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoom(id);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.deleteRoom, { id }),
        error: null,
      }),
      `Delete Room ${id}`
    );
  },

  async getRoomsByStayId(stayId) {
    if (effectiveUseLocalDb) {
      return mockDb.getRoomsByStayId(stayId);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().query(api.stays.getRoomsByStayId, { stayId }),
        error: null,
      }),
      `Get Rooms for Stay ${stayId}`
    );
  },

  async uploadImage(file, path) {
    if (effectiveUseLocalDb) {
      const { data } = await mockDb.uploadImage(file, path);
      return data.publicUrl;
    }

    const uploadUrl = await getConvex().mutation(api.files.generateUploadUrl, {});
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!result.ok) throw new Error('Failed to upload image');
    const { storageId } = await result.json();
    const url = await getConvex().query(api.files.getFileUrl, { storageId });
    if (!url) throw new Error('Failed to get uploaded image url');
    return url;
  },

  async createRoomImage(imageData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoomImage(imageData);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.createRoomImage, {
          roomId: imageData.room_id,
          url: imageData.url,
        }),
        error: null,
      }),
      'Create Room Image'
    );
  },

  async getRoomImages(roomId) {
    if (effectiveUseLocalDb) {
      return mockDb.getRoomImages(roomId);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().query(api.stays.getRoomImages, { roomId }),
        error: null,
      }),
      `Get Images for Room ${roomId}`
    );
  },

  async deleteRoomImage(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoomImage(id);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.stays.deleteRoomImage, { id }),
        error: null,
      }),
      `Delete Room Image ${id}`
    );
  }
};
