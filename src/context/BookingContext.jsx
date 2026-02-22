import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  // Booking State
  const [bookingData, setBookingData] = useState({
    serviceType: null, // 'stay', 'cab', 'package'
    serviceId: null,
    serviceDetails: null, // Full object of the selected service
    startDate: null,
    endDate: null, // For stays
    timeSlot: null, // For cabs/tours
    guests: 1,
    totalPrice: 0,
    contactDetails: {
        name: '',
        email: '',
        phone: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Date/Time, 2: Checkout, 3: Success

  const initializeBooking = (type, service) => {
    setBookingData({
        serviceType: type,
        serviceId: service.id,
        serviceDetails: service,
        startDate: null,
        endDate: null,
        timeSlot: null,
        guests: 1,
        totalPrice: Number(service.price) || Number(service.basePrice) || 0,
        contactDetails: { name: '', email: '', phone: '' }
    });
    setCurrentStep(1);
  };

  const updateBookingDates = (start, end, slot) => {
    setBookingData(prev => ({
        ...prev,
        startDate: start,
        endDate: end,
        timeSlot: slot
    }));
  };

  const updateGuests = (count) => {
    setBookingData(prev => ({
        ...prev,
        guests: count
    }));
  };

  const updateContact = (field, value) => {
    setBookingData(prev => ({
        ...prev,
        contactDetails: {
            ...prev.contactDetails,
            [field]: value
        }
    }));
  };

  const calculateTotal = () => {
    // Simple logic for now
    // Stays: price * nights
    // Cabs: basePrice + stops (handled in serviceDetails for routes usually)
    // Packages: price * guests
    
    let total = 0;
    const { serviceType, serviceDetails, guests, startDate, endDate } = bookingData;

    if (!serviceDetails) return 0;

    if (serviceType === 'stay') {
        const basePrice = Number(serviceDetails.price || 0);
        // Calculate nights if dates selected
        let nights = 1;
        if (startDate && endDate) {
            const diffTime = Math.abs(endDate - startDate);
            nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        }
        total = basePrice * nights; // Per night pricing usually, assumes room price
    } else if (serviceType === 'route') {
        // Route details usually come with calculated total if stops added
        // If we passed the full calculated object from RouteDetails, use that
        total = Number(serviceDetails.totalPrice || serviceDetails.basePrice || 0);
    } else {
        // Packages/Tours
        const price = Number(serviceDetails.price?.replace(/[^0-9.]/g, '') || 0);
        total = price * guests;
    }

    return total;
  };

  // Sync total when dependencies change
  useEffect(() => {
    const newTotal = calculateTotal();
    setBookingData(prev => ({ ...prev, totalPrice: newTotal }));
  }, [bookingData.startDate, bookingData.endDate, bookingData.guests, bookingData.serviceDetails]);


  const value = {
    bookingData,
    currentStep,
    setCurrentStep,
    initializeBooking,
    updateBookingDates,
    updateGuests,
    updateContact
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
