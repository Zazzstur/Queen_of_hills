import { getConvex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export const bookingService = {
  async createBooking(payload) {
    try {
      const data = await getConvex().mutation(api.bookings.createBooking, payload);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async listBookings() {
    try {
      const data = await getConvex().query(api.bookings.listBookings, {});
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateBookingStatus(id, status) {
    try {
      const data = await getConvex().mutation(api.bookings.updateBookingStatus, {
        id,
        status,
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteBooking(id) {
    try {
      const data = await getConvex().mutation(api.bookings.deleteBooking, { id });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

