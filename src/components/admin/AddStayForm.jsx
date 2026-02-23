import React, { useState, useEffect } from 'react';
import { stayService } from '../../services/stayService';
import { Plus, X, Upload, Image as ImageIcon, Save, Trash2, Check, Pencil, AlertCircle } from 'lucide-react';

const AMENITIES_OPTIONS = [
  'Wifi', 'Parking', 'Restaurant', 'Room Service', 'Pool', 'Spa', 'Gym', 'Air Conditioning', 'Heater', 'View'
];

const AddStayForm = ({ onComplete, onCancel, initialData }) => {
  const [step, setStep] = useState(1); // 1: Stay Details, 2: Rooms
  const [loading, setLoading] = useState(false);
  const [stayId, setStayId] = useState(initialData?.id || null);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  
  // Stay Form State
  const [stayData, setStayData] = useState({
    title: '', // Changed from name to title to match schema
    type: 'Homestay',
    location: '', // Note: 'location' isn't in FIELD_CONFIG or initial data, but we can keep it if needed or map it
    description: '',
    amenities: [],
    thumbnail_url: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Room Form State
  const [rooms, setRooms] = useState([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [currentRoom, setCurrentRoom] = useState({
    name: '',
    price: '',
    capacity: 2,
    description: '',
    images: [] // Array of { file, url, preview, id } (id/url for existing, file/preview for new)
  });

  // Initialize Data
  useEffect(() => {
    if (initialData) {
      setStayData({
        title: initialData.title || '',
        type: initialData.type || 'Homestay',
        location: initialData.location || '',
        description: initialData.description || '',
        amenities: initialData.amenities || [],
        thumbnail_url: initialData.thumbnail_url || initialData.image || '' // Handle image key mismatch too
      });
      fetchRooms(initialData.id);
    }
  }, [initialData]);

  const fetchRooms = async (id) => {
    try {
      const { data, error } = await stayService.getRoomsByStayId(id);
      if (error) throw error;
      
      // Fetch image counts or images for each room to display correctly
      const roomsWithCounts = await Promise.all(data.map(async (room) => {
        const { data: images } = await stayService.getRoomImages(room.id);
        return { ...room, imageCount: images?.length || 0 };
      }));
      
      setRooms(roomsWithCounts);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      showNotification('error', err.message || 'Failed to load rooms');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Stay Handlers ---

  const handleStayChange = (e) => {
    const { name, value } = e.target;
    setStayData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setStayData(prev => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file, path) => {
    return await stayService.uploadImage(file, path);
  };

  const handleSaveStay = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let thumbnailUrl = stayData.thumbnail_url;

      if (thumbnailFile) {
        const fileName = `${Date.now()}-${thumbnailFile.name}`;
        thumbnailUrl = await uploadImage(thumbnailFile, `thumbnails/${fileName}`);
      }

      const payload = { ...stayData, thumbnail_url: thumbnailUrl }; // Removed legacy 'image' property
      let result;

      if (stayId) {
        result = await stayService.updateStay(stayId, payload);
      } else {
        // Ensure price is added if it's required by table but not in this form?
        // FIELD_CONFIG has price required. We should probably add price to this form or mock it.
        // For now, let's just make sure title matches.
        result = await stayService.createStay({
            ...payload
            // price: 'On Request' // Removed: Not in schema
        });
      }

      if (result.error) throw result.error;

      setStayId(result.data.id);
      showNotification('success', `Stay ${stayId ? 'updated' : 'created'} successfully!`);
      
      // Automatically move to next step if creating, stay on same step if editing unless requested
      if (!stayId) setStep(2);
      
    } catch (error) {
      console.error('Error saving stay:', error);
      showNotification('error', 'Failed to save stay: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Room Handlers ---

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setCurrentRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomImagesDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addRoomImages(files);
  };

  const handleRoomImagesSelect = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addRoomImages(files);
    }
  };

  const addRoomImages = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setCurrentRoom(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeRoomImage = async (index) => {
    const imageToRemove = currentRoom.images[index];
    
    // If it's an existing image (has ID), delete from DB
    if (imageToRemove.id) {
        if (!window.confirm('Delete this image permanently?')) return;
        try {
            await stayService.deleteRoomImage(imageToRemove.id);
            showNotification('success', 'Image deleted');
        } catch (error) {
            console.error(error);
            showNotification('error', 'Failed to delete image');
            return;
        }
    }

    setCurrentRoom(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleEditRoom = async (room) => {
    setLoading(true);
    try {
      const { data: images, error } = await stayService.getRoomImages(room.id);
      if (error) throw error;

      setCurrentRoom({
        name: room.name,
        price: room.price,
        capacity: room.capacity,
        description: room.description || '',
        images: images.map(img => ({ url: img.url, preview: img.url, id: img.id }))
      });
      setEditingRoomId(room.id);
      setIsAddingRoom(true);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await stayService.deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      showNotification('success', 'Room deleted');
    } catch (err) {
      showNotification('error', 'Failed to delete room');
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!stayId) return;
    setLoading(true);

    try {
      let roomId = editingRoomId;
      let roomData;

      const payload = {
        stay_id: stayId,
        name: currentRoom.name,
        price: parseFloat(currentRoom.price),
        capacity: parseInt(currentRoom.capacity),
        description: currentRoom.description
      };

      // 1. Save/Update Room Data
      if (editingRoomId) {
        const { data, error } = await stayService.updateRoom(editingRoomId, payload);
        if (error) throw error;
        roomData = data;
      } else {
        const { data, error } = await stayService.createRoom(payload);
        if (error) throw error;
        roomData = data;
        roomId = data.id;
      }

      // 2. Upload NEW Images (ones with 'file' property)
      const newImages = currentRoom.images.filter(img => img.file);
      const imagePromises = newImages.map(async (img) => {
        const fileName = `${stayId}/${roomId}/${Date.now()}-${img.file.name}`;
        const url = await uploadImage(img.file, fileName);
        return stayService.createRoomImage({ room_id: roomId, url });
      });

      await Promise.all(imagePromises);

      // Refresh list
      await fetchRooms(stayId);
      
      // Reset Form
      setIsAddingRoom(false);
      setEditingRoomId(null);
      setCurrentRoom({ name: '', price: '', capacity: 2, description: '', images: [] });
      showNotification('success', `Room ${editingRoomId ? 'updated' : 'added'} successfully`);
    } catch (error) {
      console.error('Error saving room:', error);
      showNotification('error', 'Failed to save room: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRoom = () => {
    setIsAddingRoom(false);
    setEditingRoomId(null);
    setCurrentRoom({ name: '', price: '', capacity: 2, description: '', images: [] });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto my-8 overflow-hidden relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50 text-white ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex gap-4 items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                {initialData ? 'Edit Stay' : 'Add New Stay'}
                </h2>
                <p className="text-sm text-gray-500">
                    {step === 1 ? 'Step 1: Basic Details' : `Step 2: Manage Rooms for "${stayData.title}"`}
                </p>
            </div>
            {/* Step Navigation */}
            {stayId && (
                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button 
                        onClick={() => setStep(1)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${step === 1 ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Details
                    </button>
                    <button 
                        onClick={() => setStep(2)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${step === 2 ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Rooms
                    </button>
                </div>
            )}
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {step === 1 ? (
          <form onSubmit={handleSaveStay} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    required
                    name="title"
                    value={stayData.title}
                    onChange={handleStayChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="e.g. Glenary's View Suite"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={stayData.type}
                    onChange={handleStayChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="Homestay">Homestay</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Heritage Stay">Heritage Stay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    required
                    name="location"
                    value={stayData.location}
                    onChange={handleStayChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                    placeholder="e.g. Mall Road, Darjeeling"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    name="description"
                    value={stayData.description}
                    onChange={handleStayChange}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      {thumbnailFile ? (
                        <div className="relative">
                          <img 
                            src={URL.createObjectURL(thumbnailFile)} 
                            alt="Preview" 
                            className="h-32 object-cover rounded" 
                          />
                          <span className="text-xs text-green-600 mt-2 block">Change Image</span>
                        </div>
                      ) : stayData.thumbnail_url ? (
                        <div className="relative">
                          <img 
                            src={stayData.thumbnail_url} 
                            alt="Current" 
                            className="h-32 object-cover rounded" 
                          />
                          <span className="text-xs text-blue-600 mt-2 block">Click to replace</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500">Click to upload thumbnail</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      stayData.amenities.includes(amenity)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3">
              {stayId && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    Manage Rooms
                  </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : <>Save Changes <Check className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Add Room Form */}
            {isAddingRoom ? (
              <form onSubmit={handleSaveRoom} className="border-2 border-primary/20 rounded-lg p-6 bg-blue-50/30">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    {editingRoomId ? 'Edit Room' : 'New Room Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                    <input
                      required
                      name="name"
                      value={currentRoom.name}
                      onChange={handleRoomChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g. Deluxe Double"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                        required
                        type="number"
                        name="price"
                        value={currentRoom.price}
                        onChange={handleRoomChange}
                        className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                        <input
                        required
                        type="number"
                        name="capacity"
                        value={currentRoom.capacity}
                        onChange={handleRoomChange}
                        className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                    name="description"
                    value={currentRoom.description}
                    onChange={handleRoomChange}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Images</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleRoomImagesDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-white transition-colors cursor-pointer bg-white"
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleRoomImagesSelect}
                      className="hidden"
                      id="room-images"
                    />
                    <label htmlFor="room-images" className="cursor-pointer block">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                            Drag images here or <span className="text-primary font-medium">browse</span>
                        </p>
                    </label>
                  </div>
                  
                  {/* Image Previews */}
                  {currentRoom.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {currentRoom.images.map((img, idx) => (
                        <div key={idx} className="relative group w-20 h-20">
                          <img 
                            src={img.preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-md border" 
                          />
                          <button
                            type="button"
                            onClick={() => removeRoomImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelRoom}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingRoomId ? 'Update Room' : 'Save Room')}
                  </button>
                </div>
              </form>
            ) : (
                <>
                {/* Rooms List */}
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50 hover:shadow-sm transition-shadow">
                      <div>
                        <h4 className="font-semibold text-gray-800">{room.name}</h4>
                        <p className="text-sm text-gray-600">
                            ₹{room.price} • {room.capacity} Guests • {room.imageCount} Images
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleEditRoom(room)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Room"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Room"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {rooms.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                      No rooms added yet.
                    </div>
                  )}
                </div>

                <button
                    onClick={() => setIsAddingRoom(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 mt-4"
                >
                    <Plus className="w-5 h-5" /> Add Room
                </button>
              </>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
              <button
                onClick={onComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Finish & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStayForm;
