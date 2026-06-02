"use client";

import { useReducer } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AssociationCard } from "@/components/association-card";
import type { SearchResponse, SearchResult } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const RESULTS_LIMIT = 20;
const SKELETON_COUNT = 5;

// ── State machine ────────────────────────────────────────────────────────────

type State = {
  query: string;
  results: SearchResult[];
  total: number | null;
  loading: boolean;
  includeLegacy: boolean;
  hasSearched: boolean;
};

type Action =
  | { type: "SET_QUERY"; query: string }
  | { type: "SET_LEGACY"; includeLegacy: boolean }
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; results: SearchResult[]; total: number }
  | { type: "SEARCH_ERROR" };

const initialState: State = {
  query: "",
  results: [],
  total: null,
  loading: false,
  includeLegacy: false,
  hasSearched: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.query };
    case "SET_LEGACY":
      return { ...state, includeLegacy: action.includeLegacy };
    case "SEARCH_START":
      return { ...state, loading: true, hasSearched: true };
    case "SEARCH_SUCCESS":
      return { ...state, loading: false, results: action.results, total: action.total };
    case "SEARCH_ERROR":
      return { ...state, loading: false, results: [], total: null };
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { query, results, total, loading, includeLegacy, hasSearched } = state;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    dispatch({ type: "SEARCH_START" });

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: String(RESULTS_LIMIT),
        include_legacy: String(includeLegacy),
      });
      const res = await fetch(`${API_URL}/search?${params}`);
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const data: SearchResponse = await res.json();
      dispatch({ type: "SEARCH_SUCCESS", results: data.results, total: data.total });
    } catch (err) {
      dispatch({ type: "SEARCH_ERROR" });
      toast.error("Recherche échouée", {
        description: err instanceof Error ? err.message : "Recherche impossible",
      });
    }
  }

  const resultLabel =
    total === null
      ? null
      : total === 0
        ? "Aucun résultat pour cette recherche."
        : `${total.toLocaleString("fr-FR")} résultat${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col flex-1">
      {/* Hero / search */}
      <section className="bg-secondary border-b border-secondary-foreground/10 py-10 px-4">
        <div className="mx-auto max-w-3xl space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-primary">Rechercher une association</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consultez les associations déclarées en France dans le Répertoire National des
              Associations.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex shadow-sm">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => dispatch({ type: "SET_QUERY", query: e.target.value })}
                  placeholder="Nom, objet, ville, code postal…"
                  className="h-14 pl-12 text-base rounded-r-none border-input bg-card focus-visible:ring-primary focus-visible:border-primary"
                  aria-label="Rechercher une association"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-14 px-8 rounded-l-none text-base font-medium bg-primary hover:bg-primary-hover text-primary-foreground border-0"
              >
                {loading ? "Recherche…" : "Rechercher"}
              </Button>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Switch
                id="legacy-toggle"
                checked={includeLegacy}
                onCheckedChange={(v) => dispatch({ type: "SET_LEGACY", includeLegacy: v })}
              />
              <label htmlFor="legacy-toggle" className="cursor-pointer select-none">
                Inclure les associations historiques (données antérieures à 2009)
              </label>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="flex-1 py-8 px-4 bg-background">
        <div className="mx-auto max-w-3xl space-y-4">
          {!loading && resultLabel && (
            <p className="text-sm text-muted-foreground">{resultLabel}</p>
          )}

          {loading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <AssociationCard key={i} loading />
            ))}

          {!loading && results.map((r) => <AssociationCard key={r.id} result={r} />)}

          {!loading && hasSearched && total === 0 && (
            <div className="text-center py-16 space-y-2 text-muted-foreground">
              <Search className="size-12 mx-auto opacity-30" aria-hidden="true" />
              <p className="text-sm">Aucune association trouvée.</p>
              {!includeLegacy && (
                <p className="text-xs">
                  Activez les données historiques pour élargir la recherche.
                </p>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="size-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p className="text-sm">Lancez une recherche pour afficher les résultats.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
