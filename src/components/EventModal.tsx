'use client';

import { useState, useEffect } from 'react';

interface EventModalProps {
  event?: {
    id?: string;
    title?: string;
    description?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
    isShared?: boolean;
    rrule?: string;
    color?: string;
  };
  onSave: (data: Record<string, unknown>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

const RRULE_PRESETS = [
  { value: '', label: 'No recurrence' },
  { value: 'FREQ=DAILY', label: 'Daily' },
  { value: 'FREQ=WEEKLY', label: 'Weekly' },
  { value: 'FREQ=MONTHLY', label: 'Monthly' },
  { value: 'FREQ=YEARLY', label: 'Yearly' },
  { value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', label: 'Weekdays' },
];

export default function EventModal({ event, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [start, setStart] = useState(event?.start ? event.start.slice(0, 16) : '');
  const [end, setEnd] = useState(event?.end ? event.end.slice(0, 16) : '');
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [isShared, setIsShared] = useState(event?.isShared ?? false);
  const [rrule, setRrule] = useState(event?.rrule ?? '');
  const [color, setColor] = useState(event?.color ?? '#3b82f6');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startDate = allDay ? start + 'T00:00:00' : start;
    const endDate = allDay ? end + 'T23:59:59' : end;
    onSave({ title, description, start: startDate, end: endDate, allDay, isShared, rrule: rrule || null, color });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{event?.id ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Event title"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-base"
            />
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? start.slice(0, 10) : start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">End</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? end.slice(0, 10) : end}
                onChange={(e) => setEnd(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="accent-blue-500 w-4 h-4" />
              All day
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} className="accent-blue-500 w-4 h-4" />
              Shared with all
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Recurrence</label>
            <select
              value={rrule}
              onChange={(e) => setRrule(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RRULE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full transition-all ${color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors"
            >
              {event?.id ? 'Save Changes' : 'Create Event'}
            </button>
            {event?.id && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 bg-red-900/40 hover:bg-red-900/60 border border-red-700 text-red-300 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
