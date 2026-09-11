import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkType } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, defaultDate }) => {
  const { clients, activeClientId, addTask } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [selectedClient, setSelectedClient] = useState<string>(activeClientId === 'all' ? clients[0]?.id || 'client-1' : activeClientId);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr);
  const [time, setTime] = useState('10:00 AM');
  const [workType, setWorkType] = useState<WorkType>('GMB Post');
  const [tagsInput, setTagsInput] = useState('GMB, Promo');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    addTask({
      client_id: selectedClient,
      title: title.trim(),
      date,
      time,
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : undefined,
      tags: tagsArray,
      work_type: workType,
      reminder_enabled: true,
    });

    setTitle('');
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
              {clients.map(c => (
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

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurringCheck"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-agency-teal focus:ring-teal-500"
              />
              <label htmlFor="isRecurringCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                Recurring Task?
              </label>
            </div>

            {isRecurring && (
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
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
