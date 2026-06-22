import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, start, end, allDay, isShared, rrule, color } = await request.json();

  const result = await pool.query(
    `UPDATE calendar_events
     SET title = $1, description = $2, start_time = $3, end_time = $4,
         all_day = $5, is_shared = $6, recurrence_rule = $7, color = $8
     WHERE id = $9 AND owner_id = $10
     RETURNING *`,
    [
      title,
      description || null,
      start,
      end,
      allDay ?? false,
      isShared ?? false,
      rrule || null,
      color || '#3b82f6',
      params.id,
      session.user.id,
    ]
  );

  if (!result.rows[0]) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await pool.query(
    'DELETE FROM calendar_events WHERE id = $1 AND owner_id = $2',
    [params.id, session.user.id]
  );

  return NextResponse.json({ success: true });
}
