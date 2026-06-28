import React, { useState } from 'react';
import {
  Download,
  FileText,
  Palette,
  Sparkles,
  Wand2,
  Menu,
  X,
} from 'lucide-react';
import ResumeVersions from './ResumeVersions';
import { THEME_LIST, getTheme } from '../template_generator/themes';

const btnBase = 'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors';

/**
 * Responsive app header — avoids button overlap on narrow screens.
 */
export default function AppHeader({
  aiConfigured,
  onTailor,
  onAiSettings,
  onDownloadJson,
  onDownloadDocx,
  onDownloadPdf,
  docxLoading,
  themeId,
  onThemeChange,
  resumeData,
  onLoadVersion,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const exportButtons = (
    <>
      <button type="button" onClick={onDownloadJson} className={`${btnBase} bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 w-full sm:w-auto`}>
        <Download size={16} />
        JSON
      </button>
      <button
        type="button"
        onClick={onDownloadDocx}
        disabled={docxLoading}
        className={`${btnBase} bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto`}
      >
        <Download size={16} />
        {docxLoading ? 'Generating…' : 'DOCX'}
      </button>
      <button type="button" onClick={onDownloadPdf} className={`${btnBase} bg-rose-600 px-3 py-2 text-white hover:bg-rose-700 w-full sm:w-auto`}>
        <FileText size={16} />
        PDF
      </button>
    </>
  );

  const themeSelect = (
    <label
      className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 sm:flex-none"
      title={getTheme(themeId).description}
    >
      <Palette size={16} className="shrink-0 text-slate-500" />
      <select
        value={themeId}
        onChange={(event) => onThemeChange(event.target.value)}
        className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm focus:outline-none sm:max-w-[9rem]"
        aria-label="CV template layout"
      >
        {THEME_LIST.map((tpl) => (
          <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
            Easy Customize
          </h1>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Always visible on md+ */}
            <button
              type="button"
              onClick={onTailor}
              className={`${btnBase} hidden bg-purple-600 px-3 py-2 text-white hover:bg-purple-700 md:inline-flex`}
            >
              <Wand2 size={16} />
              Tailor to JD
            </button>

            <button
              type="button"
              onClick={onAiSettings}
              title={aiConfigured ? 'AI is configured' : 'Set up AI'}
              className={`${btnBase} border border-slate-300 bg-white px-2.5 py-2 text-slate-700 hover:bg-slate-50 sm:px-3`}
            >
              <Sparkles size={16} className={aiConfigured ? 'text-purple-600' : 'text-slate-400'} />
              <span className="hidden sm:inline">AI</span>
              {aiConfigured && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop toolbar */}
        <div className="mt-2 hidden flex-wrap items-center justify-end gap-2 md:flex">
          <ResumeVersions resumeData={resumeData} onLoad={onLoadVersion} />
          {themeSelect}
          {exportButtons}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 md:hidden">
            <button
              type="button"
              onClick={() => { onTailor(); closeMenu(); }}
              className={`${btnBase} w-full bg-purple-600 px-4 py-2.5 text-white hover:bg-purple-700`}
            >
              <Wand2 size={16} />
              Tailor to JD
            </button>

            <div className="flex flex-wrap items-stretch gap-2">
              <ResumeVersions
                resumeData={resumeData}
                onLoad={(data) => { onLoadVersion(data); closeMenu(); }}
              />
              {themeSelect}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {exportButtons}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
