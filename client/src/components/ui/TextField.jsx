import { useState } from 'react';

export default function TextField({ id, label, labelExtra, hint, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-neutral-900">
          {label}
        </label>
        {labelExtra}
      </div>
      <div className="relative mt-1">
        <input
          id={id}
          type={inputType}
          {...props}
          className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-lime-600">{hint}</p>}
    </div>
  );
}
