import Avatar from '../ui/Avatar.jsx';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'In Review', 'Done'];

export default function TaskCard({ task, onStatusChange, onDelete, canManage }) {
  return (
    <div className="group relative rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{task.title}</h3>
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

