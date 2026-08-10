export default function TextArea({ id, label, hint, rows = 4, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        {...props}
        className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-lime-600">{hint}</p>}
    </div>
  );
}
