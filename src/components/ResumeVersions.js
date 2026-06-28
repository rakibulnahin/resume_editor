import React, { useEffect, useRef, useState } from 'react';
import { Save, FolderOpen, Trash2, Pencil, Check, X, ChevronDown } from 'lucide-react';
import { listVersions, saveVersion, deleteVersion, renameVersion } from '../utils/storage';

/**
 * Saved resume versions panel.
 *
 * Lets users keep several named resumes ("Frontend role", "PM role") entirely
 * in localStorage – no account, no server. Loading a version replaces the
 * working resume in the editor.
 */
export default function ResumeVersions({ resumeData, onLoad }) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const containerRef = useRef(null);

  const refresh = () => setVersions(listVersions());

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSaveNew = () => {
    const fallbackName = resumeData?.name ? `${resumeData.name}'s resume` : 'Untitled resume';
    saveVersion(newName || fallbackName, resumeData);
    setNewName('');
    refresh();
  };

  const handleLoad = (version) => {
    if (typeof onLoad === 'function') {
      onLoad(JSON.parse(JSON.stringify(version.data)));
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    deleteVersion(id);
    refresh();
  };

  const startRename = (version) => {
    setEditingId(version.id);
    setEditingName(version.name);
  };

  const commitRename = () => {
    if (editingId) {
      renameVersion(editingId, editingName);
    }
    setEditingId(null);
    setEditingName('');
    refresh();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors text-sm"
      >
        <FolderOpen size={16} />
        My Resumes
        {versions.length > 0 && (
          <span className="px-1.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
            {versions.length}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl z-[60] p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSaveNew()}
              placeholder="Name this version…"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSaveNew}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={15} /> Save
            </button>
          </div>

          {versions.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No saved versions yet. Save the current resume to reuse it later.
            </p>
          ) : (
            <ul className="space-y-1 max-h-72 overflow-y-auto">
              {versions
                .slice()
                .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
                .map((version) => (
                  <li
                    key={version.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 group"
                  >
                    {editingId === version.id ? (
                      <>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => event.key === 'Enter' && commitRename()}
                          className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={commitRename} className="text-emerald-600 p-1" aria-label="Save name">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 p-1" aria-label="Cancel">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleLoad(version)}
                          className="flex-1 text-left min-w-0"
                          title="Load this version"
                        >
                          <div className="text-sm font-medium text-slate-800 truncate">{version.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(version.updatedAt).toLocaleString()}
                          </div>
                        </button>
                        <button
                          onClick={() => startRename(version)}
                          className="text-slate-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Rename"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(version.id)}
                          className="text-slate-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
