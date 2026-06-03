import { Search } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="bg-card border-b-4 border-primary shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Logo placeholder — tricolor strip + search icon */}
          <div
            className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded bg-primary text-primary-foreground"
            aria-label="Logo Assearch (placeholder)"
          >
            <Search className="size-6 relative z-10" aria-hidden="true" />
            {/* Tricolor strip at bottom of logo */}
            <div className="absolute bottom-0 left-0 right-0 h-2 flex" aria-hidden="true">
              <div className="flex-1 bg-primary" />
              <div className="flex-1 bg-primary-foreground" />
              <div className="flex-1 bg-destructive" />
            </div>
          </div>

          <div>
            <span className="block text-lg font-bold text-primary leading-tight tracking-tight">
              Assearch
            </span>
            <span className="block text-xs text-muted-foreground leading-tight">
              Répertoire National des Associations
            </span>
          </div>
        </div>

        {/* Source attribution */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block size-2 rounded-full bg-badge-success"
            aria-hidden="true"
          />
          {/* · */}Données officielles{" · "}data.gouv.fr
        </div>
      </div>
    </header>
  );
}
