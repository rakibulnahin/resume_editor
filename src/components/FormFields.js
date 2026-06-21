export function InputField({ label, value, onChange, size = 'normal' }) {
  const sizeClasses = size === 'small' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';

  return (
    <div>
      <label className={`block font-semibold text-slate-900 mb-1 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${sizeClasses}`}
      />
    </div>
  );
}

export function TextAreaField({ label, value, onChange, rows = 4 }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
      />
    </div>
  );
}
