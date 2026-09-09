const ICONS = {
  code: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6L2 12l6 6M16 6l6 6-6 6" />
    </svg>
  ),
  design: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </svg>
  ),
  doc: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  slides: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  ),
};

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '') + new URL(url).pathname;
  } catch {
    return url;
  }
}

export default function ProjectResourceCard({ resource }) {
  const { icon = 'doc', title, url, addedBy, addedOn } = resource;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-neutral-300"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 text-lime-700">
          {ICONS[icon]}
        </span>
        <svg className="h-4 w-4 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M8 7h9v9" />
        </svg>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <p className="mt-0.5 text-sm text-lime-700">{getDomain(url)}</p>
      </div>

      <p className="flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
        Added by {addedBy} · {addedOn}
      </p>
    </a>
  );
}
