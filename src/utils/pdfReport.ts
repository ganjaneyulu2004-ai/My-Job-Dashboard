import jsPDF from 'jspdf';
import { Task, Client, GmbSeoEntry } from '../types';
import { sanitizePhoneNumber } from './whatsapp';

/**
 * Creates in-memory jsPDF Document for the Full Day Multi-Client Report
 */
export function buildFullDayPDFDocument(
  clients: Client[],
  todayStr: string,
  formattedDate: string,
  allTasks: Task[],
  allGmbSeoEntries: GmbSeoEntry[]
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const todayTasks = allTasks.filter(t => t.date === todayStr);
  const todayEntries = allGmbSeoEntries.filter(e => e.date_posted === todayStr);

  const doneTasksCount = todayTasks.filter(t => t.status === 'done').length;
  const pendingTasksCount = todayTasks.filter(t => t.status === 'pending').length;
  const totalTasksCount = todayTasks.length;

  // Colors
  const darkSlate = [15, 23, 42]; // #0f172a
  const bgLight = [248, 250, 252];

  // Header Banner
  doc.setFillColor(30, 41, 59); // Dark slate header
  doc.rect(0, 0, 210, 32, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Antic AI - Full Day Work Report', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`AI Automations & Marketing Report • ${formattedDate}`, 14, 26);

  // Agency branding right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 211, 102);
  doc.text('ANTIC AI AGENCY', 150, 18);

  let yPos = 40;

  // Top Summary KPI Strip across ALL clients
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(14, yPos, 182, 22, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 182, 22, 3, 3, 'D');

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${totalTasksCount}`, 25, yPos + 12);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL TASKS TODAY', 25, yPos + 17);

  // Completed
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`${doneTasksCount}`, 85, yPos + 12);
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text('COMPLETED', 85, yPos + 17);

  // Pending
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11); // amber
  doc.text(`${pendingTasksCount}`, 145, yPos + 12);
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('PENDING', 145, yPos + 17);

  yPos += 30;

  // Filter clients to only those with tasks or GMB/SEO entries today
  const activeClients = clients.filter(client => {
    const cTasks = todayTasks.filter(t => t.client_id === client.id);
    const cEntries = todayEntries.filter(e => e.client_id === client.id);
    return cTasks.length > 0 || cEntries.length > 0;
  });

  if (activeClients.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text('No client deliverables or tasks recorded for today.', 14, yPos);
  } else {
    activeClients.forEach((client) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      const clientTasks = todayTasks.filter(t => t.client_id === client.id);
      const clientDone = clientTasks.filter(t => t.status === 'done');
      const clientPending = clientTasks.filter(t => t.status === 'pending');
      const clientEntries = todayEntries.filter(e => e.client_id === client.id);

      // Convert client avatar color hex to RGB
      const r = parseInt(client.avatar_color.slice(1, 3), 16) || 13;
      const g = parseInt(client.avatar_color.slice(3, 5), 16) || 148;
      const b = parseInt(client.avatar_color.slice(5, 7), 16) || 136;

      // Client Section Header Banner
      doc.setFillColor(r, g, b);
      doc.roundedRect(14, yPos, 182, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${client.name} (${client.business_type})`, 18, yPos + 7);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Done: ${clientDone.length} | Pending: ${clientPending.length}`, 155, yPos + 7);

      yPos += 15;

      // Completed Tasks Sub-section
      if (clientDone.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(16, 185, 129);
        doc.text('Completed Tasks:', 18, yPos);
        yPos += 6;

        clientDone.forEach((task) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(240, 253, 244);
          doc.roundedRect(18, yPos - 4, 178, 9, 2, 2, 'F');

          doc.setFillColor(16, 185, 129);
          doc.circle(23, yPos, 1.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(task.title, 28, yPos + 1.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`⏰ ${task.time}  [${task.work_type}]`, 150, yPos + 1.5);

          yPos += 11;
        });
      }

      // Pending Tasks Sub-section
      if (clientPending.length > 0) {
        if (yPos > 265) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(245, 158, 11);
        doc.text('Pending Tasks:', 18, yPos);
        yPos += 6;

        clientPending.forEach((task) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(254, 243, 199);
          doc.roundedRect(18, yPos - 4, 178, 9, 2, 2, 'F');

          doc.setFillColor(245, 158, 11);
          doc.circle(23, yPos, 1.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(task.title, 28, yPos + 1.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`⏰ ${task.time}  [${task.work_type}]`, 150, yPos + 1.5);

          yPos += 11;
        });
      }

      // GMB / SEO Posts Sub-section
      if (clientEntries.length > 0) {
        if (yPos > 265) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(124, 58, 237);
        doc.text('Logged GMB / SEO Posts Today:', 18, yPos);
        yPos += 6;

        clientEntries.forEach((entry) => {
          if (yPos > 265) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFillColor(243, 232, 255);
          doc.roundedRect(18, yPos - 4, 178, 9, 2, 2, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(`[${entry.type === 'gmb_post' ? 'GMB' : 'SEO'}] ${entry.title}`, 24, yPos + 1.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`Rank: #${entry.search_position} | Views: ${entry.views}`, 145, yPos + 1.5);

          yPos += 11;
        });
      }

      yPos += 8;
    });
  }

  // Footer Page Numbering
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Antic AI Executive Full Day Work Report • Page ${i} of ${totalPages}`, 14, 287);
  }

  return doc;
}

export async function shareOrDownloadFullDayReport(
  clients: Client[],
  todayStr: string,
  formattedDate: string,
  allTasks: Task[],
  allGmbSeoEntries: GmbSeoEntry[],
  subashPhone: string
): Promise<{ sharedNative: boolean; fallbackUsed: boolean; filename: string }> {
  const doc = buildFullDayPDFDocument(clients, todayStr, formattedDate, allTasks, allGmbSeoEntries);
  const filename = `Antic_AI_Full_Day_Report_${todayStr}.pdf`;

  // Generate in-memory PDF blob and File object
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  // Web Share API check for native file sharing
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        title: 'Full Day Work Report',
        text: `Full day work report — ${formattedDate}.`,
        files: [pdfFile]
      });
      return { sharedNative: true, fallbackUsed: false, filename };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User closed share sheet, return silently
        return { sharedNative: true, fallbackUsed: false, filename };
      }
      // If error occurs in native share, proceed to fallback
    }
  }

  // FALLBACK FLOW (e.g. desktop browsers without file share support)
  // 1. Download PDF to device
  doc.save(filename);

  // 2. Open wa.me chat link
  const cleanPhone = sanitizePhoneNumber(subashPhone);
  const messageText = `Hi Subash Sir,\n\nFull day work report — ${formattedDate}.\n\nThe detailed multi-client PDF report (*${filename}*) has been downloaded to my device. Please attach it to this chat.`;
  const encodedMsg = encodeURIComponent(messageText);

  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
  window.open(waUrl, '_blank');

  return { sharedNative: false, fallbackUsed: true, filename };
}
