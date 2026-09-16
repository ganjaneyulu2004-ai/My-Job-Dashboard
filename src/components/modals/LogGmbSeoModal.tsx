import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Eye, MousePointer, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GmbSeoEntry, GmbSeoType } from '../../types';

interface LogGmbSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: GmbSeoEntry | null;
}

export const LogGmbSeoModal: React.FC<LogGmbSeoModalProps> = ({ isOpen, onClose, entryToEdit }) => {
  const { clients, activeClientId, addGmbSeoEntry, updateGmbSeoEntryMetrics } = useApp();

  const [selectedClientId, setSelectedClientId] = useState(activeClientId === 'all' ? clients[0]?.id || '' : activeClientId);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GmbSeoType>('gmb_post');
  const [datePosted, setDatePosted] = useState(new Date().toISOString().slice(0, 10));
  const [searchPosition, setSearchPosition] = useState<number>(3);
  const [mapsPosition, setMapsPosition] = useState<number>(2);
  const [views, setViews] = useState<number>(150);
  const [clicks, setClicks] = useState<number>(25);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (entryToEdit) {
      setSelectedClientId(entryToEdit.client_id);
      setTitle(entryToEdit.title);
      setType(entryToEdit.type);
      setDatePosted(entryToEdit.date_posted);
      setSearchPosition(entryToEdit.search_position);
      setMapsPosition(entryToEdit.maps_position || 0);
      setViews(entryToEdit.views);
      setClicks(entryToEdit.clicks);
      setNotes(entryToEdit.notes || '');
    } else {
      setSelectedClientId(activeClientId === 'all' ? clients[0]?.id || '' : activeClientId);
      setTitle('');
      setType('gmb_post');
      setDatePosted(new Date().toISOString().slice(0, 10));
      setSearchPosition(3);
      setMapsPosition(2);
      setViews(150);
      setClicks(25);
      setNotes('');
    }
  }, [entryToEdit, isOpen, activeClientId, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !entryToEdit) return;

    if (entryToEdit) {
      updateGmbSeoEntryMetrics(
        entryToEdit.id,
        searchPosition,
        mapsPosition,
        views,
        clicks
      );
    } else {
      addGmbSeoEntry({
        client_id: selectedClientId,
        title: title.trim(),
        type,
        date_posted: datePosted,
        search_position: searchPosition,
        maps_position: mapsPosition > 0 ? mapsPosition : undefined,
        views,
        clicks,
        notes: notes.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {entryToEdit ? 'Update GMB & SEO Metrics' : 'Log New GMB / SEO Post'}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {entryToEdit ? `Updating positions & metrics for "${entryToEdit.title}"` : 'Track local Google Maps ranking and search visibility.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!entryToEdit && (
            <>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Client Account
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Title / Keyword / Post Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Dentist Guide or Weekend Promo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Entry Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as GmbSeoType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="gmb_post">📍 GMB Post</option>
                    <option value="seo_blog">📝 SEO Blog</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Date Posted
                  </label>
                  <input
                    type="date"
                    value={datePosted}
                    onChange={(e) => setDatePosted(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Search Rank #
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={searchPosition}
                onChange={(e) => setSearchPosition(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Maps Rank #
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={mapsPosition}
                onChange={(e) => setMapsPosition(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Views Count
              </label>
              <input
                type="number"
                min="0"
                value={views}
                onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Clicks Count
              </label>
              <input
                type="number"
                min="0"
                value={clicks}
                onChange={(e) => setClicks(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {!entryToEdit && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Notes / Audit Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Added schema markup, #1 in Maps pack..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all"
            >
              {entryToEdit ? 'Save Metrics Update' : 'Log GMB/SEO Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
