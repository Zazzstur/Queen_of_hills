import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import { Trash2 } from 'lucide-react';

const formatDateTime = (iso) => {
  try {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}/${month}/${year}, ${time}`;
  } catch {
    return iso;
  }
};

const formatDateOnly = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await bookingService.listBookings();
      if (err) throw err;
      setBookings(data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const { data, error: err } = await bookingService.updateBookingStatus(id, status);
      if (err) throw err;
      setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
    } catch (e) {
      alert(e?.message || 'Failed to update booking');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      const { error: err } = await bookingService.deleteBooking(id);
      if (err) throw err;
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      alert(e?.message || 'Failed to delete booking');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Bookings Management</h3>
        <button
          onClick={fetchBookings}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-b border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading bookings...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Pickup</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDateTime(b.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.contact?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.contact?.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.contact?.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{b.contact?.pickupLocation}</div>
                      {(b.booking?.startDate || b.booking?.timeSlot) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDateOnly(b.booking?.startDate)} {b.booking?.timeSlot}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>
                        {b.service?.title ||
                          (b.service?.origin && b.service?.destination
                            ? `${b.service.origin} to ${b.service.destination}`
                            : b.service?.type)}
                      </div>
                      {Array.isArray(b.booking?.stopNames) && b.booking.stopNames.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {b.booking.stopNames.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₹{Number(b.pricing?.total || 0).toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1 bg-white"
                      >
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
