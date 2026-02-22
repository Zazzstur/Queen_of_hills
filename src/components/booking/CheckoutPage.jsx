import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { format } from 'date-fns';
import { CreditCard, Wallet, Landmark, ArrowLeft, ShieldCheck } from 'lucide-react';

const CheckoutPage = () => {
  const { bookingData, setCurrentStep, updateContact } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(3); // Success Step
    }, 2000);
  };

  const calculateTaxes = (subtotal) => subtotal * 0.18; // 18% GST mock

  const subtotal = bookingData.totalPrice;
  const taxes = calculateTaxes(subtotal);
  const total = subtotal + taxes;

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

        {/* Contact Info Form */}
        <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
                        placeholder="John Doe"
                        value={bookingData.contactDetails.name}
                        onChange={(e) => updateContact('name', e.target.value)}
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                    <input 
                        type="tel" 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary"
                        placeholder="+91 98765 43210"
                        value={bookingData.contactDetails.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Payment Method</h3>
            <div className="space-y-3">
                <div 
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border flex items-center cursor-pointer transition-all ${
                        paymentMethod === 'card' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-primary' : 'border-gray-300'
                    }`}>
                        {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-700">Credit / Debit Card</span>
                </div>

                <div 
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border flex items-center cursor-pointer transition-all ${
                        paymentMethod === 'upi' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center ${
                        paymentMethod === 'upi' ? 'border-primary' : 'border-gray-300'
                    }`}>
                        {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <Wallet className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-700">UPI / Digital Wallet</span>
                </div>

                <div 
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-xl border flex items-center cursor-pointer transition-all ${
                        paymentMethod === 'bank' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <div className={`w-5 h-5 rounded-full border mr-4 flex items-center justify-center ${
                        paymentMethod === 'bank' ? 'border-primary' : 'border-gray-300'
                    }`}>
                        {paymentMethod === 'bank' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <Landmark className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-700">Net Banking</span>
                </div>
            </div>
        </div>

        <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center"
        >
            {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(0)}`}
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
                <p className="text-sm text-gray-500 capitalize">{bookingData.serviceType}</p>
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
            <div className="flex justify-between text-gray-600">
                <span>Taxes & Fees (18%)</span>
                <span>₹{taxes.toFixed(0)}</span>
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
