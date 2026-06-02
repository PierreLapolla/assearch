"use client";

import { useReducer } from "react";
import { toast } from "sonner";
import { Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AssociationCard } from "@/components/association-card";
import type { SearchResponse, SearchResult } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PAGE_SIZE = 10;

// ── State machine ─────────────────────────────────────────────────────────────

type State = {
  query: string;
  results: SearchResult[];
  total: number | null;
  loading: boolean;
  loadingMore: boolean;
  includeLegacy: boolean;
  hasSearched: boolean;
};

type Action =
  | { type: "SET_QUERY"; query: string }
  | { type: "SET_LEGACY"; includeLegacy: boolean }
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; results: SearchResult[]; total: number }
  | { type: "SEARCH_ERROR" }
  | { type: "LOAD_MORE_START" }
  | { type: "LOAD_MORE_SUCCESS"; results: SearchResult[] }
  | { type: "LOAD_MORE_ERROR" };

const initialState: State = {
  query: "",
  results: [],
  total: null,
  loading: false,
  loadingMore: false,
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
    case "LOAD_MORE_START":
      return { ...state, loadingMore: true };
    case "LOAD_MORE_SUCCESS":
      return { ...state, loadingMore: false, results: [...state.results, ...action.results] };
    case "LOAD_MORE_ERROR":
      return { ...state, loadingMore: false };
  }
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function fetchResults(
  query: string,
  offset: number,
  includeLegacy: boolean,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    query,
    limit: String(PAGE_SIZE),
    offset: String(offset),
    include_legacy: String(includeLegacy),
  });
  const res = await fetch(`${API_URL}/search?${params}`);
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
  return res.json() as Promise<SearchResponse>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { query, results, total, loading, loadingMore, includeLegacy, hasSearched } = state;

  const hasMore = total !== null && results.length < total;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch({ type: "SEARCH_START" });
    try {
      const data = await fetchResults(query.trim(), 0, includeLegacy);
      dispatch({ type: "SEARCH_SUCCESS", results: data.results, total: data.total });
    } catch (err) {
      dispatch({ type: "SEARCH_ERROR" });
      toast.error("Recherche échouée", {
        description: err instanceof Error ? err.message : "Recherche impossible",
      });
    }
  }

  async function handleLoadMore() {
    dispatch({ type: "LOAD_MORE_START" });
    try {
      const data = await fetchResults(query.trim(), results.length, includeLegacy);
      dispatch({ type: "LOAD_MORE_SUCCESS", results: data.results });
    } catch (err) {
      dispatch({ type: "LOAD_MORE_ERROR" });
      toast.error("Chargement échoué", {
        description: err instanceof Error ? err.message : "Impossible de charger plus",
      });
    }
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Hero / search */}
      <section className="bg-secondary border-b border-secondary-foreground/10 py-10 px-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Rechercher une association</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Consultez les associations déclarées en France dans le Répertoire National des
              Associations.
            </p>
          </div>

          {/* Single-line search form */}
          <form onSubmit={handleSearch}>
            <div className="flex shadow-sm">
              {/* Query input */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => dispatch({ type: "SET_QUERY", query: e.target.value })}
                  placeholder="Nom, objet, ville, code postal…"
                  className="h-14 pl-12 text-base rounded-none border-r-0 bg-card focus-visible:ring-primary focus-visible:border-primary"
                  aria-label="Rechercher une association"
                  autoFocus
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="h-14 px-7 rounded-none text-base font-medium bg-primary hover:bg-primary-hover text-primary-foreground border-0 shrink-0"
              >
                {loading ? "Recherche…" : "Rechercher"}
              </Button>

              {/* Legacy toggle — compact checkbox with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="flex items-center gap-1.5 h-14 px-3 bg-card border border-input border-l-0 rounded-r-sm cursor-pointer shrink-0 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={includeLegacy}
                      onCheckedChange={(v) =>
                        dispatch({ type: "SET_LEGACY", includeLegacy: !!v })
                      }
                      aria-label="Inclure les associations historiques"
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Info className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  </label>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-56 text-center">
                  Inclure les associations historiques (données antérieures à 2009, non mises à
                  jour)
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="flex-1 py-8 px-4 bg-background">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Count banner */}
          {!loading && total !== null && total > 0 && (
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {results.length.toLocaleString("fr-FR")}
                </span>
                {total > results.length && (
                  <>
                    {" "}sur{" "}
                    <span className="font-medium text-foreground">
                      {total.toLocaleString("fr-FR")}
                    </span>
                  </>
                )}{" "}
                résultat{total !== 1 ? "s" : ""}
              </p>
              {hasMore && (
                <p className="text-xs text-muted-foreground">
                  Affinez la recherche pour de meilleurs résultats
                </p>
              )}
            </div>
          )}

          {/* Skeleton placeholders */}
          {loading &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => <AssociationCard key={i} loading />)}

          {/* Result cards */}
          {!loading && results.map((r) => <AssociationCard key={r.id} result={r} />)}

          {/* Load more */}
          {!loading && hasMore && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-secondary"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore
                ? "Chargement…"
                : `Afficher ${Math.min(PAGE_SIZE, total! - results.length)} résultat${Math.min(PAGE_SIZE, total! - results.length) > 1 ? "s" : ""} de plus`}
            </Button>
          )}

          {/* No results */}
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

          {/* Initial prompt */}
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
