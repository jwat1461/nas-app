'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import EventModal from '@/components/EventModal';

// FullCalendar must be dynamically imported (no SSR) because it uses browser APIs
const FullCalendar = dynamic(() => import('@/components/CalendarClient'), { ssr: false });

export default function CalendarPage() {
  const [modalEvent, setModalEvent] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openNew = useCallback((start?: string, end?: string) => {
    setModalEvent({ start: start ?? '', end: end ?? '', title: '' });
    setShowModal(true);
  }, []);

  const openEdit = useCallback((event: Record<string, unknown>) => {
    setModalEvent(event);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalEvent(null);
  }, []);

  async function handleSave(data: Record<string, unknown>) {
    const isEdit = !!(modalEvent as Record<string, unknown>)?.id;
    const url = isEdit ? `/api/events/${(modalEvent as Record<string, unknown>).id}` : '/api/events';
    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    closeModal();
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete() {
    if (!modalEvent?.id) return;
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/events/${modalEvent.id}`, { method: 'DELETE' });
    closeModal();
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 text-sm mt-0.5">Click a date to add an event, click an event to edit it</p>
        </div>
        <button
          onClick={() => openNew()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Event
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden p-1">
        <FullCalendar
          key={refreshKey}
          onDateClick={openNew}
          onEventClick={openEdit}
        />
      </div>

      {showModal && (
        <EventModal
          event={modalEvent as Parameters<typeof EventModal>[0]['event']}
          onSave={handleSave}
          onDelete={modalEvent?.id ? handleDelete : undefined}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
