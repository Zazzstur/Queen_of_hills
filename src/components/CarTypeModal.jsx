import React from 'react';
import { X } from 'lucide-react';

const CAR_OPTIONS = [
  { label: '4 Seater', value: '4 Seater', priceKey: 'price4Seater' },
  { label: '6 Seater Luxury SUV', value: '6 Seater Luxury SUV', priceKey: 'price6SeaterLuxurySuv' },
  { label: '6-10 Seater SUV', value: '6-10 Seater SUV', priceKey: 'price6to10SeaterSuv' },
];

const CarTypeModal = ({ isOpen, onClose, route, selectedCapacity, onSelect, title = 'Choose Vehicle' }) => {
  if (!isOpen) return null;

  const getPrice = (r, priceKey) => {
    if (!r) return 0;
    const value = r[priceKey] ?? r.basePrice ?? 0;
    return Number(value) || 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            {route && (
              <p className="text-sm text-gray-500 mt-1">
                {route.origin} to {route.destination}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {CAR_OPTIONS.map((opt) => {
            const price = getPrice(route, opt.priceKey);
            const isActive = String(selectedCapacity || '').toLowerCase() === String(opt.value).toLowerCase();

            return (
              <button
                key={opt.value}
                onClick={() => onSelect && onSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors text-left ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Tap to select</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">₹{price}</div>
                  <div className="text-xs text-gray-500">base price</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarTypeModal;

