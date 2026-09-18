import Avatar from '../ui/Avatar.jsx';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'In Review', 'Done'];

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  // Parse date portion safely
  const parts = String(dateStr).slice(0, 10).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return dateStr;
}

export default function TaskCard({ task, onStatusChange, onDelete, canManage }) {
  const formattedDue = formatDueDate(task.dueDate);
  const isOverdue = Boolean(
    task.dueDate &&
    task.status !== 'Done' &&
    new Date(String(task.dueDate).slice(0, 10) + 'T23:59:59') < new Date()
  );

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            High
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Low
          </span>
        );
      case 'medium':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
    }
  };

  return (
    <div className="group relative rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm">
      {/* Badges: Priority + Due Date */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          {getPriorityBadge(task.priority)}
          {formattedDue && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                isOverdue
                  ? 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
              }`}
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {isOverdue ? `Overdue (${formattedDue})` : `Due ${formattedDue}`}
            </span>
          )}
        </div>

        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            title="Delete task"
            className="text-neutral-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 p-0.5 rounded"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{task.title}</h3>

      {task.description && (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-1.5">
          <Avatar name={task.assignee || 'Unassigned'} size="xs" />
          <span className="text-xs font-medium text-neutral-700 max-w-[110px] truncate">
            {task.assignee || 'Unassigned'}
          </span>
        </div>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-700 focus:border-neutral-400 focus:outline-none"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
