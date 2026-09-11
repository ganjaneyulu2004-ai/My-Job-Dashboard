import React, { useState } from 'react';
import { Building2, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessType } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient } = useApp();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+19876543210');
  const [businessType, setBusinessType] = useState<BusinessType>('Clinic');
  const [avatarColor, setAvatarColor] = useState('#0d9488'); // Teal default

  const colorOptions = [
    { label: 'Teal', value: '#0d9488' },
    { label: 'Purple', value: '#7c3aed' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Coral', value: '#f43f5e' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Cyan', value: '#0891b2' },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addClient({
      name: name.trim(),
      phone_number: phoneNumber,
      business_type: businessType,
      avatar_color: avatarColor,
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-agency-purple flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Add New Client Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Client / Business Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Dental Care, Urban Grind Coffee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                WhatsApp / Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="+19876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="Clinic">Clinic</option>
                <option value="Shop">Shop</option>
                <option value="Local Business">Local Business</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Service Provider">Service Provider</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Client Avatar Color Theme
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {colorOptions.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setAvatarColor(c.value)}
                  className={`w-8 h-8 rounded-xl transition-all ${
                    avatarColor === c.value ? 'ring-4 ring-purple-300 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-agency-purple text-white font-bold text-xs shadow-md shadow-purple-500/20"
            >
              Save Client
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
