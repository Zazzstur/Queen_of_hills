import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { Check, Calendar, CreditCard } from 'lucide-react';
import DateSelection from './DateSelection';
import CheckoutPage from './CheckoutPage';
import { useNavigate } from 'react-router-dom';

const BookingLayout = () => {
  const { currentStep, bookingData } = useBooking();
  const navigate = useNavigate();

  // Redirect if no booking data initiated
  React.useEffect(() => {
    if (!bookingData.serviceId) {
        navigate('/');
    }
  }, [bookingData, navigate]);

  if (!bookingData.serviceId) return null;

  const steps = [
    { number: 1, label: 'Date & Time', icon: Calendar },
    { number: 2, label: 'Checkout', icon: CreditCard },
    { number: 3, label: 'Confirmation', icon: Check }
  ];

  return (
    <div className="min-h-screen bg-snow pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Steps Indicator */}
        <div className="mb-12">
            <div className="flex items-center justify-center relative">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10 hidden md:block w-2/3 mx-auto"></div>
                
                <div className="flex justify-between w-full md:w-2/3">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.number;
                        const isCurrent = currentStep === step.number;
                        
                        return (
                            <div key={step.number} className="flex flex-col items-center bg-snow px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                    isActive 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`mt-2 text-xs md:text-sm font-medium ${
                                    isCurrent ? 'text-primary' : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
            {currentStep === 1 && <DateSelection />}
            {currentStep === 2 && <CheckoutPage />}
            {currentStep === 3 && (
                <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-primary mb-4">Booking Confirmed!</h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Thank you for booking with Toils. A confirmation email has been sent to your inbox.
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingLayout;