/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { routeService } from './routeService';
import { stayService } from './stayService';

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

// Mock crypto.randomUUID
if (!global.crypto) {
    global.crypto = {
        randomUUID: () => 'uuid-' + Math.random().toString(36).substr(2, 9)
    };
}

describe('Persistence Tests (Local DB)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Stay Service', () => {
    it('should create and update a stay', async () => {
        const stayData = {
            name: 'Test Stay',
            type: 'Homestay',
            location: 'Loc',
            description: 'Desc',
            amenities: ['Wifi'],
            thumbnail_url: 'url'
        };

        // Create
        const { data: stay, error: createError } = await stayService.createStay(stayData);
        expect(createError).toBeNull();
        expect(stay.id).toBeDefined();
        expect(stay.name).toBe('Test Stay');

        // Update
        const { data: updated, error: updateError } = await stayService.updateStay(stay.id, { name: 'Updated Stay' });
        expect(updateError).toBeNull();
        expect(updated.name).toBe('Updated Stay');
    });

    it('should create and update a room', async () => {
        // Setup Stay
        const { data: stay } = await stayService.createStay({ name: 'S', type: 'H', location: 'L' });
        
        // Create Room
        const roomData = {
            stay_id: stay.id,
            name: 'Room 1',
            price: 100,
            capacity: 2
        };
        const { data: room, error: roomError } = await stayService.createRoom(roomData);
        expect(roomError).toBeNull();
        expect(room.stay_id).toBe(stay.id);

        // Update Room
        const { data: updated, error: updateError } = await stayService.updateRoom(room.id, { price: 200 });
        expect(updateError).toBeNull();
        expect(updated.price).toBe(200);
    });
  });

  describe('Route Service', () => {
    it('should create and update a route', async () => {
        const routeData = {
            name: 'Route 1',
            origin: 'A',
            destination: 'B',
            basePrice: 500,
            capacity: '4 seater',
            type: 'sightseeing',
            coverImage: 'img'
        };

        // Create
        const { data: route, error: createError } = await routeService.createRoute(routeData);
        expect(createError).toBeNull();
        expect(route.name).toBe('Route 1');
        expect(route.type).toBe('sightseeing');

        // Update
        const { data: updated, error: updateError } = await routeService.updateRoute(route.id, { name: 'Updated Route' });
        expect(updateError).toBeNull();
        expect(updated.name).toBe('Updated Route');
    });

    it('should create and update a stop', async () => {
        // Setup Route
        const { data: route } = await routeService.createRoute({ name: 'R', origin: 'O', destination: 'D', basePrice: 10, capacity: '4', type: 'sightseeing', coverImage: 'i' });
        
        // Create Stop
        const stopData = {
            routeId: route.id,
            name: 'Stop 1',
            detourPrice: 50,
            description: 'Desc'
        };
        const { data: stop, error: stopError } = await routeService.addStop(stopData);
        expect(stopError).toBeNull();
        expect(stop.name).toBe('Stop 1');

        // Update Stop
        const { data: updated, error: updateError } = await routeService.updateStop(stop.id, { name: 'Updated Stop' });
        expect(updateError).toBeNull();
        expect(updated.name).toBe('Updated Stop');

        // Verify Update Persistence
        const { data: stops } = await routeService.getStopsByRouteId(route.id);
        const fetchedStop = stops.find(s => s.id === stop.id);
        expect(fetchedStop.name).toBe('Updated Stop');
    });
  });
});
