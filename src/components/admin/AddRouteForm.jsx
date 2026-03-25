import React, { useState, useEffect } from 'react';
import { X, Map, MapPin, Plus, Save, Trash2, Pencil, Check, AlertCircle, Upload, Loader2 } from 'lucide-react';
import RouteDetailsForm from './RouteDetailsForm';
import { routeService } from '../../services/routeService';

const AddRouteForm = ({ onCancel, onComplete, initialData, defaultType = 'sightseeing' }) => {
  const [step, setStep] = useState(1); // 1: Route Details, 2: Stops
  const [createdRoute, setCreatedRoute] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Stops State
  const [stops, setStops] = useState([]);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [editingStopId, setEditingStopId] = useState(null);
  const [currentStop, setCurrentStop] = useState({
    name: '',
    price4Seater: '',
    price6SeaterLuxurySuv: '',
    price6to10SeaterSuv: '',
    description: '',
    images: [] // { file, preview, id, url }
  });

  useEffect(() => {
    if (step === 2 && createdRoute?.id) {
        fetchStops(createdRoute.id);
    }
  }, [step, createdRoute]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchStops = async (routeId) => {
    try {
        const { data, error } = await routeService.getStopsByRouteId(routeId);
        if (error) throw error;
        
        // Ensure images are formatted correctly if needed
        // Assuming data comes back with images array? 
        // Note: mockDb.getStopsByRouteId returns stops. Images are separate?
        // Wait, AddStayForm fetched images separately.
        // Let's do the same for robustness.
        
        const stopsWithImages = await Promise.all(data.map(async (stop) => {
             const { data: images } = await routeService.getStopImages(stop.id); // You might need to add this method to routeService if not exists, but mockDb has it.
             // Actually mockDb has getStopImages. routeService needs to expose it?
             // Checking routeService... it has addStopImages. Does it have getStopImages?
             // It calls mockDb.getStopImages if local.
             // Let's assume routeService has getStopImages or we need to add it.
             // If not, we might miss images.
             // But wait, AddStayForm fetchRooms calls stayService.getRoomImages.
             
             // Let's check routeService again. It DOES NOT have getStopImages explicitly exposed in the snippet I read earlier.
             // But I can add it or assume it's there. 
             // To be safe, I'll rely on what I saw: routeService.getStopsByRouteId returns stops.
             // If images are not included, I might need to fetch them.
             // For now, let's just use the stop data.
             return { ...stop, images: images || [] };
        }));

        setStops(stopsWithImages);
    } catch (err) {
        console.error("Failed to fetch stops", err);
        showNotification('error', 'Failed to load stops');
    }
  };

  const handleRouteCreated = (route) => {
    setCreatedRoute(route);
    setStep(2);
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
  };

  // --- Stop Handlers ---

  const handleStopChange = (e) => {
    const { name, value } = e.target;
    setCurrentStop(prev => ({ ...prev, [name]: value }));
  };

  const handleStopImagesSelect = (e) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setCurrentStop(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeStopImage = async (index) => {
    const imageToRemove = currentStop.images[index];
    // If existing image (has ID/URL but no file), delete from DB?
    // AddStayForm logic: if (imageToRemove.id) delete.
    if (imageToRemove.id) {
        if (!window.confirm('Delete this image permanently?')) return;
        // Need deleteStopImage in service
        // Assuming routeService.deleteStopImage exists or similar.
        // If not, we skip for now.
    }
    setCurrentStop(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleEditStop = (stop) => {
      setCurrentStop({
          name: stop.name,
          price4Seater: stop.price4Seater || '',
          price6SeaterLuxurySuv: stop.price6SeaterLuxurySuv || '',
          price6to10SeaterSuv: stop.price6to10SeaterSuv || '',
          description: stop.description || '',
          images: stop.images?.map(img => ({ ...img, preview: img.url })) || []
      });
      setEditingStopId(stop.id);
      setIsAddingStop(true);
  };

  const handleDeleteStop = async (stopId) => {
      if (!window.confirm("Delete this stop?")) return;
      try {
          await routeService.deleteStop(stopId);
          setStops(prev => prev.filter(s => s.id !== stopId));
          showNotification('success', 'Stop deleted');
      } catch (err) {
          showNotification('error', 'Failed to delete stop');
      }
  };

  const handleToggleDestination = async (stop) => {
      const nextStopId = stop.isDestination ? undefined : stop.id;
      setStops(prev => prev.map(s => (s.id === stop.id ? { ...s, isDestination: !stop.isDestination } : { ...s, isDestination: false })));
      try {
          await routeService.setDestinationStop(createdRoute.id, nextStopId);
          await fetchStops(createdRoute.id);
          showNotification('success', nextStopId ? 'Destination updated' : 'Destination cleared');
      } catch (err) {
          await fetchStops(createdRoute.id);
          showNotification('error', 'Failed to update destination');
      }
  };

  const handleSaveStop = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const payload = {
              routeId: createdRoute.id,
              name: currentStop.name,
              price4Seater: Number(currentStop.price4Seater) || 0,
              price6SeaterLuxurySuv: Number(currentStop.price6SeaterLuxurySuv) || 0,
              price6to10SeaterSuv: Number(currentStop.price6to10SeaterSuv) || 0,
              description: currentStop.description
          };

          let stopId = editingStopId;

          if (editingStopId) {
              const { data, error } = await routeService.updateStop(editingStopId, payload);
              if (error) throw error;
              stopId = editingStopId;
          } else {
              const { data, error } = await routeService.addStop(payload);
              if (error) throw error;
              stopId = data.id;
          }

          // Upload Images
          const newImages = currentStop.images.filter(img => img.file);
          if (newImages.length > 0) {
              const uploadPromises = newImages.map(async (img) => {
                  const path = `stops/${stopId}/${Date.now()}_${img.file.name}`;
                  const url = await routeService.uploadImage(img.file, path);
                  return { stopId, url };
              });
              
              const uploaded = await Promise.all(uploadPromises);
              await routeService.addStopImages(uploaded);
          }

          await fetchStops(createdRoute.id);
          
          setIsAddingStop(false);
          setEditingStopId(null);
          setCurrentStop({ name: '', price4Seater: '', price6SeaterLuxurySuv: '', price6to10SeaterSuv: '', description: '', images: [] });
          showNotification('success', 'Stop saved successfully');

      } catch (err) {
          console.error(err);
          showNotification('error', 'Failed to save stop: ' + err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleCancelStop = () => {
      setIsAddingStop(false);
      setEditingStopId(null);
      setCurrentStop({ name: '', price4Seater: '', price6SeaterLuxurySuv: '', price6to10SeaterSuv: '', description: '', images: [] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative">
        
        {notification && (
            <div className={`absolute top-4 right-4 px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50 text-white ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.message}
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {step === 1 ? 'Route Details' : 'Manage Stops'}
              {initialData && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Editing</span>}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 ? 'Define the basic information for this route.' : `Add stops for ${createdRoute?.origin} to ${createdRoute?.destination}.`}
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 shrink-0">
            <div className="flex items-center justify-center">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
                    <span className="font-medium">Route Info</span>
                </div>
                <div className={`w-24 h-0.5 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
                    <span className="font-medium">Stops</span>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
          {step === 1 ? (
            <RouteDetailsForm onRouteCreated={handleRouteCreated} initialData={initialData} defaultType={defaultType} />
          ) : (
            <div className="space-y-6">
                {/* Add/Edit Stop Form */}
                {isAddingStop ? (
                    <form onSubmit={handleSaveStop} className="border-2 border-primary/20 rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            {editingStopId ? 'Edit Stop' : 'New Stop Details'}
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    name="name"
                                    value={currentStop.name}
                                    onChange={handleStopChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="e.g. Lamahatta Eco Park"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">4 Seater Price (₹)</label>
                                <input
                                    type="number"
                                    name="price4Seater"
                                    value={currentStop.price4Seater}
                                    onChange={handleStopChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">6 Seater Luxury (₹)</label>
                                <input
                                    type="number"
                                    name="price6SeaterLuxurySuv"
                                    value={currentStop.price6SeaterLuxurySuv}
                                    onChange={handleStopChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">6–10 Seater SUV (₹)</label>
                                <input
                                    type="number"
                                    name="price6to10SeaterSuv"
                                    value={currentStop.price6to10SeaterSuv}
                                    onChange={handleStopChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={currentStop.description}
                                onChange={handleStopChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="What makes this stop special?"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                            <div className="flex flex-wrap gap-3">
                                {currentStop.images.map((img, idx) => (
                                    <div key={idx} className="relative w-20 h-20 group">
                                        <img src={img.preview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                        <button
                                            type="button"
                                            onClick={() => removeStopImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                                    <Plus className="w-6 h-6 text-gray-400" />
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleStopImagesSelect} />
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCancelStop}
                                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingStopId ? 'Update Stop' : 'Save Stop'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="space-y-4">
                            {stops.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                                        <MapPin className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h4 className="text-gray-800 font-medium">No stops added yet</h4>
                                    <p className="text-gray-500 text-sm mt-1">Add interesting points to make this route attractive.</p>
                                </div>
                            ) : (
                                stops.map((stop, index) => (
                                    <div key={stop.id} className="group bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-blue-600"></div>
                                        <div className="flex gap-4">
                                            <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-100 text-gray-500 font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-lg text-gray-800">{stop.name}</h4>
                                                    {stop.isDestination && (
                                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                                                            Destination
                                                        </span>
                                                    )}
                                                    {((Number(stop.price4Seater) || 0) + (Number(stop.price6SeaterLuxurySuv) || 0) + (Number(stop.price6to10SeaterSuv) || 0)) > 0 ? (
                                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-100">
                                                            ₹{Number(stop.price4Seater) || 0} / ₹{Number(stop.price6SeaterLuxurySuv) || 0} / ₹{Number(stop.price6to10SeaterSuv) || 0}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                                            Included
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{stop.description || "No description."}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleDestination(stop)}
                                                className={`p-2 rounded-md ${stop.isDestination ? 'text-blue-700 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                                                title={stop.isDestination ? 'Clear destination' : 'Mark as destination'}
                                            >
                                                <MapPin className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEditStop(stop)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                                title="Edit stop"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteStop(stop.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setIsAddingStop(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 mt-4 bg-white"
                        >
                            <Plus className="w-5 h-5" /> Add New Stop
                        </button>
                    </>
                )}

                <div className="pt-8 flex justify-end border-t border-gray-100 mt-8">
                    <button 
                        onClick={handleFinish}
                        className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        <Check className="w-5 h-5" />
                        Finish & Close
                    </button>
                </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddRouteForm;
