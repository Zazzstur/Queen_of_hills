import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Save, Loader2, Plus, AlertCircle, ImageIcon } from 'lucide-react';
import { routeService } from '../../services/routeService';

const stopSchema = z.object({
  name: z.string().min(1, 'Stop name is required'),
  price4Seater: z.coerce.number().min(0, 'Price must be 0 or more').optional(),
  price6SeaterLuxurySuv: z.coerce.number().min(0, 'Price must be 0 or more').optional(),
  price6to10SeaterSuv: z.coerce.number().min(0, 'Price must be 0 or more').optional(),
  description: z.string().optional(),
});

const StopCard = ({ routeId, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]); // Array of { file, preview }
  const [uploadError, setUploadError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stopSchema),
    defaultValues: {
      name: '',
      price4Seater: 0,
      price6SeaterLuxurySuv: 0,
      price6to10SeaterSuv: 0,
      description: '',
    }
  });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    let errorMsg = '';

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        errorMsg = 'Some images were skipped (Max 5MB)';
        return;
      }
      if (!file.type.startsWith('image/')) {
        errorMsg = 'Some files were skipped (Images only)';
        return;
      }
      newImages.push({
        file,
        preview: URL.createObjectURL(file)
      });
    });

    if (errorMsg) setUploadError(errorMsg);
    else setUploadError('');

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setGeneralError('');

    if (!routeId) {
        setGeneralError('Internal Error: Missing Route ID. Please restart.');
        setIsSubmitting(false);
        return;
    }

    let createdStopId = null;

    try {
      // 1. Save Stop details
      const stopData = {
          ...data,
          routeId: routeId
      };
      
      const { data: newStop, error } = await routeService.addStop(stopData);
      
      if (error) {
          throw new Error(error.message || "Failed to create stop");
      }
      
      createdStopId = newStop.id;

      // 2. Upload Images
      const uploadedImageUrls = [];
      if (images.length > 0) {
          try {
              for (const img of images) {
                const path = `stops/${createdStopId}/${Date.now()}_${img.file.name}`;
                const url = await routeService.uploadImage(img.file, path);
                uploadedImageUrls.push({ stopId: createdStopId, url });
              }
          } catch (uploadErr) {
              console.error("Image upload failed:", uploadErr);
              throw new Error("Failed to upload images. Transaction cancelled.");
          }
      }

      // 3. Save Image Links
      if (uploadedImageUrls.length > 0) {
        const { error: linkError } = await routeService.addStopImages(uploadedImageUrls);
        if (linkError) throw new Error("Failed to link images to stop.");
      }

      // 4. Success Callback
      const fullStopData = { ...newStop, images: uploadedImageUrls };
      
      if (onSuccess) {
          onSuccess(fullStopData);
      }

    } catch (err) {
      console.error('Error saving stop:', err);
      
      // --- Transaction Rollback ---
      if (createdStopId) {
          console.warn(`Rolling back transaction: Deleting orphaned stop ${createdStopId}`);
          try {
              await routeService.deleteStop(createdStopId);
          } catch (rollbackErr) {
              console.error("Rollback failed:", rollbackErr);
          }
      }
      
      setGeneralError(err.message || 'Failed to save stop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
        <div>
            <h4 className="text-lg font-bold text-gray-800">Add New Stop</h4>
            <p className="text-sm text-gray-500">Enter details for this point of interest.</p>
        </div>
        <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
      </div>
      
      {generalError && (
        <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Stop Name <span className="text-red-500">*</span></label>
            <input 
              {...register('name')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              placeholder="e.g. Lamahatta Eco Park"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">4 Seater Price (₹)</label>
            <input
              type="number"
              {...register('price4Seater')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="0"
              min="0"
            />
            {errors.price4Seater && <p className="text-red-500 text-xs">{errors.price4Seater.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">6 Seater Luxury (₹)</label>
            <input
              type="number"
              {...register('price6SeaterLuxurySuv')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="0"
              min="0"
            />
            {errors.price6SeaterLuxurySuv && <p className="text-red-500 text-xs">{errors.price6SeaterLuxurySuv.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">6–10 Seater SUV (₹)</label>
            <input
              type="number"
              {...register('price6to10SeaterSuv')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="0"
              min="0"
            />
            {errors.price6to10SeaterSuv && <p className="text-red-500 text-xs">{errors.price6to10SeaterSuv.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
                {...register('description')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]"
                placeholder="What makes this stop special?"
            />
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group shadow-sm">
                        <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="bg-gray-100 p-2 rounded-full mb-1 group-hover:bg-white transition-colors">
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Add Image</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
            </div>
            {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
        </div>

        <div className="flex justify-end pt-4 gap-3 border-t border-gray-100">
            <button 
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 shadow-md shadow-green-100"
            >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Stop
            </button>
        </div>
      </form>
    </div>
  );
};

export default StopCard;
