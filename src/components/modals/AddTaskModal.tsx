import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkType, RecurrenceRule } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

const DAYS_OF_WEEK = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, defaultDate }) => {
  const { clients, assignedClients, activeClientId, addTask, user } = useApp();

  const availableClients = user?.role === 'admin' ? clients : (assignedClients.length > 0 ? assignedClients : clients);

  const todayStr = new Date().toISOString().slice(0, 10);

  const [selectedClient, setSelectedClient] = useState<string>(() => {
    if (activeClientId && activeClientId !== 'all' && availableClients.some(c => c.id === activeClientId)) {
      return activeClientId;
    }
    return availableClients[0]?.id || 'client-1';
  });
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr);
  const [workType, setWorkType] = useState<WorkType>('GMB Post');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showDaysError, setShowDaysError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isRecurring && recurrenceRule === 'custom' && selectedDays.length === 0) {
      setShowDaysError(true);
      return;
    }

    addTask({
      client_id: selectedClient,
      title: title.trim(),
      date: isRecurring ? todayStr : (date || todayStr),
      time: '10:00 AM',
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : undefined,
      recurrence_days: isRecurring && recurrenceRule === 'custom' ? selectedDays : undefined,
      tags: [workType.replace(' ', '')],
      work_type: workType,
      reminder_enabled: true,
    });

    setTitle('');
    setSelectedDays([]);
    setShowDaysError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-agency-teal" /> Create New Deliverable
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Client Account
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {availableClients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.business_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Task Deliverable Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Publish GMB Autumn Discount Offer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          {/* Date & Category Grid */}
          <div className={`grid ${isRecurring ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            {!isRecurring && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as WorkType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              >
                <option value="GMB Post">GMB Post</option>
                <option value="SEO Blog">SEO Blog</option>
                <option value="Review Response">Review Response</option>
                <option value="Ad Campaign">Ad Campaign</option>
                <option value="Social Media">Social Media</option>
                <option value="Design">Design</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Recurring Task Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-agency-teal focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="isRecurringCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Recurring Task?
                </label>
              </div>

              {isRecurring && (
                <select
                  value={recurrenceRule}
                  onChange={(e) => {
                    const rule = e.target.value as RecurrenceRule;
                    setRecurrenceRule(rule);
                    setShowDaysError(false);
                  }}
                  className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2.5 py-1 text-slate-800"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Days</option>
                </select>
              )}
            </div>

            {/* Custom Days 7 Checkboxes */}
            {isRecurring && recurrenceRule === 'custom' && (
              <div className="pt-2 border-t border-slate-200/60 animate-in fade-in duration-150 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Days of Week <span className="text-rose-500">*</span>
                </label>
                
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map(day => {
                    const isChecked = selectedDays.includes(day.id);
                    return (
                      <label
                        key={day.id}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                          isChecked
                            ? 'bg-agency-teal text-white border-agency-teal shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setShowDaysError(false);
                            if (e.target.checked) {
                              setSelectedDays(prev => [...prev, day.id]);
                            } else {
                              setSelectedDays(prev => prev.filter(d => d !== day.id));
                            }
                          }}
                          className="w-3.5 h-3.5 mb-1 text-agency-teal accent-teal-600 rounded cursor-pointer"
                        />
                        <span className="text-[10px] uppercase tracking-tighter">{day.label}</span>
                      </label>
                    );
                  })}
                </div>

                {showDaysError && selectedDays.length === 0 && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    ⚠️ Please select at least 1 day for custom recurrence.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-agency-teal text-white font-bold text-xs shadow-md shadow-teal-500/20"
            >
              Save Deliverable
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
