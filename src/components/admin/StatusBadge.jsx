const CONFIG = {
  draft:         { label: 'Draft',       cls: 'bg-gray-100 text-gray-600 ring-gray-200' },
  active:        { label: 'Active',      cls: 'bg-teal-50 text-teal-700 ring-teal-200' },
  'in-review':   { label: 'In Review',   cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  delivered:     { label: 'Delivered',   cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  closed:        { label: 'Closed',      cls: 'bg-gray-100 text-gray-500 ring-gray-200' },
  open:          { label: 'Open',        cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  'in-progress': { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  resolved:      { label: 'Resolved',    cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  info:          { label: 'Info',        cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  success:       { label: 'Success',     cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  warning:       { label: 'Warning',     cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status ?? '—', cls: 'bg-gray-100 text-gray-600 ring-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
      {cfg.label}
    </span>
  );
}
