import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { contactService } from '../../services/contactService';

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

const ContactMessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await contactService.listContactMessages();
      if (err) throw err;
      setMessages(data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const { data, error: err } = await contactService.updateContactMessageStatus(
        id,
        status
      );
      if (err) throw err;
      setMessages((prev) => prev.map((m) => (m.id === id ? data : m)));
    } catch (e) {
      alert(e?.message || 'Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const { error: err } = await contactService.deleteContactMessage(id);
      if (err) throw err;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e?.message || 'Failed to delete message');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Contact Messages</h3>
        <button
          onClick={fetchMessages}
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
        <div className="p-8 text-center text-gray-500">Loading messages...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDateTime(m.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{m.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{m.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{m.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="whitespace-pre-wrap break-words max-w-[520px]">
                        {m.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <select
                        value={m.status}
                        onChange={(e) => handleStatusChange(m.id, e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1 bg-white"
                      >
                        <option value="new">New</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
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

export default ContactMessagesManagement;
