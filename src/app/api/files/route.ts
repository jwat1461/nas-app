import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');
  const userId = session.user.id;

  const folderParam = folderId ? parseInt(folderId) : null;

  const result = await pool.query(
    `SELECT id, name, original_name, size, mime_type, folder_id, owner_id, is_shared, created_at
     FROM files
     WHERE (owner_id = $1 OR is_shared = true)
       AND ($2::integer IS NULL AND folder_id IS NULL OR folder_id = $2)
     ORDER BY created_at DESC`,
    [userId, folderParam]
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folderId = formData.get('folderId') as string | null;
  const isShared = formData.get('isShared') === 'true';

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = path.extname(file.name);
  const storedName = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'uploads');

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, storedName), Buffer.from(bytes));

  const result = await pool.query(
    `INSERT INTO files (name, original_name, stored_name, size, mime_type, folder_id, owner_id, is_shared)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      file.name,
      file.name,
      storedName,
      file.size,
      file.type || 'application/octet-stream',
      folderId ? parseInt(folderId) : null,
      session.user.id,
      isShared,
    ]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
