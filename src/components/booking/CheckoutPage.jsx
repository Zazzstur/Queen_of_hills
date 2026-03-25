import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { format } from 'date-fns';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { bookingService } from '../../services/bookingService';

const CheckoutPage = () => {
  const { bookingData, setCurrentStep, updateContact } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const handlePayment = async () => {
    setFormError('');
    const name = bookingData.contactDetails.name?.trim();
    const phone = bookingData.contactDetails.phone?.trim();
    const pickupLocation = bookingData.contactDetails.pickupLocation?.trim();
    if (!name || !phone || !pickupLocation) {
      setFormError('Please fill all required fields.');
      return;
    }

    setIsProcessing(true);
    try {
      const stopNames = Array.isArray(bookingData.serviceDetails?.selectedStops)
        ? bookingData.serviceDetails.selectedStops.map((s) => s?.name).filter(Boolean)
        : undefined;

      const payload = {
        contact: {
          name,
          email: bookingData.contactDetails.email?.trim() || undefined,
          phone,
          pickupLocation,
        },
        service: {
          type: bookingData.serviceType || '',
          id: bookingData.serviceId || '',
          title:
            bookingData.serviceDetails?.title ||
            bookingData.serviceDetails?.name ||
            undefined,
          origin: bookingData.serviceDetails?.origin || undefined,
          destination: bookingData.serviceDetails?.destination || undefined,
        },
        booking: {
          startDate: bookingData.startDate
            ? new Date(bookingData.startDate).toISOString()
            : undefined,
          endDate: bookingData.endDate
            ? new Date(bookingData.endDate).toISOString()
            : undefined,
          timeSlot: bookingData.timeSlot || undefined,
          guests: Number(bookingData.guests || 1),
          stopNames: stopNames?.length ? stopNames : undefined,
        },
        pricing: {
          subtotal,
          taxes,
          total,
        },
      };

      const { error } = await bookingService.createBooking(payload);
      if (error) throw error;
      setCurrentStep(3);
    } catch (err) {
      setFormError(err?.message || 'Failed to place booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTaxes = () => 0;

  const subtotal = bookingData.totalPrice;
  const taxes = calculateTaxes(subtotal);
  const total = subtotal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
      {/* Left: Contact & Payment */}
      <div className="md:col-span-2 p-8 border-r border-gray-100">
        <button 
            onClick={() => setCurrentStep(1)}
            className="flex items-center text-sm text-gray-500 hover:text-primary mb-6"
        >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dates
        </button>

        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Confirm & Pay</h2>
        {formError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {formError}
          </div>
        )}

        {/* Contact Info Form */}
        <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
                        placeholder="John Doe"
                        value={bookingData.contactDetails.name}
                        onChange={(e) => updateContact('name', e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
                        placeholder="john@example.com"
                        value={bookingData.contactDetails.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                        type="tel" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
                        placeholder="+91 98765 43210"
                        value={bookingData.contactDetails.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pickup Location <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
                        placeholder="Enter pickup location"
                        value={bookingData.contactDetails.pickupLocation}
                        onChange={(e) => updateContact('pickupLocation', e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>

        <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center"
        >
            {isProcessing ? 'Processing...' : 'Book'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Payments are secure and encrypted
        </p>
      </div>

      {/* Right: Order Summary */}
      <div className="bg-gray-50 p-8 flex flex-col h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h3>
        
        {/* Item Card */}
        <div className="flex gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                 <img 
                    src={bookingData.serviceDetails.thumbnail_url || bookingData.serviceDetails.image || 'https://via.placeholder.com/150'} 
                    alt="Service" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div>
                <h4 className="font-bold text-gray-800 line-clamp-2">
                     {bookingData.serviceDetails.title || bookingData.serviceDetails.origin + ' to ' + bookingData.serviceDetails.destination}
                </h4>
                <p className="text-sm text-gray-500 capitalize">
                    {bookingData.serviceType === 'route' ? 'Sight Seeing' : bookingData.serviceType}
                </p>
            </div>
        </div>

        <div className="space-y-4 text-sm flex-1">
            <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <div className="text-right">
                    <span className="block font-medium">{bookingData.startDate ? format(bookingData.startDate, 'MMM dd') : '-'}</span>
                    {bookingData.endDate && <span className="block text-xs text-gray-400">to {format(bookingData.endDate, 'MMM dd')}</span>}
                </div>
            </div>
            {bookingData.timeSlot && (
                <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">{bookingData.timeSlot}</span>
                </div>
            )}
             <div className="flex justify-between">
                <span className="text-gray-500">Guests</span>
                <span className="font-medium">{bookingData.guests}</span>
            </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="mt-8 border-t border-gray-200 pt-6 space-y-3">
            <div className="flex justify-between text-gray-600">
                <span>Base Fare</span>
                <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-primary pt-3 border-t border-gray-200/50">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
