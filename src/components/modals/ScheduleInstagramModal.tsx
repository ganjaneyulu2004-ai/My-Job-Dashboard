import React, { useState } from 'react';
import { X, Instagram, Upload, Download, Calendar, Clock, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ScheduleInstagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleInstagramModal: React.FC<ScheduleInstagramModalProps> = ({ isOpen, onClose }) => {
  const { clients, assignedClients, activeClientId, addScheduledPost, user } = useApp();

  const availableClients = user?.role === 'admin' ? clients : (assignedClients.length > 0 ? assignedClients : clients);

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (activeClientId && activeClientId !== 'all' && availableClients.some(c => c.id === activeClientId)) {
      return activeClientId;
    }
    return availableClients[0]?.id || 'client-1';
  });

  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00 AM');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!mediaUrl) return;
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = fileName || `instagram-media-${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      alert('Please upload an image or video file.');
      return;
    }

    setIsSubmitting(true);

    const scheduledDateTime = `${date}T${time.includes('PM') ? '18:00' : '10:00'}:00`;

    await addScheduledPost({
      client_id: selectedClientId,
      media_url: mediaUrl,
      media_type: mediaType,
      caption: caption.trim(),
      scheduled_datetime: scheduledDateTime
    });

    setIsSubmitting(false);
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Schedule Instagram Post</h3>
            <p className="text-slate-500 text-xs mt-0.5">Upload media, write caption & queue for auto-publishing.</p>
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
              Image / Video File <span className="text-rose-500">*</span>
            </label>
            {!mediaUrl ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-rose-50/30 transition-all text-center">
                <Upload className="w-6 h-6 text-rose-500" />
                <span className="text-xs font-bold text-slate-700">Click to Select Image or Video</span>
                <span className="text-[10px] text-slate-400">JPG, PNG, MP4, MOV supported</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 p-2 flex items-center gap-3">
                {mediaType === 'image' ? (
                  <img src={mediaUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl shrink-0" />
                ) : (
                  <video src={mediaUrl} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{fileName || 'Uploaded Media'}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">{mediaType}</p>
                </div>

                {/* DIRECT DOWNLOAD BUTTON (Requirement 3) */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm shrink-0"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMediaUrl(null); setFileName(''); }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Caption Text
            </label>
            <textarea
              rows={3}
              required
              placeholder="Write your post caption with hashtags..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 text-center"
              />
            </div>
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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Instagram Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
