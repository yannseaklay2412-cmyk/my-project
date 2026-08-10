const STATUS_STYLES = {
  Hiring: 'bg-lime-400 text-neutral-900',
  Active: 'bg-violet-100 text-violet-700',
  Planning: 'bg-neutral-200 text-neutral-600',
  Completed: 'bg-neutral-200 text-neutral-600',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        STATUS_STYLES[status] || STATUS_STYLES.Planning
      }`}
    >
      {status}
    </span>
  );
}
