import React, { useState } from 'react';
import { Building2, X, Plus, AlertCircle, CheckCircle2, Instagram, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient, clients } = useApp();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+19876543210');
  const [businessType, setBusinessType] = useState('Clinic');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState('#0d9488'); // Teal default

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Inline case-insensitive duplicate check
  const isDuplicate = name.trim().length > 0 && clients.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Client Name is required.');
      return;
    }

    if (isDuplicate) {
      setErrorMsg(`A client named "${name.trim()}" already exists.`);
      return;
    }

    const res = addClient({
      name: name.trim(),
      phone_number: phoneNumber.trim() || '+19876543210',
      business_type: businessType.trim() || 'General',
      avatar_color: avatarColor,
      instagram_handle: instagramHandle.trim() ? (instagramHandle.trim().startsWith('@') ? instagramHandle.trim() : `@${instagramHandle.trim()}`) : undefined,
      contact_notes: contactNotes.trim() || undefined,
    });

    if (res && !res.success) {
      setErrorMsg(res.error || 'Failed to add client. Please try again.');
    } else {
      setSuccessMsg('Client added successfully!');
      setTimeout(() => {
        setName('');
        setInstagramHandle('');
        setContactNotes('');
        setSuccessMsg(null);
        setErrorMsg(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-agency-purple flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">Add New Client Account</h3>
              <p className="text-[11px] font-semibold text-slate-500">Create workspace & link to your account</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Name Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Client / Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Dental Care, Urban Grind Coffee"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              className={`w-full bg-slate-50 border rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                isDuplicate ? 'border-rose-400 ring-2 ring-rose-300/40' : 'border-slate-200 focus:ring-purple-500/30'
              }`}
            />
            {isDuplicate && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> A client named "{name.trim()}" already exists.
              </p>
            )}
          </div>

          {/* Business Type & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Business Category
              </label>
              <input
                type="text"
                placeholder="Clinic, Shop, Real Estate..."
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Phone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+19876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>

          {/* Instagram Handle Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Handle (Optional)
            </label>
            <input
              type="text"
              placeholder="@brandname or instagram_handle"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Contact / Notes Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-500" /> Contact / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Owner: John Doe, Preferred posting time: 10 AM..."
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Client Avatar Color Theme */}
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
                  className={`w-8 h-8 rounded-xl transition-all cursor-pointer ${
                    avatarColor === c.value ? 'ring-4 ring-purple-300 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDuplicate || !name.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-agency-purple to-purple-600 hover:from-purple-700 hover:to-agency-purple text-white font-extrabold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create & Assign Client
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
