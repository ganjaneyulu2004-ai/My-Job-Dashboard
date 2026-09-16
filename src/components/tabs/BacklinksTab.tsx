import React, { useState } from 'react';
import {
  Link2,
  Plus,
  Sparkles,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Save,
  CheckCircle2,
  Clock,
  Trash2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Backlink } from '../../types';

export const BacklinksTab: React.FC = () => {
  const {
    clients,
    assignedClients,
    activeClientId,
    user,
    backlinks,
    addBacklink,
    generateBacklinkBlogContent,
    updateBacklinkLiveUrl,
    deleteBacklink
  } = useApp();

  // Client scoping
  const availableClients = user?.role === 'admin' ? clients : (assignedClients.length > 0 ? assignedClients : clients);

  // Form State
  const [selectedClient, setSelectedClient] = useState<string>(() => {
    if (activeClientId && activeClientId !== 'all' && availableClients.some(c => c.id === activeClientId)) {
      return activeClientId;
    }
    return availableClients[0]?.id || '';
  });
  const [websiteName, setWebsiteName] = useState('');
  const [targetPageUrl, setTargetPageUrl] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Interactive Card State
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [liveUrlInputs, setLiveUrlInputs] = useState<Record<string, string>>({});
  const [submittingLiveId, setSubmittingLiveId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter Backlinks based on active client selector
  let filteredBacklinks = backlinks;
  if (activeClientId !== 'all') {
    filteredBacklinks = filteredBacklinks.filter(b => b.client_id === activeClientId);
  }

  // Handle Form Submit
  const handleAddBacklink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteName.trim() || !targetPageUrl.trim() || !anchorText.trim()) return;

    const clientIdToUse = selectedClient || (availableClients[0]?.id || 'client-5');

    setIsSubmittingAdd(true);
    await addBacklink({
      client_id: clientIdToUse,
      website_name: websiteName.trim(),
      target_page_url: targetPageUrl.trim(),
      anchor_text: anchorText.trim()
    });

    setWebsiteName('');
    setTargetPageUrl('');
    setAnchorText('');
    setIsSubmittingAdd(false);
  };

  // Handle AI Blog Generation
  const handleGenerateContent = async (id: string) => {
    setGeneratingId(id);
    await generateBacklinkBlogContent(id);
    setGeneratingId(null);
  };

  // Handle Copy Article Text
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Submit Live URL
  const handleSaveLiveUrl = async (id: string) => {
    const liveUrl = liveUrlInputs[id]?.trim();
    if (!liveUrl) return;

    setSubmittingLiveId(id);
    await updateBacklinkLiveUrl(id, liveUrl);
    setSubmittingLiveId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">
              <Link2 className="w-4 h-4" />
              <span>SEO Link Building Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Backlinks Workflow
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              {activeClientId === 'all'
                ? 'Managing backlink placements across all active client accounts'
                : `Managing backlink outreach for ${clients.find(c => c.id === activeClientId)?.name || 'Selected Client'}`}
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
            <div className="text-2xl font-black">
              {filteredBacklinks.filter(b => b.status === 'live').length} / {filteredBacklinks.length}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-100">Live Backlinks</div>
          </div>
        </div>
      </div>

      {/* STEP 1: Add Backlink Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Add New Backlink Placement
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Creates 1 Sheet Row + 1 Pending Task
          </span>
        </div>

        <form onSubmit={handleAddBacklink} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Client selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Client Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {availableClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.business_type})</option>
                ))}
              </select>
            </div>

            {/* Website Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Website Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HealthJournal.com"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Target Page URL */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Target Page URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="e.g. https://client.com/pediatric-care"
                value={targetPageUrl}
                onChange={(e) => setTargetPageUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Anchor Text */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Anchor Text <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pediatric Specialists"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmittingAdd}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmittingAdd ? 'Saving Backlink...' : '+ Create Backlink'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backlinks Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" /> Active Backlink Workflows
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {filteredBacklinks.length} entry{filteredBacklinks.length === 1 ? '' : 'ies'} total
          </span>
        </div>

        {filteredBacklinks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Link2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Backlinks Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Use the form above to add your first backlink entry. It will create a row in the client's Google Sheet and a pending task in Today's Work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBacklinks.map((item) => {
              const clientObj = clients.find(c => c.id === item.client_id);
              const isLive = item.status === 'live';
              const currentLiveInput = liveUrlInputs[item.id] !== undefined ? liveUrlInputs[item.id] : (item.live_url || '');

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border transition-all space-y-5 shadow-card ${
                    isLive ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-slate-200/80'
                  }`}
                >
                  {/* Top Metadata Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">
                          🌐 {item.website_name}
                        </span>

                        {clientObj && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                            {clientObj.name}
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isLive ? '🟢 Live' : '⚪ Pending'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-indigo-600">
                          <Tag className="w-3.5 h-3.5" /> Anchor: <strong className="text-slate-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{item.anchor_text}</strong>
                        </span>

                        <a
                          href={item.target_page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 underline font-medium truncate max-w-xs"
                        >
                          Target: {item.target_page_url} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>

                        <span className="text-slate-400">📅 Added: {item.date_added}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteBacklink(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 self-start sm:self-center transition-colors"
                      title="Delete backlink"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* STEP 2: Generate Blog Content Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-purple-600" /> STEP 2 — Blog Content
                        </span>
                      </div>

                      <button
                        onClick={() => handleGenerateContent(item.id)}
                        disabled={generatingId === item.id}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{generatingId === item.id ? 'Writing Article...' : (item.blog_content ? 'Re-Generate Article' : 'Generate Blog Content')}</span>
                      </button>
                    </div>

                    {item.blog_content ? (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 relative group">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Generated 400-600 Word SEO Article (with link to target page)
                          </span>

                          <button
                            onClick={() => handleCopyText(item.id, item.blog_content!)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>📋 Copy Article</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-xs font-normal text-slate-800 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto p-1 scrollbar-thin">
                          {item.blog_content}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                          Click <strong>"Generate Blog Content"</strong> above to auto-write a 400-600 word blog article with the anchor text hyperlink.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* STEP 4: Submit Live URL Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      STEP 4 — Submit Live Published URL (Updates Sheet Row & Clears Today's Task)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="url"
                        placeholder="e.g. https://healthjournal.com/posts/pediatric-care-2026"
                        value={currentLiveInput}
                        onChange={(e) => setLiveUrlInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />

                      <button
                        onClick={() => handleSaveLiveUrl(item.id)}
                        disabled={submittingLiveId === item.id || !currentLiveInput.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{submittingLiveId === item.id ? 'Saving Live URL...' : 'Save & Mark Live'}</span>
                      </button>
                    </div>

                    {isLive && item.live_url && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 pt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Published Live:</span>
                        <a
                          href={item.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-bold hover:text-emerald-900 truncate"
                        >
                          {item.live_url}
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
