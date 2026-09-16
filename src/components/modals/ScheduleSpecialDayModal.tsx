import React, { useState } from 'react';
import { X, Sparkles, Upload, Download, Calendar, Film, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SpecialDayMedia {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
}

interface ScheduleSpecialDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleSpecialDayModal: React.FC<ScheduleSpecialDayModalProps> = ({ isOpen, onClose }) => {
  const { clients, assignedClients, activeClientId, addSpecialDay, user } = useApp();

  const availableClients = user?.role === 'admin' ? clients : (assignedClients.length > 0 ? assignedClients : clients);

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (activeClientId && activeClientId !== 'all' && availableClients.some(c => c.id === activeClientId)) {
      return activeClientId;
    }
    return availableClients[0]?.id || 'client-1';
  });

  const [occasionName, setOccasionName] = useState('');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<SpecialDayMedia[]>([]);

  if (!isOpen) return null;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMediaList: SpecialDayMedia[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      reader.onload = () => {
        newMediaList.push({
          id: `sdm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: reader.result as string,
          name: file.name,
          type: isVideo ? 'video' : 'image'
        });

        if (newMediaList.length === fileArray.length) {
          setUploadedMedia((prev) => [...prev, ...newMediaList]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadMedia = (media: SpecialDayMedia) => {
    const a = document.createElement('a');
    a.href = media.url;
    a.download = media.name || `special-day-media-${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasionName.trim()) {
      alert('Please enter an occasion name.');
      return;
    }

    const urls = uploadedMedia.map(m => m.url);

    addSpecialDay({
      client_id: selectedClientId,
      occasion_name: occasionName.trim(),
      date,
      media_urls: urls,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Schedule Special Day Content</h3>
            <p className="text-slate-500 text-xs mt-0.5">Festival, holiday, or special occasion graphics & videos.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Client Account
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none"
            >
              {availableClients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.business_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Occasion / Event Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. World Health Day Campaign, Diwali Special Video"
              value={occasionName}
              onChange={(e) => setOccasionName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Event Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Upload Images & Videos (Select Multiple)
            </label>
            
            <label className="border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-teal-50/30 transition-all text-center">
              <Upload className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-bold text-slate-700">Click to Select Media Files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>

            {uploadedMedia.length > 0 && (
              <div className="space-y-2 mt-3">
                {uploadedMedia.map((m) => (
                  <div key={m.id} className="bg-slate-900 rounded-xl p-2 flex items-center gap-3 border border-slate-200">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-teal-900 text-teal-300 flex items-center justify-center shrink-0 font-bold">
                        <Film className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{m.type}</p>
                    </div>
                    
                    {/* DIRECT DOWNLOAD BUTTON (Requirement 3) */}
                    <button
                      type="button"
                      onClick={() => handleDownloadMedia(m)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1 shrink-0 shadow-sm"
                      title="Download Media File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md"
            >
              Schedule Special Day Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
