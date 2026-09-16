import React, { useState } from 'react';
import {
  Database,
  Plus,
  Copy,
  Download,
  CheckCircle2,
  ExternalLink,
  Trash2,
  FileSpreadsheet,
  X,
  FileText,
  Image as ImageIcon,
  Send,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BlogPost, BlogImage } from '../../types';

export const ContentVaultTab: React.FC = () => {
  const { blogs, clients, assignedClients, user, addBlog, publishBlog, deleteBlog } = useApp();

  const isAdmin = user?.role === 'admin';
  const availableClients = isAdmin ? clients : (assignedClients.length > 0 ? assignedClients : clients);
  const assignedClientIds = availableClients.map(c => c.id);

  // Filter blogs by assigned clients for employee, all for admin
  const scopedBlogs = blogs.filter(b => isAdmin || assignedClientIds.includes(b.client_id));

  const draftBlogs = scopedBlogs.filter(b => b.status === 'draft');
  const publishedBlogs = scopedBlogs.filter(b => b.status === 'published');

  // Sub-tab selection: 'drafts' | 'published'
  const [activeSubTab, setActiveSubTab] = useState<'drafts' | 'published'>('drafts');

  // Add Blog Card Form state
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(availableClients[0]?.id || 'client-1');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<BlogImage[]>([]);

  // Feedback notifications
  const [copyNoticeId, setCopyNoticeId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Mark as Published Modal state
  const [publishingBlog, setPublishingBlog] = useState<BlogPost | null>(null);
  const [liveUrl, setLiveUrl] = useState('');
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmittingPublish, setIsSubmittingPublish] = useState(false);

  // Handle Image Uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: BlogImage[] = [];
    const fileArray = Array.from(files);

    let loadedCount = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          newImages.push({
            name: file.name,
            url: evt.target.result as string
          });
        }
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setUploadedImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Add Blog Submission
  const handleAddBlogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordsInput.trim() || !blogContent.trim()) return;

    // Parse Keywords: First = Primary, Rest = Secondary
    const kwList = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
    if (kwList.length === 0) return;

    const primaryKeyword = kwList[0];
    const secondaryKeywords = kwList.slice(1);

    addBlog({
      client_id: selectedClientId,
      primary_keyword: primaryKeyword,
      secondary_keywords: secondaryKeywords,
      content: blogContent.trim(),
      images: uploadedImages
    });

    // Reset Form
    setKeywordsInput('');
    setBlogContent('');
    setUploadedImages([]);
    setIsAddCardOpen(false);

    setStatusNotice('✅ Draft blog created successfully!');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Copy Plain Text Content
  const handleCopyContent = (blog: BlogPost) => {
    navigator.clipboard.writeText(blog.content);
    setCopyNoticeId(blog.id);
    setTimeout(() => setCopyNoticeId(null), 2500);
  };

  // Download Images with Keyword Filenames
  const handleDownloadImages = (blog: BlogPost) => {
    if (!blog.images || blog.images.length === 0) {
      alert('No images attached to this blog draft.');
      return;
    }

    const slug = blog.primary_keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    blog.images.forEach((img, idx) => {
      const ext = img.name.split('.').pop() || 'jpg';
      const filename = `${slug}-${idx + 1}.${ext}`;
      
      const link = document.createElement('a');
      link.href = img.url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Handle Submit Publish Modal
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingBlog || !liveUrl.trim()) return;

    setIsSubmittingPublish(true);
    const result = await publishBlog(publishingBlog.id, liveUrl.trim(), publishedDate);
    setIsSubmittingPublish(false);

    setPublishingBlog(null);
    setLiveUrl('');
    
    if (result.message) {
      setStatusNotice(result.message);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  // Export Published Table to Excel/CSV
  const handleExportToExcel = () => {
    if (publishedBlogs.length === 0) {
      alert('No published blogs available to export.');
      return;
    }

    let csvContent = 'Client,Primary Keyword,Secondary Keywords,Live URL,Published Date\n';

    publishedBlogs.forEach(b => {
      const client = clients.find(c => c.id === b.client_id);
      const clientName = client ? `"${client.name.replace(/"/g, '""')}"` : `"${b.client_id}"`;
      const primaryKw = `"${b.primary_keyword.replace(/"/g, '""')}"`;
      const secKws = `"${b.secondary_keywords.join(', ').replace(/"/g, '""')}"`;
      const url = `"${(b.live_url || '').replace(/"/g, '""')}"`;
      const pDate = `"${b.published_date || b.created_at}"`;

      csvContent += `${clientName},${primaryKw},${secKws},${url},${pDate}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `published_blogs_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Database className="w-4 h-4" />
            <span>SEO Content & Blog Repository</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Content Vault
          </h2>
          <p className="text-purple-100 text-sm mt-1 max-w-xl leading-relaxed">
            Manage blog drafts, copy clean WordPress text, download images with keyword filenames, and publish directly with Google Sheets sync.
          </p>
        </div>

        <button
          onClick={() => setIsAddCardOpen(!isAddCardOpen)}
          className="px-5 py-3 rounded-2xl bg-white text-purple-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-purple-50 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAddCardOpen ? 'Close Form' : '+ Add New Blog'}</span>
        </button>
      </div>

      {/* Global Status Notice Toast */}
      {statusNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl flex items-center justify-between animate-in fade-in duration-150">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add New Blog Simple Input Card */}
      {isAddCardOpen && (
        <form
          onSubmit={handleAddBlogSubmit}
          className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" /> Add New Blog Draft
            </h3>
            <button
              type="button"
              onClick={() => setIsAddCardOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Select Client */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Client Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                {availableClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.business_type})</option>
                ))}
              </select>
            </div>

            {/* 2. Keywords input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Keywords (Comma Separated) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. best time tiger safari, monsoon safari timing, winter safari schedule"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                📌 Note: First keyword = <strong>Primary Keyword (Title)</strong>. Rest = Secondary Keywords.
              </p>
            </div>

          </div>

          {/* 3. Blog Content Paste Box */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Blog Content Paste Box <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              placeholder="Paste clean blog content text here with headings preserved..."
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-mono leading-relaxed"
            />
          </div>

          {/* 4. Multiple Images Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Blog Images (Multiple Files)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>Select Multiple Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {uploadedImages.length > 0 && (
                <span className="text-xs font-bold text-slate-600">
                  {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} attached
                </span>
              )}
            </div>

            {/* Uploaded Images Thumbnails with Direct Download Button */}
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-900">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = img.url;
                          a.download = img.name || `blog-image-${idx + 1}`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-all"
                        title="Download Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                        className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-all"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCardOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20"
            >
              Save Blog Draft
            </button>
          </div>

        </form>
      )}

      {/* Two Separate Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('drafts')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeSubTab === 'drafts'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📝 Drafts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSubTab === 'drafts' ? 'bg-white text-purple-900' : 'bg-slate-200 text-slate-700'
            }`}>
              {draftBlogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('published')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeSubTab === 'published'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>🚀 Published</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSubTab === 'published' ? 'bg-white text-emerald-900' : 'bg-slate-200 text-slate-700'
            }`}>
              {publishedBlogs.length}
            </span>
          </button>
        </div>

        {/* Export to Excel Button in Published Sub-Tab */}
        {activeSubTab === 'published' && (
          <button
            onClick={handleExportToExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        )}
      </div>

      {/* DRAFTS SECTION */}
      {activeSubTab === 'drafts' && (
        <div className="space-y-4">
          {draftBlogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">No Draft Blogs Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "+ Add New Blog" to create your first blog draft.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {draftBlogs.map(blog => {
                const client = clients.find(c => c.id === blog.client_id);
                const isCopied = copyNoticeId === blog.id;

                return (
                  <div
                    key={blog.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-card space-y-3"
                  >
                    {/* Draft Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        {client && (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                            style={{ backgroundColor: client.avatar_color }}
                          >
                            {client.name}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">
                          Draft
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400">
                        Created: {blog.created_at}
                      </span>
                    </div>

                    {/* Primary Keyword (Title) & Secondary Keywords */}
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 capitalize leading-snug">
                        {blog.primary_keyword}
                      </h3>

                      {blog.secondary_keywords && blog.secondary_keywords.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
                          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-400">Secondary:</span>
                          <span className="text-slate-600">{blog.secondary_keywords.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Content Snippet */}
                    <div className="bg-slate-50 rounded-2xl p-3 text-xs text-slate-600 font-mono leading-relaxed max-h-24 overflow-y-auto">
                      {blog.content}
                    </div>

                    {/* Images Count badge */}
                    {blog.images && blog.images.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        <span>{blog.images.length} attached image{blog.images.length > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Copy Content Button */}
                        <button
                          onClick={() => handleCopyContent(blog)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>{isCopied ? 'Copied!' : 'Copy Content'}</span>
                        </button>

                        {/* Download Images Button */}
                        <button
                          onClick={() => handleDownloadImages(blog)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Images ({blog.images?.length || 0})</span>
                        </button>

                      </div>

                      <div className="flex items-center gap-2">
                        {/* Mark as Published Button */}
                        <button
                          onClick={() => {
                            setPublishingBlog(blog);
                            setLiveUrl('');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Mark as Published</span>
                        </button>

                        {/* Delete Draft Button */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete draft "${blog.primary_keyword}"?`)) {
                              deleteBlog(blog.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED SECTION */}
      {activeSubTab === 'published' && (
        <div className="space-y-4">
          {publishedBlogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">No Published Blogs Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Draft blogs marked as published will appear here in a clean table format.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="p-4">Client</th>
                      <th className="p-4">Primary Keyword (Title)</th>
                      <th className="p-4">Secondary Keywords</th>
                      <th className="p-4">Live URL</th>
                      <th className="p-4">Published Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                    {publishedBlogs.map(blog => {
                      const client = clients.find(c => c.id === blog.client_id);

                      return (
                        <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Client */}
                          <td className="p-4 whitespace-nowrap">
                            {client ? (
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                                style={{ backgroundColor: client.avatar_color }}
                              >
                                {client.name}
                              </span>
                            ) : (
                              <span className="text-slate-400">{blog.client_id}</span>
                            )}
                          </td>

                          {/* Primary Keyword */}
                          <td className="p-4 font-extrabold text-slate-900 capitalize">
                            {blog.primary_keyword}
                          </td>

                          {/* Secondary Keywords */}
                          <td className="p-4 text-slate-600 max-w-xs truncate">
                            {blog.secondary_keywords && blog.secondary_keywords.length > 0
                              ? blog.secondary_keywords.join(', ')
                              : '—'}
                          </td>

                          {/* Live URL */}
                          <td className="p-4">
                            {blog.live_url ? (
                              <a
                                href={blog.live_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 hover:text-purple-800 underline font-bold inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[180px]">{blog.live_url}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>

                          {/* Published Date */}
                          <td className="p-4 whitespace-nowrap text-slate-500">
                            {blog.published_date || blog.created_at}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                if (confirm(`Delete published blog record "${blog.primary_keyword}"?`)) {
                                  deleteBlog(blog.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MARK AS PUBLISHED MODAL */}
      {publishingBlog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handlePublishSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-lg text-slate-900">Mark as Published</h3>
              </div>
              <button
                type="button"
                onClick={() => setPublishingBlog(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Primary Keyword (Blog Title)
              </span>
              <p className="text-sm font-extrabold text-slate-900 capitalize">
                {publishingBlog.primary_keyword}
              </p>
            </div>

            {/* Live URL */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Live Published URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://clientdomain.com/blog/article-slug"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Published Date */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Published Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Note on Google Sheets Sync */}
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              ℹ️ On save, this blog moves from Drafts to Published and syncs 1 row to the client's Google Sheets tab.
            </p>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishingBlog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPublish}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmittingPublish ? 'Syncing...' : 'Save & Sync to Sheets'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default ContentVaultTab;
