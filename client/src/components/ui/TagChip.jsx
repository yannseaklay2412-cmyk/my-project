export default function TagChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-lime-50 px-2.5 py-1 text-xs font-medium text-lime-700">
      {children}
    </span>
  );
}
