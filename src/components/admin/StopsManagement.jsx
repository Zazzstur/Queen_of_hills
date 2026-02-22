import React, { useState, useEffect } from 'react';
import { Plus, Check, MapPin, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import StopCard from './StopCard';
import { routeService } from '../../services/routeService';
import { runPersistenceTests } from '../../services/dbTest';

const StopsManagement = ({ routeId, onComplete }) => {
  const [stops, setStops] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [debugInfo, setDebugInfo] = useState(null);

  const fetchStops = async () => {
    if (routeId) {
        setLoading(true);
        setError('');
        try {
            const { data, error: fetchError } = await routeService.getStopsByRouteId(routeId);
            if (fetchError) throw fetchError;
            setStops(data || []);
            
            // Debugging: Get raw stats
            if (process.env.NODE_ENV === 'development') {
                try {
                    // This is a hack to get raw DB stats since routeService doesn't expose getAllStops
                    // We assume mockDb is available globally or we can't easily get it.
                    // Instead, let's just log what we have.
                    setDebugInfo({
                        routeId,
                        stopsFound: data?.length || 0,
                        timestamp: new Date().toLocaleTimeString()
                    });
                } catch (e) { /* ignore */ }
            }
        } catch (err) {
            console.error("Failed to load stops", err);
            setError("Failed to load existing stops. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    }
  };

  useEffect(() => {
    fetchStops();
  }, [routeId]);

  const handleStopAdded = async () => {
    // Add a small delay to ensure DB write propagation (safety net)
    await new Promise(resolve => setTimeout(resolve, 100));
    fetchStops(); 
    setIsAdding(false);
  };

  const handleDeleteStop = async (stopId) => {
      if (window.confirm("Are you sure you want to permanently delete this stop?")) {
          try {
              await routeService.deleteStop(stopId);
              fetchStops();
          } catch (err) {
              console.error("Failed to delete stop", err);
              alert("Failed to delete stop. Please try again.");
          }
      }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
            <h3 className="text-xl font-bold text-gray-800">Route Stops</h3>
            <p className="text-sm text-gray-500">Manage the points of interest for this route.</p>
        </div>
        {!isAdding && (
            <div className="flex gap-2">
                <button 
                    onClick={() => fetchStops()}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
                    title="Refresh List"
                >
                    <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Stop
                </button>
            </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <StopCard 
                routeId={routeId} 
                onSuccess={handleStopAdded} 
                onCancel={() => setIsAdding(false)} 
            />
          </div>
      )}

      {debugInfo && (
        <div className="bg-gray-100 p-2 text-xs text-gray-500 rounded mb-4 font-mono flex justify-between items-center">
            <span>Debug: RouteID {debugInfo.routeId} | Found {debugInfo.stopsFound} | {debugInfo.timestamp}</span>
            <button onClick={runPersistenceTests} className="text-blue-600 hover:underline">Run Tests</button>
        </div>
      )}

      {/* List of Saved Stops */}
      <div className="space-y-4">
        {loading ? (
            <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />
                <p className="text-gray-400 text-sm mt-2">Loading stops...</p>
            </div>
        ) : stops.length === 0 && !isAdding ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-gray-800 font-medium">No stops added yet</h4>
            <p className="text-gray-500 text-sm mt-1 mb-4">Add interesting points to make this route attractive.</p>
            <button 
                onClick={() => setIsAdding(true)}
                className="text-primary font-medium text-sm hover:underline"
            >
                Add your first stop
            </button>
          </div>
import StopDisplayCard from '../StopDisplayCard';

// ... (imports remain the same, removing unused imports later if needed)

// ... inside StopsManagement component, replacing the list mapping:

        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stops.map((stop, index) => (
                    <div key={stop.id} className="relative group">
                        <StopDisplayCard 
                            stop={stop} 
                            // Reusing onAdd for edit/delete or visual purposes? 
                            // The requirements asked for an "Add Stop Button" on the card.
                            // Since this is management, maybe the button creates a duplicate or is just decorative for now?
                            // Or better, let's keep the delete functionality as an overlay or separate button outside the card
                            // OR pass a custom handler if the card supports it.
                            // The card has `onAdd`. Let's assume for now it does nothing in admin view or triggers edit.
                            // But wait, the requirements said "Position a circular floating action button... with + icon".
                            // This implies the card is for USERS to add stops to their itinerary.
                            // However, I am editing the ADMIN interface.
                            // I will use the card here to visualize it, but I need to ensure Delete is still possible.
                            // I'll wrap the card or overlay the delete button.
                        />
                        <button 
                            onClick={() => handleDeleteStop(stop.id)}
                            className="absolute top-2 right-2 z-30 bg-white/90 text-red-600 p-2 rounded-full shadow-sm hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Stop"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="absolute top-2 left-2 z-30 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            #{index + 1}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="pt-8 flex justify-end border-t border-gray-100 mt-8">
        <button 
          onClick={onComplete}
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          <Check className="w-5 h-5" />
          Finish & Close
        </button>
      </div>
    </div>
  );
};

export default StopsManagement;
