"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, MapPin, Globe, Calendar, Users, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface SearchResult {
  id: string;
  score: number;
  source: string | null;
  title: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  website: string | null;
  date_creat: string | null;
  date_disso: string | null;
  position: string | null;
  nature: string | null;
  groupement: string | null;
}

interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}

const POSITION_LABELS: Record<string, { label: string; className: string }> = {
  A: { label: "Active", className: "bg-[#dffee7] text-[#18753c] border-[#b8ffd8]" },
  D: { label: "Dissoute", className: "bg-[#fff3cd] text-[#716800] border-[#ffe58f]" },
  S: { label: "Supprimée", className: "bg-[#fde8e8] text-[#c9191e] border-[#ffbcbc]" },
};

const GROUPEMENT_LABELS: Record<string, string> = {
  S: "Association simple",
  U: "Union",
  F: "Fédération",
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatWebsite(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `https://${url}`;
}

function AssociationCard({ result, loading = false }: { result?: SearchResult; loading?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const isLegacy = result?.source === "import";
  const posStyle = result?.position ? POSITION_LABELS[result.position] : null;
  const groupLabel = result?.groupement ? GROUPEMENT_LABELS[result.groupement] : null;
  const dateCreat = formatDate(result?.date_creat ?? null);
  const dateDisso = formatDate(result?.date_disso ?? null);
  const website = formatWebsite(result?.website ?? null);
  const longDescription = result?.description && result.description.length > 220;
  const descriptionText =
    longDescription && !expanded ? result!.description!.slice(0, 220) + "…" : result?.description;

  return (
    <Skeleton name="association-card" loading={loading} animate="shimmer">
      <article className="bg-white border border-[#dddddd] border-l-4 border-l-[#000091] p-5 hover:shadow-md transition-shadow">
        {/* Title row */}
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <h2 className="text-base font-bold text-[#000091] flex-1 min-w-0 leading-snug">
            {result?.title ?? "Sans titre"}
          </h2>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {isLegacy && (
              <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-[#fff3cd] text-[#716800] border border-[#ffe58f]">
                Données historiques
              </span>
            )}
            {posStyle && (
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border ${posStyle.className}`}
              >
                {posStyle.label}
              </span>
            )}
          </div>
        </div>

        {/* Groupement */}
        {groupLabel && (
          <p className="flex items-center gap-1 text-xs text-[#666666] mb-3">
            <Users className="size-3" aria-hidden="true" />
            {groupLabel}
          </p>
        )}

        {/* Description */}
        {result?.description && (
          <p className="text-sm text-[#3a3a3a] leading-relaxed mb-3">
            {descriptionText}
            {longDescription && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="text-[#000091] hover:underline font-medium cursor-pointer"
                >
                  {expanded ? "Voir moins" : "Voir plus"}
                </button>
              </>
            )}
          </p>
        )}

        {/* Address + meta */}
        {(result?.address || result?.city || result?.postal_code || dateCreat || dateDisso || website) && (
          <div className="border-t border-[#eeeeee] pt-3 mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {(result?.address || result?.city || result?.postal_code) && (
              <span className="flex items-start gap-1.5 text-xs text-[#555555]">
                <MapPin className="size-3.5 mt-0.5 shrink-0 text-[#000091]" aria-hidden="true" />
                {[
                  result?.address,
                  result?.city && result?.postal_code
                    ? `${result.city} (${result.postal_code})`
                    : (result?.city ?? result?.postal_code),
                ]
                  .filter(Boolean)
                  .join(" — ")}
              </span>
            )}
            {dateCreat && (
              <span className="flex items-center gap-1.5 text-xs text-[#555555]">
                <Calendar className="size-3 text-[#000091]" aria-hidden="true" />
                Créée le {dateCreat}
              </span>
            )}
            {dateDisso && (
              <span className="flex items-center gap-1.5 text-xs text-[#c9191e]">
                <Clock className="size-3" aria-hidden="true" />
                Dissoute le {dateDisso}
              </span>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#000091] hover:underline"
              >
                <Globe className="size-3" aria-hidden="true" />
                {safeHostname(website)}
              </a>
            )}
          </div>
        )}

        {/* Legacy warning */}
        {isLegacy && (
          <div className="flex items-start gap-2 rounded bg-[#fff3cd] border border-[#ffe58f] px-3 py-2 text-xs text-[#716800] mt-3">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            Ces données proviennent de l&apos;ancien répertoire et n&apos;ont pas été mises à jour
            depuis 2009.
          </div>
        )}
      </article>
    </Skeleton>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [includeLegacy, setIncludeLegacy] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: "20",
        include_legacy: String(includeLegacy),
      });
      const res = await fetch(`${API_URL}/search?${params}`);
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const data: SearchResponse = await res.json();
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Recherche impossible";
      toast.error("Recherche échouée", { description: msg });
      setResults([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="bg-[#e8edff] border-b border-[#c5cff5] py-12 px-4">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#000091]">
              Rechercher une association
            </h1>
            <p className="text-sm text-[#555555] mt-1">
              Consultez les associations déclarées en France dans le Répertoire National des Associations.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            {/* Search bar — single prominent line */}
            <div className="flex gap-0 shadow-sm">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#666666] pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom, objet, ville, code postal…"
                  className="h-14 pl-12 pr-4 text-base rounded-r-none border-[#aaaaaa] bg-white focus-visible:ring-[#000091] focus-visible:border-[#000091]"
                  aria-label="Rechercher une association"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-14 px-8 rounded-l-none text-base font-medium bg-[#000091] hover:bg-[#1212ff] text-white border-0 cursor-pointer"
              >
                {loading ? "Recherche…" : "Rechercher"}
              </Button>
            </div>

            {/* Legacy filter */}
            <div className="flex items-center gap-2.5 text-sm text-[#555555]">
              <Switch
                id="legacy-toggle"
                checked={includeLegacy}
                onCheckedChange={setIncludeLegacy}
              />
              <label htmlFor="legacy-toggle" className="cursor-pointer select-none">
                Inclure les associations historiques (données antérieures à 2009)
              </label>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="flex-1 py-8 px-4 bg-[#f6f6f6]">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Count */}
          {!loading && total !== null && (
            <p className="text-sm text-[#555555]">
              {total === 0
                ? "Aucun résultat pour cette recherche."
                : `${total.toLocaleString("fr-FR")} résultat${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Skeletons */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <AssociationCard key={i} loading={true} />
            ))}

          {/* Cards */}
          {!loading && results.map((r) => <AssociationCard key={r.id} result={r} />)}

          {/* Empty state */}
          {!loading && hasSearched && total === 0 && (
            <div className="text-center py-16 space-y-3">
              <Search className="size-12 mx-auto text-[#aaaaaa]" aria-hidden="true" />
              <p className="text-[#555555]">Aucune association trouvée.</p>
              {!includeLegacy && (
                <p className="text-sm text-[#888888]">
                  Activez les données historiques pour élargir la recherche.
                </p>
              )}
            </div>
          )}

          {/* Initial state */}
          {!hasSearched && (
            <div className="text-center py-16 text-[#aaaaaa]">
              <Search className="size-12 mx-auto mb-3 opacity-40" aria-hidden="true" />
              <p className="text-sm">Lancez une recherche pour afficher les résultats.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
