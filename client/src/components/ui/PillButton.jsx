const VARIANTS = {
  dark: 'bg-neutral-900 text-white hover:bg-neutral-800',
  light: 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50',
  lime: 'bg-lime-400 text-neutral-900 hover:bg-lime-300',
  ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100',
};

const ARROW_BG = {
  dark: 'bg-lime-400 text-neutral-900',
  light: 'bg-neutral-900 text-white',
  lime: 'bg-neutral-900 text-lime-400',
  ghost: 'bg-neutral-900 text-white',
};

export default function PillButton({
  as: Component = 'button',
  variant = 'dark',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium transition-colors ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${ARROW_BG[variant]}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </span>
    </Component>
  );
}
