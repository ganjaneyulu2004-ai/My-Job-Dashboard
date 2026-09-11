import React, { useEffect, useState } from 'react';
import { Bell, Send, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shareOrDownloadFullDayReport } from '../../utils/pdfReport';
import { sanitizePhoneNumber } from '../../utils/whatsapp';

export const DailyReminderBanner: React.FC = () => {
  const {
    clients,
    tasks,
    gmbSeoEntries,
    subashGlobalPhone,
    reportSentAtToday,
    markReportSentToday
  } = useApp();

  const [is6PM, setIs6PM] = useState(false);
  const [notificationFired, setNotificationFired] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Check 6:00 PM local time condition periodically
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // 6:00 PM is hour 18 (18:00 to 23:59)
      const isPast6PM = currentHour >= 18;
      setIs6PM(isPast6PM);

      // Web Notification API trigger around 6 PM if report not sent yet
      // Phase 2 Note: In-app browser notifications fire while tab is open around 6 PM.
      // True background mobile push (browser closed) requires a backend scheduled worker + WebPush service.
      if (isPast6PM && !reportSentAtToday && !notificationFired) {
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Antic AI End-of-Day Reminder', {
              body: "🕕 Time to send today's work report to Subash Sir.",
              icon: '/antic-logo.png'
            });
            setNotificationFired(true);
          } catch (e) {
            console.error('Notification error:', e);
          }
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [reportSentAtToday, notificationFired]);

  const handleSendFromBanner = () => {
    const pdfFilename = generateFullDayPDFReport(clients, todayStr, formattedToday, tasks, gmbSeoEntries);
    const cleanPhone = sanitizePhoneNumber(subashGlobalPhone);
    const messageText = `Hi Subash Sir,\n\nFull day work report — ${formattedToday}.\n\nThe detailed multi-client PDF report (*${pdfFilename}*) has been downloaded to my device and is attached below.`;
    const encodedMsg = encodeURIComponent(messageText);

    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
    markReportSentToday();
  };

  // If report has already been sent today or time < 6 PM or dismissed, don't render banner
  if (!is6PM || reportSentAtToday || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-2.5 shadow-md border-b border-orange-600/30 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-black animate-bounce">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold">⏰ It's 6 PM — Don't forget to send today's report to Subash Sir!</span>
            <span className="hidden md:inline text-amber-100 font-medium ml-2">
              Generate PDF & open WhatsApp chat in 1-click.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendFromBanner}
            className="px-4 py-1.5 rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Report Now</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
