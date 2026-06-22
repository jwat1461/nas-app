'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import { useEffect, useState } from 'react';

interface CalendarClientProps {
  onDateClick: (start: string, end: string) => void;
  onEventClick: (event: Record<string, unknown>) => void;
}

export default function CalendarClient({ onDateClick, onEventClick }: CalendarClientProps) {
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      });
  }, []);

  function handleDateClick(arg: DateClickArg) {
    const start = arg.dateStr;
    const end = arg.dateStr;
    onDateClick(start, end);
  }

  function handleEventClick(arg: EventClickArg) {
    const e = arg.event;
    onEventClick({
      id: e.id,
      title: e.title,
      description: e.extendedProps?.description ?? '',
      start: e.startStr,
      end: e.endStr,
      allDay: e.allDay,
      isShared: e.extendedProps?.isShared ?? false,
      rrule: e.extendedProps?.rrule ?? '',
      color: e.backgroundColor ?? '#3b82f6',
    });
  }

  return (
    <div className="fc-dark">
      <style>{`
        .fc { --fc-border-color: #374151; --fc-page-bg-color: transparent; --fc-neutral-bg-color: #111827;
          --fc-today-bg-color: rgba(59,130,246,0.08); --fc-event-bg-color: #3b82f6;
          --fc-event-border-color: transparent; color: #e5e7eb; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #374151; }
        .fc-col-header-cell { background: #111827; }
        .fc-col-header-cell-cushion, .fc-daygrid-day-number { color: #9ca3af; text-decoration: none; }
        .fc-daygrid-day.fc-day-today .fc-daygrid-day-number { color: #60a5fa; font-weight: 700; }
        .fc-button-primary { background: #374151 !important; border-color: #4b5563 !important; color: #e5e7eb !important; }
        .fc-button-primary:hover { background: #4b5563 !important; }
        .fc-button-primary.fc-button-active { background: #2563eb !important; border-color: #2563eb !important; color: #fff !important; }
        .fc-toolbar-title { color: #f9fafb; font-size: 1.1rem; font-weight: 600; }
        .fc-event { cursor: pointer; border-radius: 4px; font-size: 0.78rem; }
        .fc-timegrid-event { border-radius: 4px; }
        .fc-list-day-cushion { background: #1f2937 !important; }
        .fc-list-event:hover td { background: #1f2937 !important; }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="calc(100vh - 200px)"
        editable={false}
        selectable={true}
      />
    </div>
  );
}
