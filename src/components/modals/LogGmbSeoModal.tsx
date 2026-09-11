import React, { useState } from 'react';
import { MapPin, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GmbSeoType } from '../../types';

interface LogGmbSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogGmbSeoModal: React.FC<LogGmbSeoModalProps> = ({ isOpen, onClose }) => {
  const { clients, activeClientId, addGmbSeoEntry } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [selectedClient, setSelectedClient] = useState<string>(activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GmbSeoType>('gmb_post');
  const [datePosted, setDatePosted] = useState(todayStr);
  const [searchPos, setSearchPos] = useState<number>(3);
  const [mapsPos, setMapsPos] = useState<number>(2);
  const [views, setViews] = useState<number>(450);
  const [clicks, setClicks] = useState<number>(65);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGmbSeoEntry({
      client_id: selectedClient,
      title: title.trim(),
      type,
      date_posted: datePosted,
      search_position: Number(searchPos),
      maps_position: Number(mapsPos),
      views: Number(views),
      clicks: Number(clicks),
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" /> Log GMB Post or SEO Blog
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Client Account
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Post / Blog Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Dental Consultation Special"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Content Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GmbSeoType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="gmb_post">GMB Post</option>
                <option value="seo_blog">SEO Blog</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Date Published
              </label>
              <input
                type="date"
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Search Rank (#)
              </label>
              <input
                type="number"
                min={1}
                value={searchPos}
                onChange={(e) => setSearchPos(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Google Maps Pack (#)
              </label>
              <input
                type="number"
                min={1}
                value={mapsPos}
                onChange={(e) => setMapsPos(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Views / Impressions
              </label>
              <input
                type="number"
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Clicks / Calls
              </label>
              <input
                type="number"
                value={clicks}
                onChange={(e) => setClicks(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
              />
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
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/20"
            >
              Log Entry
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
