import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  const userId = session.user.id;

  const parentParam = parentId ? parseInt(parentId) : null;

  const result = await pool.query(
    `SELECT id, name, parent_id, owner_id, is_shared, created_at
     FROM folders
     WHERE (owner_id = $1 OR is_shared = true)
       AND ($2::integer IS NULL AND parent_id IS NULL OR parent_id = $2)
     ORDER BY name ASC`,
    [userId, parentParam]
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, parentId, isShared } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const result = await pool.query(
    'INSERT INTO folders (name, parent_id, owner_id, is_shared) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, parentId ?? null, session.user.id, isShared ?? false]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await pool.query('DELETE FROM folders WHERE id = $1 AND owner_id = $2', [id, session.user.id]);
  return NextResponse.json({ success: true });
}
