import React, { useState } from 'react';
import { Settings, X, Phone, Bell, Database, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { subashGlobalPhone, setSubashGlobalPhone, resetToSeedData } = useApp();

  const [phoneInput, setPhoneInput] = useState(subashGlobalPhone);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      setSubashGlobalPhone(phoneInput.trim());
    }
    onClose();
  };

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('❌ Web Notifications not supported in this browser.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationStatus('✅ Web Notifications permission granted!');
      new Notification('iBrain Labs Daily Report Reminder', {
        body: '🕕 Test Notification: Time to send today\'s report to Subash Sir.',
        icon: '/ibrain-logo.png'
      });
    } else {
      setNotificationStatus('⚠️ Notification permission denied or dismissed.');
    }
  };

  const handleReset = () => {
    if (confirm('Reset all agency data back to initial sample seed data?')) {
      resetToSeedData();
      alert('iBrain Labs data reset to initial seed state.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-agency-purple flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">iBrain Labs Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Subash Sir's WhatsApp Number Setting Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-whatsapp" />
              <span>Subash Sir's WhatsApp Phone Number</span>
            </label>
            <input
              type="text"
              required
              placeholder="+19876543210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Used for generating the <code>wa.me</code> direct link for the End-of-Day Full Work Report.
            </p>
          </div>

          {/* Browser Notifications Test Button */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              6:00 PM Daily Web Notification
            </label>
            <button
              type="button"
              onClick={handleRequestNotification}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Bell className="w-4 h-4 text-amber-500" /> Test & Enable Web Notifications
            </button>
            {notificationStatus && (
              <p className="text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                {notificationStatus}
              </p>
            )}
          </div>

          {/* Reset Seed Data */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1 hover:bg-rose-100"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Sample Data
            </button>

            <div className="flex gap-2">
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
                Save Settings
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
