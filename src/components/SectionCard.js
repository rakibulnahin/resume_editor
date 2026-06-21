import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SectionCard({ title, isExpanded, onToggle, itemCount, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {itemCount !== undefined && (
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-slate-600" />
        ) : (
          <ChevronDown size={20} className="text-slate-600" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-slate-200 px-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
