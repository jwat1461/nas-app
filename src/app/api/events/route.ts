import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const result = await pool.query(
    `SELECT id, title, description, start_time, end_time, all_day, is_shared,
            owner_id, recurrence_rule, color
     FROM calendar_events
     WHERE (owner_id = $1 OR is_shared = true)
       AND ($2::timestamptz IS NULL OR end_time >= $2)
       AND ($3::timestamptz IS NULL OR start_time <= $3)
     ORDER BY start_time ASC`,
    [session.user.id, start || null, end || null]
  );

  // Map to FullCalendar event format
  const events = result.rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    start: row.start_time,
    end: row.end_time,
    allDay: row.all_day,
    backgroundColor: row.color,
    borderColor: row.color,
    extendedProps: {
      description: row.description,
      isShared: row.is_shared,
      ownerId: row.owner_id,
      rrule: row.recurrence_rule,
    },
    rrule: row.recurrence_rule || undefined,
  }));

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, start, end, allDay, isShared, rrule, color } = await request.json();

  if (!title || !start || !end) {
    return NextResponse.json({ error: 'Title, start, and end are required' }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO calendar_events
       (title, description, start_time, end_time, all_day, is_shared, owner_id, recurrence_rule, color)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      title,
      description || null,
      start,
      end,
      allDay ?? false,
      isShared ?? false,
      session.user.id,
      rrule || null,
      color || '#3b82f6',
    ]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
