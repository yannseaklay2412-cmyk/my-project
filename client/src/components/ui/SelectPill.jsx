export default function SelectPill({ label, options = [], value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={label}
        className="appearance-none rounded-full border border-neutral-200 bg-white py-2 pl-4 pr-8 text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
