/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { routeService } from './routeService';
import { mockDb } from './mockDb';

// Mocking localStorage for mockDb
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('routeService (Local DB)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Reset mockDb internal state if needed, but it reads from localStorage every time
  });

  it('should create a route successfully', async () => {
    const routeData = {
      origin: 'Darjeeling',
      destination: 'Kalimpong',
      basePrice: 2500,
      capacity: '4 seater',
      coverImage: 'http://example.com/image.jpg'
    };

    const { data, error } = await routeService.createRoute(routeData);

    expect(error).toBeNull();
    expect(data).toHaveProperty('id');
    expect(data.origin).toBe('Darjeeling');
    expect(data.createdAt).toBeDefined();
  });

  it('should add a stop to a route', async () => {
    // 1. Create Route
    const routeRes = await routeService.createRoute({
      origin: 'A',
      destination: 'B',
      basePrice: 100,
      capacity: '4 seater',
      coverImage: 'img'
    });
    const routeId = routeRes.data.id;

    // 2. Add Stop
    const stopData = {
      routeId,
      name: 'Viewpoint',
      detourPrice: 500,
      description: 'Nice view'
    };

    const { data: stop, error } = await routeService.addStop(stopData);

    expect(error).toBeNull();
    expect(stop.routeId).toBe(routeId);
    expect(stop.name).toBe('Viewpoint');
  });

  it('should retrieve stops for a route', async () => {
    // 1. Create Route
    const routeRes = await routeService.createRoute({
        origin: 'X',
        destination: 'Y',
        basePrice: 100,
        capacity: '4 seater',
        coverImage: 'img'
      });
    const routeId = routeRes.data.id;

    // 2. Add Stops
    await routeService.addStop({ routeId, name: 'Stop 1', detourPrice: 0 });
    await routeService.addStop({ routeId, name: 'Stop 2', detourPrice: 0 });

    // 3. Get Stops
    const { data: stops, error } = await routeService.getStopsByRouteId(routeId);

    expect(error).toBeNull();
    expect(stops).toHaveLength(2);
  });
});
