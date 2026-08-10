export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex w-full rounded-lg border border-neutral-200 bg-neutral-50 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            value === option ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
