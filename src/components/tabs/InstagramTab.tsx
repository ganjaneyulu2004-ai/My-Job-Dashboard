import React, { useState, useEffect } from 'react';
import {
  Instagram,
  CheckCircle2,
  XCircle,
  Key,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  BarChart2,
  Send,
  Sparkles,
  Lock,
  ShieldCheck,
  Edit3,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Clock,
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  Trash2,
  Upload,
  Play,
  FileImage
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InstagramConnection, ScheduledPost } from '../../types';

interface LiveInstagramInsights {
  username?: string | null;
  name?: string | null;
  profile_picture_url?: string | null;
  followers_count?: number | null;
  media_count?: number | null;
  reach?: number | null;
  impressions?: number | null;
  engagement_rate?: string | null;
  source?: string | null;
  cached_at?: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  card?: {
    followers: string;
    reach: string;
    mediaCount: string;
    engagement: string;
  };
}

export const InstagramTab: React.FC = () => {
  const {
    clients,
    assignedClients,
    user,
    activeClient,
    activeClientId,
    setActiveClientId,
    instagramConnections,
    saveInstagramConnection,
    disconnectInstagramConnection,
    supabaseConfig,
    scheduledPosts,
    addScheduledPost,
    updateScheduledPost,
    cancelScheduledPost,
    publishDueScheduledPosts
  } = useApp();

  const availableClients = user?.role === 'admin' ? clients : (assignedClients.length > 0 ? assignedClients : clients);
  const assignedClientIds = availableClients.map(c => c.id);

  // Selected client for tab scope
  const currentClientId = activeClientId === 'all' ? availableClients[0]?.id || 'client-1' : activeClientId;
  const currentClient = availableClients.find(c => c.id === currentClientId) || activeClient || availableClients[0];
  const connection: InstagramConnection | undefined = instagramConnections[currentClientId];

  // Instagram Scheduler State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduledPost, setEditingScheduledPost] = useState<ScheduledPost | null>(null);
  const [scheduleClientId, setScheduleClientId] = useState<string>('');
  const [scheduleMediaUrl, setScheduleMediaUrl] = useState('');
  const [scheduleMediaType, setScheduleMediaType] = useState<'image' | 'video'>('image');
  const [scheduleCaption, setScheduleCaption] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  // Filter scheduled posts for scoped clients
  const scopedScheduledPosts = scheduledPosts.filter(p => user?.role === 'admin' || assignedClientIds.includes(p.client_id));

  const openScheduleModal = (post?: ScheduledPost) => {
    if (post) {
      setEditingScheduledPost(post);
      setScheduleClientId(post.client_id);
      setScheduleMediaUrl(post.media_url);
      setScheduleMediaType(post.media_type || 'image');
      setScheduleCaption(post.caption);

      try {
        const dt = new Date(post.scheduled_datetime);
        setScheduleDate(dt.toISOString().slice(0, 10));
        setScheduleTime(dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch {
        setScheduleDate(new Date().toISOString().slice(0, 10));
        setScheduleTime('10:00 AM');
      }
    } else {
      setEditingScheduledPost(null);
      setScheduleClientId(currentClientId || availableClients[0]?.id || 'client-1');
      setScheduleMediaUrl('');
      setScheduleMediaType('image');
      setScheduleCaption('');
      setScheduleDate(new Date().toISOString().slice(0, 10));
      setScheduleTime('10:00 AM');
    }
    setIsScheduleModalOpen(true);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setScheduleMediaType('video');
    } else {
      setScheduleMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setScheduleMediaUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleCaption.trim()) return;

    const mediaUrlToUse = scheduleMediaUrl.trim() || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80';

    let combinedDateTime: string;
    try {
      const [year, month, day] = scheduleDate.split('-').map(Number);
      let hour = 10;
      let minute = 0;

      if (scheduleTime.includes(':')) {
        const parts = scheduleTime.replace(/(AM|PM)/i, '').trim().split(':').map(Number);
        hour = parts[0] || 10;
        minute = parts[1] || 0;
        if (/PM/i.test(scheduleTime) && hour < 12) hour += 12;
        if (/AM/i.test(scheduleTime) && hour === 12) hour = 0;
      }

      const dt = new Date(year, month - 1, day, hour, minute);
      combinedDateTime = dt.toISOString();
    } catch {
      combinedDateTime = new Date().toISOString();
    }

    if (editingScheduledPost) {
      updateScheduledPost(editingScheduledPost.id, {
        client_id: scheduleClientId,
        media_url: mediaUrlToUse,
        media_type: scheduleMediaType,
        caption: scheduleCaption.trim(),
        scheduled_datetime: combinedDateTime,
        status: 'pending',
        error_log: undefined
      });
      setScheduleNotice('✅ Scheduled post updated!');
    } else {
      await addScheduledPost({
        client_id: scheduleClientId,
        media_url: mediaUrlToUse,
        media_type: scheduleMediaType,
        caption: scheduleCaption.trim(),
        scheduled_datetime: combinedDateTime
      });
      setScheduleNotice('🚀 New Instagram post scheduled successfully!');
    }

    setIsScheduleModalOpen(false);
    setTimeout(() => setScheduleNotice(null), 4000);
  };

  // Form State
  const [isTokenFormOpen, setIsTokenFormOpen] = useState(false);
  const [accountIdInput, setAccountIdInput] = useState('');
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Live Insights Fetch State
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [retryStatusText, setRetryStatusText] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<LiveInstagramInsights | null>(null);

  // Quick Summary Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Count connected clients across the entire database
  const totalClients = clients.length;
  const connectedCount = Object.values(instagramConnections).filter(c => c.is_connected).length;

  // On client selection or reload, automatically fetch live data if connected
  useEffect(() => {
    if (!connection || !connection.is_connected) {
      setInsightsData(null);
      setInsightsError(null);
      setIsLoadingInsights(false);
      setRetryStatusText(null);
      return;
    }

    fetchLiveInstagramInsights(connection.ig_business_account_id, false);
  }, [currentClientId, connection?.is_connected, connection?.ig_business_account_id]);

  const fetchLiveInstagramInsights = async (igAccountId: string, forceRefresh: boolean = false, directToken?: string) => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    setRetryStatusText(null);

    const tokenToUse = directToken || connection?.access_token;
    const delays = [0, 2000, 5000]; // Attempt 1 (instant), Attempt 2 (wait 2s), Attempt 3 (wait 5s)
    let lastErrorMsg: string | null = null;

    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (attempt > 0) {
        const waitSec = delays[attempt] / 1000;
        setRetryStatusText(`Rate-limit prevention active. Retrying request in ${waitSec}s (Attempt ${attempt + 1}/${delays.length})...`);
        await new Promise(r => setTimeout(r, delays[attempt]));
      }

      try {
        // 1. Try Supabase Edge Function call
        const supabaseUrl = supabaseConfig?.url || 'https://xyzcompany.supabase.co';
        const functionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/instagram-insights`;

        let edgeRes: Response | null = null;
        let json: any = null;

        try {
          edgeRes = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseConfig?.key || ''}`
            },
            body: JSON.stringify({
              client_id: currentClientId,
              instagram_account_id: igAccountId,
              access_token: tokenToUse,
              force_refresh: forceRefresh
            })
          });

          if (edgeRes.ok) {
            json = await edgeRes.json();
          } else {
            const errText = await edgeRes.text();
            let parsedErr: any = null;
            try { parsedErr = JSON.parse(errText); } catch {}
            const meta = parsedErr?.meta_error;
            const fullMsg = meta
              ? `HTTP ${edgeRes.status} | Meta API Error Code ${meta.code || 'N/A'} (Subcode ${meta.error_subcode || 'N/A'}): "${meta.message || errText}" [Type: ${meta.type || 'N/A'}, Trace: ${meta.fbtrace_id || 'N/A'}]`
              : `HTTP ${edgeRes.status} ${edgeRes.statusText}: ${errText}`;
            throw new Error(fullMsg);
          }
        } catch (netErr: any) {
          if (netErr.message && netErr.message.startsWith('HTTP ')) {
            throw netErr;
          }
          // Edge function endpoint unconfigured or local dev preview mode without Deno runner
        }

        // If Edge Function responded with Meta API insights
        if (json && json.success && json.insights) {
          setInsightsData({
            username: json.insights.username,
            name: json.insights.name,
            profile_picture_url: json.insights.profile_picture_url,
            followers_count: json.insights.followers_count,
            media_count: json.insights.media_count,
            reach: json.insights.reach,
            impressions: json.insights.impressions,
            engagement_rate: json.insights.engagement_rate,
            source: json.source,
            cached_at: json.cached_at
          });
          setIsLoadingInsights(false);
          setRetryStatusText(null);
          return;
        }

        // If Edge Function returned a specific Meta API error object
        if (json && json.error) {
          const meta = json.meta_error;
          const metaDetail = meta 
            ? `HTTP ${json.http_status || 400} | Meta API Code ${meta.code || 'N/A'} (Subcode ${meta.error_subcode || 'N/A'}): "${meta.message}" [Type: ${meta.type || 'N/A'}, Trace: ${meta.fbtrace_id || 'N/A'}]`
            : json.error;
          throw new Error(metaDetail);
        }

        // 2. Direct Meta Graph API v21.0 call from client if tokenToUse is available
        if (tokenToUse) {
          const metaGraphUrl = `https://graph.facebook.com/v21.0/${igAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${tokenToUse}`;
          const metaRes = await fetch(metaGraphUrl);
          const httpCode = metaRes.status;
          const metaData = await metaRes.json();

          if (!metaRes.ok || metaData.error) {
            const err = metaData.error || {};
            const detailedMsg = `HTTP ${httpCode} | Meta API Code ${err.code || 'N/A'} (Subcode ${err.error_subcode || 'N/A'}): "${err.message || 'Unknown Meta API Error'}" [Type: ${err.type || 'N/A'}, Trace: ${err.fbtrace_id || 'N/A'}]`;
            throw new Error(detailedMsg);
          }

          setInsightsData({
            username: metaData.username ? `@${metaData.username}` : null,
            name: metaData.name || null,
            profile_picture_url: metaData.profile_picture_url || null,
            followers_count: typeof metaData.followers_count === 'number' ? metaData.followers_count : null,
            media_count: typeof metaData.media_count === 'number' ? metaData.media_count : null,
            reach: null,
            impressions: null,
            engagement_rate: null,
            source: 'direct_meta_v21'
          });
          setIsLoadingInsights(false);
          setRetryStatusText(null);
          return;
        }

        throw new Error(`HTTP 404: Edge function unconfigured and no access token available for Account ID ${igAccountId}`);

      } catch (err: any) {
        lastErrorMsg = err.message || 'Meta Graph API request failed.';
        console.warn(`[Instagram API Attempt ${attempt + 1}] Error:`, lastErrorMsg);
      }
    }

    // All retries failed — display full detailed error
    setInsightsError(lastErrorMsg || 'Meta Graph API request failed after 3 attempts.');
    setInsightsData(null);
    setIsLoadingInsights(false);
    setRetryStatusText(null);
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    const accountId = accountIdInput.trim();
    const token = accessTokenInput.trim();

    if (!accountId || !token) {
      setSaveErrorMsg("Please enter both Instagram Business Account ID and Access Token.");
      return;
    }

    setIsSavingToken(true);

    try {
      // Test the token against Meta Graph API v21.0 first to ensure validity before persisting
      const testUrl = `https://graph.facebook.com/v21.0/${accountId}?fields=id,username,followers_count&access_token=${token}`;
      const testRes = await fetch(testUrl);
      const httpCode = testRes.status;
      const testData = await testRes.json();

      if (!testRes.ok || testData.error) {
        const err = testData.error || {};
        throw new Error(`HTTP ${httpCode} | Meta API Code ${err.code || 'N/A'} (Subcode ${err.error_subcode || 'N/A'}): "${err.message || 'Validation failed'}" [Type: ${err.type || 'N/A'}, Trace: ${err.fbtrace_id || 'N/A'}]`);
      }

      // Save connection to database / AppContext local state (persisted in localStorage)
      saveInstagramConnection(currentClientId, accountId, token);

      setSaveSuccessMsg(`Token validated & saved for ${currentClient.name}! (Connected to ${testData.username ? '@' + testData.username : 'Account ' + accountId})`);
      setIsTokenFormOpen(false);
      setAccountIdInput('');
      setAccessTokenInput('');

      // Immediately fetch & display real metrics returned from Meta API
      await fetchLiveInstagramInsights(accountId, true, token);
    } catch (err: any) {
      setSaveErrorMsg(err.message || "Failed to validate Instagram credentials with Meta Graph API.");
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleSendMessage = (customPrompt?: string) => {
    const query = (customPrompt || chatInput).trim();
    if (!query) return;

    const userMsgId = Date.now().toString();
    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { id: userMsgId, sender: 'user', text: query }
    ];

    setChatMessages(newMessages);
    if (!customPrompt) setChatInput('');

    setTimeout(() => {
      const isConn = connection?.is_connected;

      let replyText = '';
      if (!isConn) {
        replyText = `${currentClient.name}'s Instagram account is currently NOT connected. Please click "Connect Instagram" above to paste your Account ID & Access Token.`;
      } else if (insightsError) {
        replyText = `Graph API Error for ${currentClient.name}: "${insightsError}". Please click "Replace Token" to re-authenticate with Meta.`;
      } else if (insightsData) {
        const username = insightsData.username || `Account ID: ${connection.ig_business_account_id}`;
        const followers = insightsData.followers_count !== null && insightsData.followers_count !== undefined
          ? insightsData.followers_count.toLocaleString()
          : 'Data unavailable';
        const media = insightsData.media_count !== null && insightsData.media_count !== undefined
          ? `${insightsData.media_count} posts`
          : 'Data unavailable';

        replyText = `${currentClient.name}'s connected Instagram account (${username}) reports ${followers} followers and ${media} published on Meta. Graph API Status: 🟢 Live & Connected.`;
      } else {
        replyText = `Fetching real Meta Graph API metrics for ${currentClient.name}... Please wait.`;
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        card: (isConn && insightsData && !insightsError)
          ? {
              followers: insightsData.followers_count !== null && insightsData.followers_count !== undefined ? insightsData.followers_count.toLocaleString() : 'Data unavailable',
              reach: insightsData.reach !== null && insightsData.reach !== undefined ? `${insightsData.reach.toLocaleString()}` : 'Data unavailable',
              mediaCount: insightsData.media_count !== null && insightsData.media_count !== undefined ? `${insightsData.media_count}` : 'Data unavailable',
              engagement: insightsData.engagement_rate || 'Data unavailable'
            }
          : undefined
      };

      setChatMessages([...newMessages, botReply]);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-rose-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">
            <Instagram className="w-4 h-4" />
            <span>Meta Graph API v21.0 Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Instagram Analytics & Insights
          </h2>
          <p className="text-rose-100 text-sm mt-1">
            Real Meta Graph API connection with 5-min rate limit protection
          </p>
        </div>

        {/* Actions & Database Summary Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => openScheduleModal()}
            className="px-4 py-3 rounded-2xl bg-white text-rose-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-rose-50 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Post</span>
          </button>

          <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-lg">
              {connectedCount}/{totalClients}
            </div>
            <div>
              <div className="text-xs font-bold text-white/90">Database Connections</div>
              <div className="text-sm font-extrabold text-white">
                {connectedCount} of {totalClients} clients connected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Selector Pill Bar if 'all' is selected */}
      {activeClientId === 'all' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Select Client:
          </span>
          {clients.map(client => {
            const isSelected = client.id === currentClientId;
            const isConn = instagramConnections[client.id]?.is_connected;
            return (
              <button
                key={client.id}
                onClick={() => setActiveClientId(client.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{client.name}</span>
                {isConn ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" title="Not Connected" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Active Client Instagram Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {insightsData?.profile_picture_url ? (
              <img
                src={insightsData.profile_picture_url}
                alt={insightsData.username || currentClient.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-rose-100 border border-rose-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                {currentClient.name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {currentClient.name}
                </h3>
                <span className="text-xs font-bold text-slate-400">({currentClient.business_type})</span>
              </div>
              
              {connection?.is_connected ? (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-600 font-bold text-xs flex items-center gap-2">
                    <span className="text-rose-600 font-extrabold">
                      {insightsData?.username || `Account ID: ${connection.ig_business_account_id}`}
                    </span>
                    <span className="text-slate-400">• Token: {connection.access_token_masked}</span>
                  </p>
                  {insightsData?.source === 'edge_cache_5min' && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1 border border-slate-200" title="Serving 5-minute rate limit cache">
                      <Clock className="w-3 h-3 text-slate-500" /> 5-Min Cache Active
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 font-medium text-xs mt-1">
                  No Instagram Business Account connected for this client.
                </p>
              )}
            </div>
          </div>

          {/* Connection Status Badge & Action Buttons */}
          <div className="flex items-center gap-3">
            {connection?.is_connected ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Connected ✅
                </span>
                <button
                  onClick={() => fetchLiveInstagramInsights(connection.ig_business_account_id, true)}
                  disabled={isLoadingInsights}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Force re-fetch from Meta API"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsights ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  onClick={() => setIsTokenFormOpen(!isTokenFormOpen)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Replace Token
                </button>
                <button
                  onClick={() => disconnectInstagramConnection(currentClientId)}
                  className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  Not Connected ❌
                </span>
                <button
                  onClick={() => setIsTokenFormOpen(true)}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Key className="w-3.5 h-3.5" /> Connect Instagram
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Success Toast */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {saveSuccessMsg}
            </span>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:underline text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Access Token Input Form Drawer */}
        {(isTokenFormOpen || !connection?.is_connected) && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-extrabold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Connect Meta Graph API Credentials for {currentClient.name}</span>
              </div>
              {connection?.is_connected && (
                <button
                  onClick={() => setIsTokenFormOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close Form
                </button>
              )}
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Paste {currentClient.name}'s Instagram Business Account ID and Meta Graph API Access Token below. Your token is validated against Meta's <code className="text-rose-300 font-mono">v21.0</code> API and stored as a secure secret (<code className="text-rose-300 font-mono">INSTAGRAM_TOKEN_{currentClientId}</code>).
            </p>

            {saveErrorMsg && (
              <div className="bg-rose-950/80 border border-rose-700 text-rose-200 p-3.5 rounded-xl text-xs font-bold space-y-1">
                <div className="flex items-center gap-2 text-rose-300 font-extrabold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Validation Error</span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed break-words">{saveErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSaveToken} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    Instagram Business Account ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1784140928123456"
                    value={accountIdInput}
                    onChange={(e) => setAccountIdInput(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-1">
                    Meta Access Token (Password Masked)
                  </label>
                  <input
                    type="password"
                    placeholder="EAAG..."
                    value={accessTokenInput}
                    onChange={(e) => setAccessTokenInput(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Credentials are strictly isolated to client ID "{currentClientId}".
                </div>
                <button
                  type="submit"
                  disabled={isSavingToken}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSavingToken ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Validating & Saving...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" /> Save & Connect Token
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. Error Visibility Box with Exact Meta API JSON Error Payload */}
        {connection?.is_connected && insightsError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Meta Graph API Exact Response Error</span>
            </div>
            
            <div className="bg-slate-900 text-rose-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed break-words shadow-inner overflow-x-auto">
              {insightsError}
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-rose-600 font-medium">
                Review Meta error code, error_subcode, and trace ID above.
              </p>
              <button
                onClick={() => setIsTokenFormOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" /> Replace Access Token
              </button>
            </div>
          </div>
        )}

        {/* 4. Loading Skeleton UI & Retry Status */}
        {connection?.is_connected && isLoadingInsights && (
          <div className="space-y-4">
            {retryStatusText && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>{retryStatusText}</span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-6 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Real Meta API Metrics Display (Zero Fake / Demo Numbers) */}
        {connection?.is_connected && !isLoadingInsights && !insightsError && insightsData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Followers Tile */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4.5 rounded-2xl border border-rose-100/80 space-y-2">
                <div className="flex items-center justify-between text-rose-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Followers</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-rose-600" />
                  </div>
                </div>
                <div>
                  {insightsData.followers_count !== null && insightsData.followers_count !== undefined ? (
                    <span className="text-2xl font-black text-slate-900">
                      {insightsData.followers_count.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-400 italic">
                      Data unavailable
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Meta Graph API followers</p>
              </div>

              {/* Media Count / Posts Tile */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4.5 rounded-2xl border border-purple-100/80 space-y-2">
                <div className="flex items-center justify-between text-purple-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Media Items</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  {insightsData.media_count !== null && insightsData.media_count !== undefined ? (
                    <span className="text-2xl font-black text-slate-900">
                      {insightsData.media_count}
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-400 italic">
                      Data unavailable
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Published content count</p>
              </div>

              {/* Reach Tile */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4.5 rounded-2xl border border-amber-100/80 space-y-2">
                <div className="flex items-center justify-between text-amber-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Reach</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div>
                  {insightsData.reach !== null && insightsData.reach !== undefined ? (
                    <span className="text-2xl font-black text-slate-900">
                      {insightsData.reach.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-400 italic">
                      Data unavailable
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Accounts reached</p>
              </div>

              {/* Engagement Tile */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4.5 rounded-2xl border border-emerald-100/80 space-y-2">
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Engagement</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div>
                  {insightsData.engagement_rate ? (
                    <span className="text-2xl font-black text-slate-900">
                      {insightsData.engagement_rate}
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-400 italic">
                      Data unavailable
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Interaction metric</p>
              </div>

            </div>
          </div>
        )}

        {/* 6. Clean "Not Connected" Card (When no connection exists) */}
        {!connection?.is_connected && !isTokenFormOpen && (
          <div className="bg-slate-50 rounded-2xl p-10 text-center border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Instagram className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">
              No Instagram Business Account Linked
            </h4>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Connect {currentClient.name}'s Meta Graph API Access Token to display real live follower counts, media posts, reach, and engagement.
            </p>
            <button
              onClick={() => setIsTokenFormOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Key className="w-4 h-4" /> Connect {currentClient.name}'s Instagram
            </button>
          </div>
        )}

      </div>

      {/* 7. Branch-Scoped Quick Summary Chat */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Ask Summary — {currentClient.name}'s Instagram
              </h3>
              <p className="text-slate-400 text-xs">
                AI Assistant scoped strictly to {currentClient.name}'s live Meta Graph API data
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            Instagram Scoped
          </span>
        </div>

        {/* Prompt Suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Prompts:</span>
          <button
            onClick={() => handleSendMessage("Summarize account growth")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs whitespace-nowrap transition-all"
          >
            💡 Summarize account growth
          </button>
          <button
            onClick={() => handleSendMessage("Show total media count")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs whitespace-nowrap transition-all"
          >
            📈 Show media count
          </button>
        </div>

        {/* Chat Output Area */}
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {chatMessages.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-4 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200">
              Ask any question about {currentClient.name}'s Instagram followers or media posts.
            </div>
          ) : (
            chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs font-medium space-y-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white font-bold rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.card && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        {currentClient.name} — Quick Metrics Card
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">Followers</div>
                          <div className="text-sm font-black text-rose-600">{msg.card.followers}</div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">Media Count</div>
                          <div className="text-sm font-black text-purple-600">{msg.card.mediaCount}</div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">Reach</div>
                          <div className="text-sm font-black text-amber-600">{msg.card.reach}</div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">Engagement</div>
                          <div className="text-sm font-black text-emerald-600">{msg.card.engagement}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask about ${currentClient.name}'s Instagram...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </div>

      {/* 8. Instagram Scheduler Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Instagram Scheduled Posts</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Auto-publishes queued image/video posts to Instagram Business accounts at their scheduled time.
              </p>
            </div>
          </div>

          <button
            onClick={() => openScheduleModal()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Schedule Post</span>
          </button>
        </div>

        {/* Schedule Notice Banner */}
        {scheduleNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl flex items-center justify-between animate-in fade-in duration-150">
            <span>{scheduleNotice}</span>
            <button onClick={() => setScheduleNotice(null)} className="text-emerald-500 hover:text-emerald-700">
              ✕
            </button>
          </div>
        )}

        {/* Scheduled Posts List Grid */}
        {scopedScheduledPosts.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-extrabold text-slate-800 text-sm">No Scheduled Posts</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "+ Schedule Post" to queue image or video posts for auto-publishing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scopedScheduledPosts.map(post => {
              const client = availableClients.find(c => c.id === post.client_id);
              const isPending = post.status === 'pending';
              const isPosted = post.status === 'posted';
              const isFailed = post.status === 'failed';
              const isErrorExpanded = expandedErrorId === post.id;

              let scheduledTimeFormatted = post.scheduled_datetime;
              try {
                scheduledTimeFormatted = new Date(post.scheduled_datetime).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch {}

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isPosted
                      ? 'bg-emerald-50/40 border-emerald-200/70'
                      : isFailed
                      ? 'bg-rose-50/40 border-rose-200/70'
                      : 'bg-white border-slate-200 shadow-xs hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Media Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                      {post.media_url ? (
                        post.media_type === 'video' ? (
                          <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center">
                            <Play className="w-6 h-6 text-rose-400" />
                          </div>
                        ) : (
                          <img src={post.media_url} alt="Media preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full text-slate-400 flex items-center justify-center">
                          <FileImage className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Post Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        {client && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white shrink-0"
                            style={{ backgroundColor: client.avatar_color }}
                          >
                            {client.name}
                          </span>
                        )}

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          isPosted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFailed
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPosted && '🟢 Posted'}
                          {isPending && '🟡 Pending'}
                          {isFailed && '🔴 Failed'}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {post.caption}
                      </p>

                      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Scheduled: {scheduledTimeFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Failed Error Log Expansion Box */}
                  {isFailed && post.error_log && (
                    <div className="pt-2 border-t border-rose-100 space-y-1">
                      <button
                        onClick={() => setExpandedErrorId(isErrorExpanded ? null : post.id)}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isErrorExpanded ? 'Hide Error Payloads' : 'View Meta API Error Payload'}</span>
                      </button>

                      {isErrorExpanded && (
                        <div className="bg-slate-900 text-rose-300 font-mono text-[10px] p-3 rounded-xl break-words leading-relaxed max-h-32 overflow-y-auto">
                          {post.error_log}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Bar for Pending Posts */}
                  {isPending && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
                      <button
                        onClick={() => openScheduleModal(post)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Cancel this scheduled post?')) {
                            cancelScheduledPost(post.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Post Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingScheduledPost ? 'Edit Scheduled Post' : '+ Schedule New Post'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Select Client */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Client Account <span className="text-rose-500">*</span>
              </label>
              <select
                value={scheduleClientId}
                onChange={(e) => setScheduleClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none"
              >
                {availableClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.business_type})</option>
                ))}
              </select>
            </div>

            {/* Media Upload */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Image or Video Upload <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-rose-600" />
                  <span>Choose Media File (Image / Video)</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>

                {scheduleMediaUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                    {scheduleMediaType === 'video' ? (
                      <video src={scheduleMediaUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={scheduleMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Post Caption <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Write your Instagram post caption here..."
                value={scheduleCaption}
                onChange={(e) => setScheduleCaption(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Scheduled Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Scheduled Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="10:00 AM"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 text-center"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20"
              >
                {editingScheduledPost ? 'Save Changes' : 'Schedule Post'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
