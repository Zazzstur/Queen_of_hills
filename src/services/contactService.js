import { getConvex } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export const contactService = {
  async createContactMessage(payload) {
    try {
      const data = await getConvex().mutation(
        api.contactMessages.createContactMessage,
        payload
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async listContactMessages() {
    try {
      const data = await getConvex().query(
        api.contactMessages.listContactMessages,
        {}
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateContactMessageStatus(id, status) {
    try {
      const data = await getConvex().mutation(
        api.contactMessages.updateContactMessageStatus,
        { id, status }
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deleteContactMessage(id) {
    try {
      const data = await getConvex().mutation(
        api.contactMessages.deleteContactMessage,
        { id }
      );
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
