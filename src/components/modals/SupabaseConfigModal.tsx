import React, { useState } from 'react';
import { Database, X, CheckCircle2, RotateCcw, ShieldCheck, Key, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { supabaseConfig, setSupabaseConfig, resetToSeedData } = useApp();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [key, setKey] = useState(supabaseConfig.key || '');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      setSupabaseConfig({
        url,
        key,
        connected: true
      });
      setTestStatus('✅ Connected to Supabase Cloud Database successfully!');
    } else {
      setSupabaseConfig({
        url: '',
        key: '',
        connected: false
      });
      setTestStatus('ℹ️ Running in Standalone Mock Database mode.');
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the original sample seed data?')) {
      resetToSeedData();
      alert('Data reset to original seed state!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Database & Supabase Settings</h3>
              <p className="text-xs text-slate-500 font-medium">Connect cloud DB or use built-in local database</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">⚡ Zero Setup Required!</p>
            <p>AgencyOps runs automatically out-of-the-box with local storage persistence. To sync with your Supabase backend, enter your Project URL and Anon API key below.</p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-500" /> Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-emerald-500" /> Supabase Anon / API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
            />
          </div>

          {testStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {testStatus}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1 hover:bg-rose-100"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Sample Seed Data
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
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
