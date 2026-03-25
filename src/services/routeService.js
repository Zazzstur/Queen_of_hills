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

export const routeService = {
  // Route Actions
  async createRoute(routeData) {
    if (effectiveUseLocalDb) {
      return mockDb.createRoute(routeData);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.routes.createRoute, {
          name: routeData.name,
          type: routeData.type,
          origin: routeData.origin,
          destination: routeData.destination,
          price4Seater: routeData.price4Seater,
          price6SeaterLuxurySuv: routeData.price6SeaterLuxurySuv,
          price6to10SeaterSuv: routeData.price6to10SeaterSuv,
          capacity: routeData.capacity,
          description: routeData.description,
          coverImage: routeData.coverImage,
        }),
        error: null,
      }),
      'Create Route'
    );
  },

  async getRoutes() {
    if (effectiveUseLocalDb) {
      return mockDb.getRoutes();
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().query(api.routes.getRoutes, {}),
        error: null,
      }),
      'Get Routes'
    );
  },

  async updateRoute(id, updates) {
    if (effectiveUseLocalDb) {
      return mockDb.updateRoute(id, updates);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.routes.updateRoute, {
          id,
          name: updates.name,
          type: updates.type,
          origin: updates.origin,
          destination: updates.destination,
          price4Seater: updates.price4Seater,
          price6SeaterLuxurySuv: updates.price6SeaterLuxurySuv,
          price6to10SeaterSuv: updates.price6to10SeaterSuv,
          capacity: updates.capacity,
          description: updates.description,
          coverImage: updates.coverImage,
        }),
        error: null,
      }),
      `Update Route ${id}`
    );
  },

  async deleteRoute(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteRoute(id);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.routes.deleteRoute, { id }),
        error: null,
      }),
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
      async () => ({
        data: await getConvex().mutation(api.routes.addStop, {
          routeId: sanitizedData.routeId,
          name: sanitizedData.name,
          price4Seater: sanitizedData.price4Seater,
          price6SeaterLuxurySuv: sanitizedData.price6SeaterLuxurySuv,
          price6to10SeaterSuv: sanitizedData.price6to10SeaterSuv,
          description: sanitizedData.description,
        }),
        error: null,
      }),
      'Add Stop'
    );
  },

  async getStopsByRouteId(routeId) {
    if (effectiveUseLocalDb) {
      return mockDb.getStopsByRouteId(routeId);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().query(api.routes.getStopsByRouteId, { routeId }),
        error: null,
      }),
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
      async () => ({
        data: await getConvex().mutation(api.routes.updateStop, {
          id,
          name: dbUpdates.name,
          price4Seater: dbUpdates.price4Seater,
          price6SeaterLuxurySuv: dbUpdates.price6SeaterLuxurySuv,
          price6to10SeaterSuv: dbUpdates.price6to10SeaterSuv,
          description: dbUpdates.description,
        }),
        error: null,
      }),
      `Update Stop ${id}`
    );
  },

  async deleteStop(id) {
    if (effectiveUseLocalDb) {
      return mockDb.deleteStop(id);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.routes.deleteStop, { id }),
        error: null,
      }),
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
    return executeWithRetry(
      async () => ({
        data: await getConvex().mutation(api.routes.addStopImages, {
          images: imagesDataArray,
        }),
        error: null,
      }),
      'Add Stop Images'
    );
  },

  async getStopImages(stopId) {
    if (effectiveUseLocalDb) {
      return mockDb.getStopImages(stopId);
    }
    return executeWithRetry(
      async () => ({
        data: await getConvex().query(api.routes.getStopImages, { stopId }),
        error: null,
      }),
      `Get Images for Stop ${stopId}`
    );
  }
};
