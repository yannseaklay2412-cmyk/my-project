const COLORS = [
  'bg-lime-200 text-lime-900',
  'bg-blue-200 text-blue-900',
  'bg-orange-200 text-orange-900',
  'bg-pink-200 text-pink-900',
  'bg-purple-200 text-purple-900',
];

function colorFor(name) {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index];
}

export default function Avatar({ name, size = 'md' }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const SIZES = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-16 w-16 text-lg',
  };
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses} ${colorFor(name)}`}
    >
      {initials}
    </span>
  );
}
