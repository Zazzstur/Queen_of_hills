import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { routeService } from '../../services/routeService';

const routeSchema = z.object({
  name: z.string().min(1, 'Route Name is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  price4Seater: z.coerce.number().min(1, 'Price must be greater than 0'),
  price6SeaterLuxurySuv: z.coerce.number().min(1, 'Price must be greater than 0'),
  price6to10SeaterSuv: z.coerce.number().min(1, 'Price must be greater than 0'),
  capacity: z.enum(['4 seater', '6 seater luxury suv', '6-10 seater suv']),
  type: z.enum(['sightseeing', 'direct']).default('sightseeing'),
  description: z.string().optional(),
});

const RouteDetailsForm = ({ onRouteCreated, initialData, defaultType = 'sightseeing' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.coverImage || null);
  const [uploadError, setUploadError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: initialData?.name || initialData?.routeName || '',
      origin: initialData?.origin || '',
      destination: initialData?.destination || '',
      price4Seater: initialData?.price4Seater ?? initialData?.basePrice ?? '',
      price6SeaterLuxurySuv: initialData?.price6SeaterLuxurySuv ?? '',
      price6to10SeaterSuv: initialData?.price6to10SeaterSuv ?? '',
      capacity: initialData?.capacity || '4 seater',
      type: initialData?.type || defaultType,
      description: initialData?.description || '',
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError('File must be an image');
        return;
      }
      setUploadError('');
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    if (!coverImage && !initialData?.coverImage) {
      setUploadError('Cover image is required');
      return;
    }

    setIsSubmitting(true);
    setGeneralError('');
    
    try {
      // 1. Upload Image (only if changed)
      let imageUrl = initialData?.coverImage;
      if (coverImage) {
        const imagePath = `routes/${Date.now()}_${coverImage.name}`;
        imageUrl = await routeService.uploadImage(coverImage, imagePath);
      }

      // 2. Create or Update Route
      const routeData = {
        ...data,
        coverImage: imageUrl,
      };

      let result;
      if (initialData?.id) {
          result = await routeService.updateRoute(initialData.id, routeData);
      } else {
          result = await routeService.createRoute(routeData);
      }

      const { data: savedRoute, error } = result;
      
      if (error) throw error;

      onRouteCreated(savedRoute);
    } catch (err) {
      console.error('Error creating route:', err);
      setGeneralError('Failed to save route. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-1">
      {generalError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Route Information</h3>
            
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Route Name <span className="text-red-500">*</span></label>
                <input 
                    {...register('name')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder="e.g. Heritage Darjeeling Tour"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Origin <span className="text-red-500">*</span></label>
                    <input 
                        {...register('origin')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.origin ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        placeholder="e.g. Darjeeling"
                    />
                    {errors.origin && <p className="text-red-500 text-xs">{errors.origin.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Destination <span className="text-red-500">*</span></label>
                    <input 
                        {...register('destination')}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.destination ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                        placeholder="e.g. Siliguri"
                    />
                    {errors.destination && <p className="text-red-500 text-xs">{errors.destination.message}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">4 Seater Price (₹) <span className="text-red-500">*</span></label>
                        <input 
                            type="number"
                            {...register('price4Seater')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.price4Seater ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            placeholder="0.00"
                        />
                        {errors.price4Seater && <p className="text-red-500 text-xs">{errors.price4Seater.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">6 Seater Luxury SUV Price (₹) <span className="text-red-500">*</span></label>
                        <input 
                            type="number"
                            {...register('price6SeaterLuxurySuv')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.price6SeaterLuxurySuv ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            placeholder="0.00"
                        />
                        {errors.price6SeaterLuxurySuv && <p className="text-red-500 text-xs">{errors.price6SeaterLuxurySuv.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">6-10 Seater SUV Price (₹) <span className="text-red-500">*</span></label>
                        <input 
                            type="number"
                            {...register('price6to10SeaterSuv')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.price6to10SeaterSuv ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                            placeholder="0.00"
                        />
                        {errors.price6to10SeaterSuv && <p className="text-red-500 text-xs">{errors.price6to10SeaterSuv.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Default Vehicle Type <span className="text-red-500">*</span></label>
                        <select 
                            {...register('capacity')}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                        >
                            <option value="4 seater">4 Seater</option>
                            <option value="6 seater luxury suv">6 Seater Luxury SUV</option>
                            <option value="6-10 seater suv">6-10 Seater SUV</option>
                        </select>
                        {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Route Type <span className="text-red-500">*</span></label>
                <select 
                    {...register('type')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                >
                    <option value="sightseeing">Sight Seeing (with Stops)</option>
                    <option value="direct">Direct Travel (Point to Point)</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    {...register('description')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[120px]"
                    placeholder="Describe the route, key scenic points, road conditions, etc."
                />
            </div>
        </div>

        {/* Right Column: Image */}
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Visuals</h3>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cover Image <span className="text-red-500">*</span></label>
                <div className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-xl transition-all relative ${uploadError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}>
                    {imagePreview ? (
                        <div className="relative w-full h-64 group">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setCoverImage(null);
                                        setImagePreview(null);
                                    }}
                                    className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-white transition-transform hover:scale-110"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 text-center">
                            <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                    )}
                </div>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 mt-8 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {initialData ? 'Update & Continue' : 'Create & Continue'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RouteDetailsForm;
