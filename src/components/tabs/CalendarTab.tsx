import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, GmbSeoEntry } from '../../types';

interface CalendarTabProps {
  onOpenAddTaskDate?: (dateStr: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ onOpenAddTaskDate }) => {
  const { tasks, gmbSeoEntries, activeClientId, activeClient, clients } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sept 2026
  const [selectedDayModalDate, setSelectedDayModalDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Month grid calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Scope items
  let scopedTasks = tasks;
  let scopedGmbSeo = gmbSeoEntries;

  if (activeClientId !== 'all') {
    scopedTasks = scopedTasks.filter(t => t.client_id === activeClientId);
    scopedGmbSeo = scopedGmbSeo.filter(e => e.client_id === activeClientId);
  }

  // Render day cells
  const dayCells = [];

  // Empty leading padding cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(<div key={`empty-${i}`} className="bg-slate-50/50 rounded-2xl min-h-[100px] border border-slate-100/50" />);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Items for this day
    const dayTasks = scopedTasks.filter(t => t.date === dayStr);
    const dayGmbSeo = scopedGmbSeo.filter(e => e.date_posted === dayStr);

    const isToday = dayStr === new Date().toISOString().slice(0, 10);

    dayCells.push(
      <div
        key={dayStr}
        onClick={() => setSelectedDayModalDate(dayStr)}
        className={`bg-white rounded-2xl p-2 sm:p-3 min-h-[110px] sm:min-h-[130px] border cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group ${
          isToday
            ? 'border-agency-purple ring-2 ring-purple-500/20 bg-purple-50/10'
            : 'border-slate-200/80 hover:border-agency-purple/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center ${
              isToday
                ? 'bg-agency-purple text-white shadow-xs'
                : 'text-slate-700 group-hover:bg-slate-100'
            }`}
          >
            {day}
          </span>
          {(dayTasks.length > 0 || dayGmbSeo.length > 0) && (
            <span className="text-[10px] font-bold text-slate-400">
              {dayTasks.length + dayGmbSeo.length} items
            </span>
          )}
        </div>

        {/* Tag Chips in Calendar Cell */}
        <div className="space-y-1 my-1 flex-1 overflow-hidden">
          {/* GMB / SEO entries */}
          {dayGmbSeo.map(entry => (
            <div
              key={entry.id}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 ${
                entry.type === 'gmb_post'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{entry.type === 'gmb_post' ? 'GMB' : 'SEO'}: {entry.title}</span>
            </div>
          ))}

          {/* Scheduled Tasks */}
          {dayTasks.slice(0, 3).map(task => (
            <div
              key={task.id}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold truncate ${
                task.status === 'done'
                  ? 'bg-emerald-50 text-emerald-700 line-through'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {task.title}
            </div>
          ))}

          {dayTasks.length > 3 && (
            <div className="text-[9px] font-extrabold text-slate-400 pl-1">
              +{dayTasks.length - 3} more
            </div>
          )}
        </div>

        <div className="text-[10px] font-bold text-agency-purple opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5">
          <span>View/Add</span> <Plus className="w-3 h-3" />
        </div>
      </div>
    );
  }

  // Selected Day Detail Modal
  const modalTasks = selectedDayModalDate ? scopedTasks.filter(t => t.date === selectedDayModalDate) : [];
  const modalEntries = selectedDayModalDate ? scopedGmbSeo.filter(e => e.date_posted === selectedDayModalDate) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Calendar Header Banner */}
      <div className="bg-gradient-to-r from-agency-purple via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-widest mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Content & Marketing Schedule</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Monthly Content Calendar
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            {activeClientId === 'all' ? 'All Client Posts & SEO Deliverables' : `Content grid for ${activeClient?.name}`}
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm sm:text-base px-2">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/20 rounded-xl transition-all text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-purple-500" />
          <span className="text-slate-700">GMB Post</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-teal-500" />
          <span className="text-slate-700">SEO Blog</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span className="text-slate-700">Completed Deliverable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-300" />
          <span className="text-slate-700">General Task</span>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {dayCells}
      </div>

      {/* Day Details Popover Modal */}
      {selectedDayModalDate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {new Date(selectedDayModalDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Scheduled Deliverables & Marketing Tasks</p>
              </div>
              <button
                onClick={() => setSelectedDayModalDate(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* List items for this date */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {modalEntries.map(entry => (
                <div key={entry.id} className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-200 text-purple-800">
                      {entry.type === 'gmb_post' ? 'GMB Post' : 'SEO Blog'}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{entry.title}</h5>
                    <p className="text-xs text-slate-500">Rank: #{entry.search_position} | Views: {entry.views}</p>
                  </div>
                </div>
              ))}

              {modalTasks.map(task => (
                <div key={task.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      {task.work_type}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h5>
                    <p className="text-xs text-slate-500">Time: {task.time}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                    {task.status}
                  </span>
                </div>
              ))}

              {modalTasks.length === 0 && modalEntries.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">No scheduled items for this date.</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDayModalDate(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
