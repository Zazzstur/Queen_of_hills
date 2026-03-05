import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useBooking } from '../../context/BookingContext';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { addDays, format, setHours, setMinutes } from 'date-fns';

const DateSelection = () => {
  const { bookingData, updateBookingDates, updateGuests, setCurrentStep } = useBooking();
  const [startDate, setStartDate] = useState(bookingData.startDate || new Date());
  const [endDate, setEndDate] = useState(bookingData.endDate || addDays(new Date(), 1));
  
  // Custom Time State
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');
  const [error, setError] = useState('');

  // Update timeSlot when custom inputs change
  React.useEffect(() => {
    if (bookingData.serviceType !== 'stay') {
        const timeString = `${hour}:${minute} ${period}`;
        // Validate time if needed, update context/state
        // For now we just sync it to timeSlot state which is used by parent
    }
  }, [hour, minute, period, bookingData.serviceType]);

  const handleNext = () => {
    if (!startDate) {
        setError('Please select a date.');
        return;
    }
    
    if (bookingData.serviceType === 'stay' && !endDate) {
        setError('Please select a checkout date.');
        return;
    }

    let finalTimeSlot = bookingData.timeSlot;
    if (bookingData.serviceType !== 'stay') {
        finalTimeSlot = `${hour}:${minute} ${period}`;
    }

    if (bookingData.serviceType !== 'stay' && !finalTimeSlot) {
        setError('Please select a time.');
        return;
    }

    updateBookingDates(startDate, endDate, finalTimeSlot);
    setCurrentStep(2);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
      {/* Left Panel: Selection */}
      <div className="md:col-span-2 p-8 border-r border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Select Dates & Guests</h2>
        
        {/* Date Picker */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                {bookingData.serviceType === 'stay' ? 'Check-in / Check-out' : 'Travel Date'}
            </label>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                {bookingData.serviceType === 'stay' ? (
                    <div className="flex flex-col md:flex-row gap-4">
                         <DatePicker
                            selected={startDate}
                            onChange={(dates) => {
                                const [start, end] = dates;
                                setStartDate(start);
                                setEndDate(end);
                                setError('');
                            }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            minDate={new Date()}
                            inline
                            calendarClassName="!border-0 !bg-transparent !w-full"
                         />
                    </div>
                ) : (
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                            setStartDate(date);
                            setError('');
                        }}
                        minDate={new Date()}
                        inline
                        calendarClassName="!border-0 !bg-transparent !w-full"
                    />
                )}
            </div>
        </div>

        {/* Dynamic Time Selector (for non-stays) */}
        {bookingData.serviceType !== 'stay' && (
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    Select Time
                </label>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-200 w-full md:w-max">
                    {/* Hour Select */}
                    <div className="relative flex-1 md:flex-none">
                        <select 
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-2 md:px-3 py-2 text-base md:text-lg font-bold text-gray-700 focus:outline-none focus:border-primary w-full md:w-20 text-center"
                        >
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <span className="text-xl font-bold text-gray-400">:</span>
                    {/* Minute Select */}
                    <div className="relative flex-1 md:flex-none">
                         <select 
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-2 md:px-3 py-2 text-base md:text-lg font-bold text-gray-700 focus:outline-none focus:border-primary w-full md:w-20 text-center"
                        >
                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    
                    {/* AM/PM Toggle */}
                    <div className="flex bg-gray-200 rounded-lg p-1 ml-2 w-full md:w-auto justify-center md:justify-start mt-2 md:mt-0">
                        <button
                            onClick={() => setPeriod('AM')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${
                                period === 'AM' 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            AM
                        </button>
                        <button
                            onClick={() => setPeriod('PM')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${
                                period === 'PM' 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            PM
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Guest Count */}
        <div className="mb-8">
             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                Number of Guests
            </label>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => updateGuests(Math.max(1, bookingData.guests - 1))}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                    -
                </button>
                <span className="text-xl font-bold w-8 text-center">{bookingData.guests}</span>
                <button 
                    onClick={() => updateGuests(bookingData.guests + 1)}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                    +
                </button>
            </div>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        <div className="flex justify-end">
            <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all transform hover:-translate-y-0.5"
            >
                Continue to Checkout <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Right Panel: Summary Preview */}
      <div className="bg-gray-50 p-8 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h3>
        
        {bookingData.serviceDetails && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 mb-3">
                     <img 
                        src={bookingData.serviceDetails.thumbnail_url || bookingData.serviceDetails.image || 'https://via.placeholder.com/300'} 
                        alt="Service" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <h4 className="font-bold text-primary mb-1">
                    {bookingData.serviceDetails.title || bookingData.serviceDetails.origin + ' to ' + bookingData.serviceDetails.destination}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">{bookingData.serviceDetails.description}</p>
            </div>
        )}

        <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-500">Service Type</span>
                <span className="font-medium capitalize">
                    {bookingData.serviceType === 'route' ? 'Sight Seeing' : bookingData.serviceType}
                </span>
            </div>
            {startDate && (
                 <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{format(startDate, 'MMM dd, yyyy')}</span>
                </div>
            )}
             <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-500">Guests</span>
                <span className="font-medium">{bookingData.guests}</span>
            </div>
            <div className="flex justify-between pt-2">
                <span className="text-gray-800 font-bold">Estimated Total</span>
                <span className="text-primary font-bold text-lg">₹{bookingData.totalPrice}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelection;
