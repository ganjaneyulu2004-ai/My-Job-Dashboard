import React, { useState } from 'react';
import {
  BookmarkPlus,
  Plus,
  Trash2,
  Edit2,
  Bot,
  RefreshCw,
  Check,
  Send,
  X,
  FileText,
  Lightbulb,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UpcomingKeyword } from '../../types';
import { parseKeywordsFromNaturalText, ParsedKeywordsResult } from '../../utils/keywordAiParser';

export const UpcomingBlogKeywordsTab: React.FC = () => {
  const {
    upcomingKeywords,
    clients,
    assignedClients,
    activeClientId,
    user,
    addUpcomingKeyword,
    updateUpcomingKeyword,
    deleteUpcomingKeyword
  } = useApp();

  const isAdmin = user?.role === 'admin';
  const availableClients = isAdmin ? clients : (assignedClients.length > 0 ? assignedClients : clients);
  const assignedClientIds = availableClients.map(c => c.id);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>(availableClients[0]?.id || 'client-6');
  const [noteInput, setNoteInput] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // AI Chat Keyword State
  interface ChatKeywordMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    parsedResult?: ParsedKeywordsResult;
    isConfirmation?: boolean;
    candidates?: string[];
  }

  const initialAiPrompt: ChatKeywordMessage = {
    id: 'msg-init',
    sender: 'ai',
    text: "Tell me your keywords — e.g. 'This is my primary keyword: jungle safari maharashtra, and these are secondary: tiger resort booking, wildlife tour package'"
  };

  const [chatMessages, setChatMessages] = useState<ChatKeywordMessage[]>([initialAiPrompt]);
  const [chatInputText, setChatInputText] = useState('');
  const [confirmedKeywords, setConfirmedKeywords] = useState<{ primary: string; secondaries: string[] } | null>(null);

  const handleResetChatKeywords = () => {
    setChatMessages([initialAiPrompt]);
    setChatInputText('');
    setConfirmedKeywords(null);
  };

  const handleSendKeywordChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = chatInputText.trim();
    if (!clean) return;

    const userMsg: ChatKeywordMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: clean
    };

    const parsed = parseKeywordsFromNaturalText(clean);

    let aiMsg: ChatKeywordMessage;
    if (parsed.success && parsed.primaryKeyword) {
      const primary = parsed.primaryKeyword;
      const secondaries = parsed.secondaryKeywords || [];
      setConfirmedKeywords({ primary, secondaries });

      const secText = secondaries.length > 0 ? secondaries.join(', ') : 'None';
      aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: `Got it ✅ Primary: ${primary} | Secondary: ${secText}`,
        isConfirmation: true,
        parsedResult: parsed
      };
    } else if (parsed.needPrimaryClarification && parsed.candidates && parsed.candidates.length > 0) {
      aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "Which one is the primary keyword?",
        candidates: parsed.candidates
      };
    } else {
      aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "I couldn't quite extract the primary keyword. Please mention it like: 'Primary: jungle safari, Secondary: resort booking, tour package'"
      };
    }

    setChatMessages(prev => [...prev, userMsg, aiMsg]);
    setChatInputText('');
  };

  const handleSelectCandidatePill = (selectedPrimary: string, candidates: string[]) => {
    const secondaries = candidates.filter(c => c.toLowerCase() !== selectedPrimary.toLowerCase());
    setConfirmedKeywords({ primary: selectedPrimary, secondaries });

    const userMsg: ChatKeywordMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Primary: ${selectedPrimary}`
    };

    const secText = secondaries.length > 0 ? secondaries.join(', ') : 'None';
    const aiMsg: ChatKeywordMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: `Got it ✅ Primary: ${selectedPrimary} | Secondary: ${secText}`,
      isConfirmation: true
    };

    setChatMessages(prev => [...prev, userMsg, aiMsg]);
  };

  const openFormForCreate = () => {
    setEditingId(null);
    setSelectedClientId(activeClientId !== 'all' ? activeClientId : (availableClients[0]?.id || 'client-6'));
    setNoteInput('');
    handleResetChatKeywords();
    setIsFormOpen(true);
  };

  const openFormForEdit = (item: UpcomingKeyword) => {
    setEditingId(item.id);
    setSelectedClientId(item.client_id);
    setNoteInput(item.note || '');
    setConfirmedKeywords({
      primary: item.primary_keyword,
      secondaries: item.secondary_keywords
    });
    setChatMessages([
      initialAiPrompt,
      {
        id: `msg-edit`,
        sender: 'ai',
        text: `Editing planned topic ✅ Primary: ${item.primary_keyword} | Secondary: ${item.secondary_keywords.join(', ') || 'None'}`,
        isConfirmation: true
      }
    ]);
    setIsFormOpen(true);
  };

  const handleSaveUpcomingKeyword = (e: React.FormEvent) => {
    e.preventDefault();

    let finalPrimary = confirmedKeywords?.primary;
    let finalSecondaries = confirmedKeywords?.secondaries || [];

    if (!finalPrimary && chatInputText.trim()) {
      const parsed = parseKeywordsFromNaturalText(chatInputText.trim());
      if (parsed.success && parsed.primaryKeyword) {
        finalPrimary = parsed.primaryKeyword;
        finalSecondaries = parsed.secondaryKeywords || [];
      }
    }

    if (!finalPrimary) {
      alert('Please enter and confirm your keywords in the AI chat assistant box.');
      return;
    }

    if (editingId) {
      updateUpcomingKeyword(editingId, {
        client_id: selectedClientId,
        primary_keyword: finalPrimary,
        secondary_keywords: finalSecondaries,
        note: noteInput.trim() || undefined
      });
      setStatusNotice('✅ Planned blog keyword entry updated successfully!');
    } else {
      addUpcomingKeyword({
        client_id: selectedClientId,
        primary_keyword: finalPrimary,
        secondary_keywords: finalSecondaries,
        note: noteInput.trim() || undefined
      });
      setStatusNotice('✅ Planned blog keyword entry added to Upcoming Keywords!');
    }

    setIsFormOpen(false);
    setEditingId(null);
    setNoteInput('');
    handleResetChatKeywords();
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleDeleteItem = (id: string) => {
    deleteUpcomingKeyword(id);
    setDeleteConfirmId(null);
    setStatusNotice('🗑️ Planned entry removed.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Scoped upcoming keywords
  let scopedKeywords = upcomingKeywords.filter(uk => isAdmin || assignedClientIds.includes(uk.client_id));
  if (activeClientId !== 'all') {
    scopedKeywords = scopedKeywords.filter(uk => uk.client_id === activeClientId);
  }

  // Group by Client
  const keywordsByClientMap = scopedKeywords.reduce((acc, item) => {
    const cid = item.client_id;
    if (!acc[cid]) {
      acc[cid] = [];
    }
    acc[cid].push(item);
    return acc;
  }, {} as Record<string, UpcomingKeyword[]>);

  const clientGroups = Object.entries(keywordsByClientMap).map(([cid, items]) => {
    const clientObj = clients.find(c => c.id === cid);
    return {
      clientId: cid,
      clientName: clientObj ? clientObj.name : 'Unknown Client',
      clientColor: clientObj?.avatar_color || '#ec4899',
      items
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-100 text-xs font-bold uppercase tracking-widest mb-1.5">
            <BookmarkPlus className="w-4 h-4" />
            <span>Pre-Planning Keyword Store</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Upcoming Blog Keywords
          </h2>
          <p className="text-pink-100 text-sm mt-1 max-w-xl leading-relaxed">
            Internal pre-planning store for keywords reserved for blogs not yet written. Select these directly inside Content Vault when creating new drafts.
          </p>
        </div>

        <button
          onClick={openFormForCreate}
          className="px-5 py-3 rounded-2xl bg-white text-pink-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-pink-50 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Upcoming Blog</span>
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

      {/* Add / Edit Form Card */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveUpcomingKeyword}
          className="bg-white rounded-3xl p-6 border-2 border-pink-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-pink-600" />
              <span>{editingId ? 'Edit Planned Topic' : 'Add Upcoming Blog Keyword'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Client Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Client Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              >
                {availableClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.business_type})</option>
                ))}
              </select>
            </div>

            {/* 2. Optional Topic Note / Idea Field */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Optional Topic Idea / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Write about monsoon season safari packages & early bird discounts"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

          </div>

          {/* 3. AI Chat Keyword Input */}
          <div className="bg-slate-50 border border-pink-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-pink-600" />
                <span>AI Keyword Assistant (Natural Language Input)</span>
                <span className="text-rose-500">*</span>
              </label>
              {confirmedKeywords && (
                <button
                  type="button"
                  onClick={handleResetChatKeywords}
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Edit Keywords
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-3 text-xs leading-relaxed font-medium ${
                      msg.sender === 'user'
                        ? 'bg-pink-600 text-white rounded-br-none shadow-sm font-semibold'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Candidate Pills */}
                    {msg.candidates && msg.candidates.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                        {msg.candidates.map(cand => (
                          <button
                            key={cand}
                            type="button"
                            onClick={() => handleSelectCandidatePill(cand, msg.candidates!)}
                            className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-extrabold text-xs border border-pink-200 transition-colors shadow-sm cursor-pointer"
                          >
                            📍 {cand}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Field */}
            {!confirmedKeywords ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g. 'This is my primary keyword: jungle safari maharashtra, and these are secondary: tiger resort booking, wildlife tour package'"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendKeywordChatMessage();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                />
                <button
                  type="button"
                  onClick={() => handleSendKeywordChatMessage()}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shrink-0 transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Parse</span>
                </button>
              </div>
            ) : (
              /* Confirmation Echo Box */
              <div className="p-3 bg-pink-100/70 border border-pink-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="text-xs text-pink-950 font-medium">
                  <span className="font-extrabold">Got it ✅</span> Primary: <strong className="text-pink-700 font-extrabold">{confirmedKeywords.primary}</strong> | Secondary: <span className="font-semibold text-slate-700">{confirmedKeywords.secondaries.length > 0 ? confirmedKeywords.secondaries.join(', ') : 'None'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetChatKeywords}
                  className="px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-pink-700 font-bold text-xs hover:bg-pink-50 shrink-0"
                >
                  Edit Keywords
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md shadow-pink-500/20"
            >
              {editingId ? 'Update Planned Topic' : 'Save Upcoming Keyword'}
            </button>
          </div>

        </form>
      )}

      {/* List View Grouped by Client */}
      {clientGroups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
            <BookmarkPlus className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800">No Upcoming Keywords Reserved</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Reserve planned keywords and blog topic ideas here before writing drafts. They will be ready to pick when creating new Content Vault blogs.
          </p>
          <button
            onClick={openFormForCreate}
            className="px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" /> Add Planned Keywords Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {clientGroups.map(group => (
            <div key={group.clientId} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              
              {/* Client Group Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                  style={{ backgroundColor: group.clientColor }}
                >
                  {group.clientName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {group.clientName}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    {group.items.length} planned blog topic{group.items.length > 1 ? 's' : ''} reserved
                  </p>
                </div>
              </div>

              {/* Grid of Planned Entries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map(item => {
                  const isUsed = item.status === 'used';
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                        isUsed
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : 'bg-white border-pink-100 hover:border-pink-300 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header & Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1 mb-0.5">
                              <Tag className="w-3 h-3" /> Primary Keyword
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                              {item.primary_keyword}
                            </h4>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shrink-0 ${
                              isUsed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {isUsed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                            <span>{isUsed ? 'Used in Vault' : 'Not Started'}</span>
                          </span>
                        </div>

                        {/* Secondary Keywords */}
                        {item.secondary_keywords && item.secondary_keywords.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Secondary Keywords:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {item.secondary_keywords.map((sec, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                                >
                                  {sec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Note / Topic Idea */}
                        {item.note && (
                          <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2 mt-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="italic font-medium">{item.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>Added {item.created_at}</span>
                        
                        <div className="flex items-center gap-1">
                          {!isUsed && (
                            <button
                              type="button"
                              onClick={() => openFormForEdit(item)}
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                              title="Edit Topic"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <span className="text-[10px] text-rose-700 font-bold px-1">Delete?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
