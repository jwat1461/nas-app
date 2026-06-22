'use client';

import { useState, useEffect, useRef } from 'react';

interface FileRecord {
  id: number;
  name: string;
  original_name: string;
  size: number;
  mime_type: string;
  folder_id: number | null;
  owner_id: number;
  is_shared: boolean;
  created_at: string;
}

interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  owner_id: number;
  is_shared: boolean;
  created_at: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('gz')) return '🗜️';
  if (mime.includes('text')) return '📝';
  return '📦';
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: number | null; name: string }[]>([{ id: null, name: 'Home' }]);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [shareUpload, setShareUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const param = currentFolder != null ? `?folderId=${currentFolder}` : '';
    const [fRes, dRes] = await Promise.all([
      fetch(`/api/files${param}`),
      fetch(`/api/folders${currentFolder != null ? `?parentId=${currentFolder}` : ''}`),
    ]);
    setFiles(await fRes.json());
    setFolders(await dRes.json());
  }

  useEffect(() => { load(); }, [currentFolder]);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (currentFolder != null) fd.append('folderId', String(currentFolder));
    fd.append('isShared', String(shareUpload));
    await fetch('/api/files', { method: 'POST', body: fd });
    setUploading(false);
    load();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteFile(id: number) {
    if (!confirm('Delete this file?')) return;
    await fetch(`/api/files/${id}`, { method: 'DELETE' });
    load();
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName, parentId: currentFolder }),
    });
    setNewFolderName('');
    setShowNewFolder(false);
    load();
  }

  async function deleteFolder(id: number) {
    if (!confirm('Delete this folder and all its contents?')) return;
    await fetch(`/api/folders?id=${id}`, { method: 'DELETE' });
    load();
  }

  function openFolder(folder: Folder) {
    setCurrentFolder(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function navigateTo(index: number) {
    const crumb = breadcrumbs[index];
    setCurrentFolder(crumb.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">File Manager</h1>
          <nav className="flex items-center gap-1 mt-1 text-sm text-gray-400">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <button
                  onClick={() => navigateTo(i)}
                  className={`hover:text-white transition-colors ${i === breadcrumbs.length - 1 ? 'text-white font-medium' : ''}`}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
          >
            📁 New Folder
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors cursor-pointer">
            {uploading ? 'Uploading…' : '⬆️ Upload'}
            <input ref={fileInputRef} type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
          </label>
        </div>
      </div>

      {showNewFolder && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 flex items-center gap-3">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            placeholder="Folder name"
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={shareUpload} onChange={(e) => setShareUpload(e.target.checked)} className="accent-blue-500" />
            Shared
          </label>
          <button onClick={createFolder} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">Create</button>
          <button onClick={() => setShowNewFolder(false)} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Cancel</button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={shareUpload} onChange={(e) => setShareUpload(e.target.checked)} className="accent-blue-500" />
          Upload as shared (visible to all users)
        </label>
      </div>

      {folders.length === 0 && files.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-3">📂</div>
          <p>This folder is empty</p>
          <p className="text-sm mt-1">Upload files or create a new folder to get started</p>
        </div>
      )}

      {folders.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Folders</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="relative group bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-colors"
                onDoubleClick={() => openFolder(folder)}
                onClick={() => openFolder(folder)}
              >
                <div className="text-3xl mb-2">🗂️</div>
                <div className="text-sm text-white font-medium truncate" title={folder.name}>{folder.name}</div>
                {folder.is_shared && <span className="text-xs text-blue-400 mt-0.5 block">Shared</span>}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Files</div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Size</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Added</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fileIcon(file.mime_type)}</span>
                        <span className="text-white font-medium truncate max-w-[200px]" title={file.original_name}>
                          {file.original_name}
                        </span>
                        {file.is_shared && <span className="text-xs bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded">shared</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell truncate max-w-[100px]">{file.mime_type}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <a
                          href={`/api/files/${file.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Download"
                        >
                          ⬇️
                        </a>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
