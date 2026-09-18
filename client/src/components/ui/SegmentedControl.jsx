export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-colors text-center truncate ${
            value === option
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title={option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
