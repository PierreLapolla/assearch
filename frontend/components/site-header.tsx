export function SiteHeader() {
  return (
    <header>
      {/* République Française top bar */}
      <div className="bg-[#000091] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center gap-3">
          {/* RF tricolor logo placeholder */}
          <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-sm" aria-hidden="true">
            <div className="flex-1 bg-[#000091]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#e1000f]" />
          </div>
          <span className="text-sm font-medium tracking-wide">
            République<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            Française
          </span>
        </div>
      </div>

      {/* Service header */}
      <div className="bg-white border-b-4 border-[#000091]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center gap-4">
          {/* Service logo placeholder */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-[#000091] text-white"
            aria-label="Logo Assearch (placeholder)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <div>
            <p className="text-xl font-bold text-[#000091] leading-tight">Assearch</p>
            <p className="text-sm text-[#666666] leading-tight">
              Répertoire National des Associations
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
