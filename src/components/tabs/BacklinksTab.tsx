import React, { useState, useRef } from 'react';
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
  Tag,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Download,
  Code,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Backlink } from '../../types';
import { validateAnchorText, copyArticleToClipboard } from '../../utils/backlinkUtils';

interface ParsedBacklinkRow {
  rowNum: number;
  clientAccountRaw: string;
  matchedClientId?: string;
  matchedClientName?: string;
  websiteName: string;
  targetPageUrl: string;
  anchorText: string;
  status: 'valid' | 'client_not_found' | 'missing_field';
  errorMessage?: string;
  typoWarning?: string;
}

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Excel Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedBacklinkRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Interactive Card State
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [liveUrlInputs, setLiveUrlInputs] = useState<Record<string, string>>({});
  const [submittingLiveId, setSubmittingLiveId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'rich' | 'code'>>({});
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // Anchor text validation
  const anchorValidation = validateAnchorText(anchorText);

  // Filter Backlinks based on active client selector
  let filteredBacklinks = backlinks;
  if (activeClientId !== 'all') {
    filteredBacklinks = filteredBacklinks.filter(b => b.client_id === activeClientId);
  }

  // Handle Single Form Submit
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

  // Handle Excel File Selection & Parsing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!rawData || rawData.length === 0) {
          alert('The selected Excel file appears to be empty.');
          return;
        }

        // Find header row (search top 5 rows for column names)
        let headerRowIdx = -1;
        let colIndices = { client: -1, website: -1, target: -1, anchor: -1 };

        for (let r = 0; r < Math.min(5, rawData.length); r++) {
          const row = rawData[r] || [];
          row.forEach((cell: any, cIdx: number) => {
            const str = String(cell || '').trim().toLowerCase();
            if (str.includes('client')) colIndices.client = cIdx;
            if (str.includes('website')) colIndices.website = cIdx;
            if (str.includes('target') || str.includes('url')) colIndices.target = cIdx;
            if (str.includes('anchor')) colIndices.anchor = cIdx;
          });

          if (colIndices.client !== -1 && colIndices.website !== -1) {
            headerRowIdx = r;
            break;
          }
        }

        // Fallback column positions if not found by header text
        if (headerRowIdx === -1) {
          headerRowIdx = 1; // Default row 2 as headers
          colIndices = { client: 0, website: 1, target: 2, anchor: 3 };
        }

        const parsed: ParsedBacklinkRow[] = [];

        // Read data starting after header row
        for (let r = headerRowIdx + 1; r < rawData.length; r++) {
          const row = rawData[r] || [];
          const clientAccountRaw = String(row[colIndices.client] !== undefined ? row[colIndices.client] : '').trim();
          const websiteNameVal = String(row[colIndices.website] !== undefined ? row[colIndices.website] : '').trim();
          const targetPageUrlVal = String(row[colIndices.target] !== undefined ? row[colIndices.target] : '').trim();
          const anchorTextVal = String(row[colIndices.anchor] !== undefined ? row[colIndices.anchor] : '').trim();

          // Skip empty rows or rows where Client Account contains "EXAMPLE"
          if (!clientAccountRaw && !websiteNameVal && !targetPageUrlVal && !anchorTextVal) continue;
          if (clientAccountRaw.toUpperCase().includes('EXAMPLE')) continue;

          // Validation check for missing fields
          if (!clientAccountRaw || !websiteNameVal || !targetPageUrlVal || !anchorTextVal) {
            parsed.push({
              rowNum: r + 1,
              clientAccountRaw: clientAccountRaw || '(Missing)',
              websiteName: websiteNameVal || '(Missing)',
              targetPageUrl: targetPageUrlVal || '(Missing)',
              anchorText: anchorTextVal || '(Missing)',
              status: 'missing_field',
              errorMessage: '⚠️ Missing required field(s)'
            });
            continue;
          }

          // Match client against availableClients / clients case-insensitively
          const matched = availableClients.find(c =>
            c.name.toLowerCase() === clientAccountRaw.toLowerCase() ||
            c.id.toLowerCase() === clientAccountRaw.toLowerCase() ||
            c.name.toLowerCase().includes(clientAccountRaw.toLowerCase()) ||
            clientAccountRaw.toLowerCase().includes(c.name.toLowerCase())
          );

          const typoCheck = validateAnchorText(anchorTextVal);

          if (!matched) {
            parsed.push({
              rowNum: r + 1,
              clientAccountRaw,
              websiteName: websiteNameVal,
              targetPageUrl: targetPageUrlVal,
              anchorText: anchorTextVal,
              status: 'client_not_found',
              errorMessage: `⚠️ Client not found ("${clientAccountRaw}")`,
              typoWarning: typoCheck.warningMessage
            });
          } else {
            parsed.push({
              rowNum: r + 1,
              clientAccountRaw,
              matchedClientId: matched.id,
              matchedClientName: matched.name,
              websiteName: websiteNameVal,
              targetPageUrl: targetPageUrlVal,
              anchorText: anchorTextVal,
              status: 'valid',
              typoWarning: typoCheck.warningMessage
            });
          }
        }

        setPreviewRows(parsed);
        setIsPreviewModalOpen(true);
      } catch (err) {
        console.error(err);
        alert('Failed to parse Excel file. Please ensure it is a valid .xlsx file.');
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input value so same file can be re-selected if needed
    if (e.target) e.target.value = '';
  };

  // Confirm Import Action
  const handleConfirmImport = async () => {
    const validRows = previewRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) return;

    setIsImporting(true);

    for (const row of validRows) {
      await addBacklink({
        client_id: row.matchedClientId!,
        website_name: row.websiteName,
        target_page_url: row.targetPageUrl,
        anchor_text: row.anchorText
      });
    }

    setIsImporting(false);
    setIsPreviewModalOpen(false);
    setImportSuccessMessage(`🎉 ${validRows.length} backlinks imported successfully! Created sheet rows & Today's Work tasks.`);
    setTimeout(() => setImportSuccessMessage(null), 5000);
  };

  // Generate Sample Excel Template for User Testing
  const handleDownloadSampleTemplate = () => {
    const wsData = [
      ['INSTRUCTIONS: Row 1 is legend. Row 2 is column header. Data starts Row 3. Rows with "EXAMPLE" in Client Account are skipped.'],
      ['Client Account', 'Website Name', 'Target Page URL', 'Anchor Text'],
      ['EXAMPLE - SmileCare Dental', 'DemoSite.com', 'https://example.com', 'Example Anchor'],
      ['Raos Group Schools', 'EducationNewsToday.org', 'https://raosschools.edu/admissions', 'Top Schools Admissions 2026'],
      ['Avani Tiger Resorts', 'TravelVibeMagazine.com', 'https://avanitigerresorts.com/safari-packages', 'first time booking safari'],
      ['Ved Children Clinic', 'ParentingHealthPortal.com', 'https://vedchildrenclinic.com/pediatrics', 'Pediatric Care Specialists']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Backlinks_Import');
    XLSX.writeFile(wb, 'Backlinks_Import_Template.xlsx');
  };

  // AI Blog Generation & Copying Handlers
  const handleGenerateContent = async (id: string) => {
    setGeneratingId(id);
    await generateBacklinkBlogContent(id);
    setGeneratingId(null);
  };

  const handleCopyText = async (id: string, htmlContent: string) => {
    await copyArticleToClipboard(htmlContent);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveLiveUrl = async (id: string) => {
    const liveUrl = liveUrlInputs[id]?.trim();
    if (!liveUrl) return;

    setSubmittingLiveId(id);
    await updateBacklinkLiveUrl(id, liveUrl);
    setSubmittingLiveId(null);
  };

  const validCount = previewRows.filter(r => r.status === 'valid').length;
  const errorCount = previewRows.filter(r => r.status !== 'valid').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx, .xls, .csv"
        onChange={handleFileSelect}
        className="hidden"
      />

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

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>📤 Upload Excel</span>
            </button>

            <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <div className="text-2xl font-black">
                {filteredBacklinks.filter(b => b.status === 'live' || b.status === 'completed' || Boolean(b.live_url)).length} / {filteredBacklinks.length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Live / Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm font-bold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{importSuccessMessage}</span>
          </div>
          <button onClick={() => setImportSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1: Add Backlink Form + Excel Import Action */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              Add New Backlink Placement
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSampleTemplate}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample Template</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Upload Excel</span>
            </button>
          </div>
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
                className={`w-full bg-slate-50 border rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                  anchorValidation.hasWarning ? 'border-amber-300 focus:ring-amber-500/30 bg-amber-50/20' : 'border-slate-200 focus:ring-indigo-500/30'
                }`}
              />
              {anchorValidation.hasWarning && (
                <div className="p-2.5 mt-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{anchorValidation.warningMessage}</span>
                  </div>
                  {anchorValidation.suggestedAnchor && (
                    <button
                      type="button"
                      onClick={() => setAnchorText(anchorValidation.suggestedAnchor!)}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-[10px] transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      ✨ Auto-Fix Spelling
                    </button>
                  )}
                </div>
              )}
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

      {/* EXCEL IMPORT PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  📊
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Excel Import Preview
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {previewRows.length} rows found — <span className="text-emerald-600 font-bold">{validCount} valid</span>, <span className="text-rose-600 font-bold">{errorCount} with errors</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error summary alert if any */}
            {errorCount > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-800 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {errorCount} row{errorCount === 1 ? '' : 's'} contain error(s) and will be skipped during import. Valid rows can still be imported.
                </span>
              </div>
            )}

            {/* Table Preview Container */}
            <div className="my-4 flex-1 overflow-y-auto border border-slate-200 rounded-2xl scrollbar-thin">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-extrabold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Client Account</th>
                    <th className="px-4 py-3">Website Name</th>
                    <th className="px-4 py-3">Target Page URL</th>
                    <th className="px-4 py-3">Anchor Text</th>
                    <th className="px-4 py-3 text-right">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {previewRows.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={row.status === 'valid' ? 'hover:bg-slate-50/80' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                    >
                      <td className="px-4 py-3 font-bold text-slate-400">Row {row.rowNum}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {row.clientAccountRaw}
                        {row.matchedClientName && (
                          <span className="block text-[10px] text-emerald-600 font-bold">
                            ✓ Matched: {row.matchedClientName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{row.websiteName}</td>
                      <td className="px-4 py-3 text-indigo-600 truncate max-w-xs">{row.targetPageUrl}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">
                        {row.anchorText}
                        {row.typoWarning && (
                          <span className="block text-[10px] text-amber-700 font-bold">
                            {row.typoWarning}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✅ Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200" title={row.errorMessage}>
                            {row.errorMessage}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || validCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isImporting ? 'Importing Backlinks...' : `Confirm Import (${validCount} Valid)`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

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
              Use the form or <strong>"Upload Excel"</strong> button above to add backlink entries. Each entry creates a row in the client's Google Sheet and a pending task in Today's Work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBacklinks.map((item) => {
              const clientObj = clients.find(c => c.id === item.client_id);
              const isCompleted = item.status === 'completed' || item.status === 'live' || Boolean(item.live_url);
              const currentLiveInput = liveUrlInputs[item.id] !== undefined ? liveUrlInputs[item.id] : (item.live_url || '');
              const viewMode = viewModes[item.id] || 'rich';
              const isArticleExpanded = expandedArticleId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border transition-all space-y-5 shadow-card ${
                    isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200/80'
                  }`}
                >
                  {/* Top Metadata Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const webHref = item.website_name.startsWith('http://') || item.website_name.startsWith('https://')
                            ? item.website_name
                            : `https://${item.website_name}`;
                          return (
                            <a
                              href={webHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-extrabold text-base text-blue-600 hover:text-blue-800 underline flex items-center gap-1.5"
                            >
                              🌐 {item.website_name} <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                            </a>
                          );
                        })()}

                        {clientObj && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                            {clientObj.name}
                          </span>
                        )}

                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isCompleted ? '🟢 Completed' : '⚪ Pending'}
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
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-bold truncate max-w-xs"
                        >
                          Target: {item.target_page_url} <ExternalLink className="w-3 h-3 shrink-0 text-blue-500" />
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

                  {/* COMPLETED CARD VIEW SUMMARY */}
                  {isCompleted ? (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-sm text-emerald-950">
                              Backlink Placement Completed
                            </h4>
                            <span className="text-[11px] font-bold text-emerald-700">
                              📅 Date Live: {item.date_live || (item.completed_at ? item.completed_at.slice(0, 10) : item.date_added)}
                            </span>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow-xs">
                          ✅ Completed
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-emerald-200/80 text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-500 shrink-0">Live URL:</span>
                          <a
                            href={item.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-extrabold text-blue-600 hover:text-blue-800 underline truncate flex items-center gap-1"
                          >
                            {item.live_url} <ExternalLink className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                          </a>
                        </div>

                        {item.blog_content && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(item.id, item.blog_content!)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                                <span>📋 Copy Article</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Collapsible View Article Toggle */}
                      {item.blog_content && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedArticleId(isArticleExpanded ? null : item.id)}
                              className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                            >
                              {isArticleExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 text-emerald-600" />
                                  <span>Hide Article Content</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 text-emerald-600" />
                                  <span>📄 View Article Content</span>
                                </>
                              )}
                            </button>

                            {isArticleExpanded && (
                              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                                <button
                                  type="button"
                                  onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'rich' }))}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                    viewMode === 'rich' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <Eye className="w-3 h-3" /> Formatted
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'code' }))}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                    viewMode === 'code' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  <Code className="w-3 h-3" /> HTML Code
                                </button>
                              </div>
                            )}
                          </div>

                          {isArticleExpanded && (
                            viewMode === 'rich' ? (
                              <div
                                className="text-xs text-slate-800 leading-relaxed max-h-64 overflow-y-auto p-4 bg-white rounded-xl border border-emerald-200/80 scrollbar-thin space-y-3 animate-in fade-in duration-150 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:tracking-tight [&_h3]:text-xs [&_h3]:font-extrabold [&_h3]:text-slate-800 [&_h3]:mt-2 [&_p]:text-xs [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-xs [&_li]:text-slate-700 [&_a]:text-blue-600 [&_a]:font-extrabold [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: item.blog_content }}
                              />
                            ) : (
                              <div className="text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 scrollbar-thin animate-in fade-in duration-150">
                                {item.blog_content}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* PENDING WORKFLOW STEPS (Step 2 & Step 4) */}
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
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  SEO Guest Post Article (Single Hyperlink + Structured Formatting)
                                </span>

                                {/* Mode toggle */}
                                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'rich' }))}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                      viewMode === 'rich' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    <Eye className="w-3 h-3" /> Formatted
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setViewModes(prev => ({ ...prev, [item.id]: 'code' }))}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                      viewMode === 'code' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    <Code className="w-3 h-3" /> HTML Code
                                  </button>
                                </div>
                              </div>

                              <button
                                onClick={() => handleCopyText(item.id, item.blog_content!)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">Copied Hyperlink & Formatting!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>📋 Copy Article</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {viewMode === 'rich' ? (
                              <div
                                className="text-xs text-slate-800 leading-relaxed max-h-64 overflow-y-auto p-4 bg-white rounded-xl border border-slate-200/80 scrollbar-thin space-y-3 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:tracking-tight [&_h3]:text-xs [&_h3]:font-extrabold [&_h3]:text-slate-800 [&_h3]:mt-2 [&_p]:text-xs [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-xs [&_li]:text-slate-700 [&_a]:text-blue-600 [&_a]:font-extrabold [&_a]:underline"
                                dangerouslySetInnerHTML={{ __html: item.blog_content! }}
                              />
                            ) : (
                              <div className="text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 scrollbar-thin">
                                {item.blog_content}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center">
                            <p className="text-xs text-slate-400 font-medium">
                              Click <strong>"Generate Blog Content"</strong> above to auto-write a structured blog article with the anchor text hyperlink.
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
                      </div>
                    </>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
