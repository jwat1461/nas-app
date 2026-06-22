import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { readFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await pool.query(
    'SELECT * FROM files WHERE id = $1 AND (owner_id = $2 OR is_shared = true)',
    [params.id, session.user.id]
  );

  const file = result.rows[0];
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const filePath = path.join(process.cwd(), 'uploads', file.stored_name);
  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.mime_type,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_name)}"`,
      'Content-Length': String(file.size),
    },
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await pool.query(
    'SELECT * FROM files WHERE id = $1 AND owner_id = $2',
    [params.id, session.user.id]
  );

  const file = result.rows[0];
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  try {
    await unlink(path.join(process.cwd(), 'uploads', file.stored_name));
  } catch {
    // File may already be gone from disk
  }

  await pool.query('DELETE FROM files WHERE id = $1', [params.id]);
  return NextResponse.json({ success: true });
}
