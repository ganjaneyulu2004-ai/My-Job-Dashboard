import React, { useState } from 'react';
import { X, FileText, Upload, Download, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BlogImage } from '../../types';

interface ScheduleBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleBlogModal: React.FC<ScheduleBlogModalProps> = ({ isOpen, onClose }) => {
  const { clients, assignedClients, activeClientId, addBlog, user } = useApp();

  const availableClients = user?.role === 'admin' ? clients : (assignedClients.length > 0 ? assignedClients : clients);

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (activeClientId && activeClientId !== 'all' && availableClients.some(c => c.id === activeClientId)) {
      return activeClientId;
    }
    return availableClients[0]?.id || 'client-1';
  });

  const [keywordsInput, setKeywordsInput] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<BlogImage[]>([]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: BlogImage[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: reader.result as string,
          name: file.name
        });

        if (newImages.length === fileArray.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadImage = (img: BlogImage) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = img.name || `blog-image-${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordsInput.trim()) {
      alert('Please enter at least one keyword.');
      return;
    }

    const keywordArray = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const primaryKeyword = keywordArray[0] || 'SEO Blog';
    const secondaryKeywords = keywordArray.slice(1);

    addBlog({
      client_id: selectedClientId,
      primary_keyword: primaryKeyword,
      secondary_keywords: secondaryKeywords,
      content: blogContent.trim() || `# ${primaryKeyword}\n\nBlog content draft ready for publishing.`,
      images: uploadedImages
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
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Schedule New Blog</h3>
            <p className="text-slate-500 text-xs mt-0.5">Content Vault blog draft creation with image uploads & keywords.</p>
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
              Keywords (Comma-separated) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. best time tiger safari, monsoon safari timing, winter schedule"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <p className="text-[11px] text-slate-400 mt-1">First keyword = Primary Keyword (display title).</p>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Blog Content Draft
            </label>
            <textarea
              rows={4}
              placeholder="Paste or type article draft here..."
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Blog Images (Select Multiple)
            </label>
            
            <label className="border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-purple-50/30 transition-all text-center">
              <Upload className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-bold text-slate-700">Click to Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative bg-slate-900 rounded-xl p-1.5 flex items-center gap-2 border border-slate-200">
                    <img src={img.url} alt={img.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <span className="text-[11px] font-bold text-white truncate flex-1">{img.name}</span>
                    
                    {/* DIRECT DOWNLOAD BUTTON (Requirement 3) */}
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(img)}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shrink-0"
                      title="Download Image"
                    >
                      <Download className="w-3.5 h-3.5" />
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md"
            >
              Save Blog Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
