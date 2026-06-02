"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, MapPin, Globe, Calendar, Users, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const POSITION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  A: { label: "Active", variant: "default" },
  D: { label: "Dissoute", variant: "secondary" },
  S: { label: "Supprimée", variant: "destructive" },
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
  const posInfo = result?.position ? POSITION_LABELS[result.position] : null;
  const groupLabel = result?.groupement ? GROUPEMENT_LABELS[result.groupement] : null;
  const dateCreat = formatDate(result?.date_creat ?? null);
  const dateDisso = formatDate(result?.date_disso ?? null);
  const website = formatWebsite(result?.website ?? null);
  const longDescription = result?.description && result.description.length > 220;
  const descriptionText =
    longDescription && !expanded ? result!.description!.slice(0, 220) + "…" : result?.description;

  return (
    <Skeleton name="association-card" loading={loading} animate="shimmer">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start gap-2">
            <CardTitle className="text-base font-semibold leading-snug flex-1 min-w-0">
              {result?.title ?? "Sans titre"}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {isLegacy && (
                <Badge
                  variant="outline"
                  className="text-xs text-amber-600 border-amber-300 bg-amber-50"
                >
                  Historique
                </Badge>
              )}
              {posInfo && (
                <Badge variant={posInfo.variant} className="text-xs">
                  {posInfo.label}
                </Badge>
              )}
            </div>
          </div>
          {groupLabel && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Users className="size-3" />
              {groupLabel}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {result?.description && (
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{descriptionText}</p>
              {longDescription && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary hover:underline mt-1 cursor-pointer"
                >
                  {expanded ? "Voir moins" : "Voir plus"}
                </button>
              )}
            </div>
          )}

          {(result?.address || result?.city || result?.postal_code) && (
            <>
              <Separator />
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 mt-0.5 shrink-0" />
                <span>
                  {[
                    result.address,
                    result.city && result.postal_code
                      ? `${result.city} (${result.postal_code})`
                      : (result.city ?? result.postal_code),
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                </span>
              </div>
            </>
          )}

          {(dateCreat || dateDisso || website) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {dateCreat && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    Créée le {dateCreat}
                  </span>
                )}
                {dateDisso && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-600">
                    <Clock className="size-3" />
                    Dissoute le {dateDisso}
                  </span>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Globe className="size-3" />
                    {safeHostname(website)}
                  </a>
                )}
              </div>
            </>
          )}

          {isLegacy && (
            <div className="flex items-start gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              Ces données proviennent de l&apos;ancien répertoire et n&apos;ont pas été mises à
              jour depuis 2009.
            </div>
          )}
        </CardContent>
      </Card>
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Assearch</h1>
          <p className="text-sm text-muted-foreground">
            Recherchez parmi les associations françaises du Répertoire National des Associations
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, objet, ville, code postal…"
                className="pl-9"
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? "Recherche…" : "Rechercher"}
            </Button>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Switch
              id="legacy-toggle"
              checked={includeLegacy}
              onCheckedChange={setIncludeLegacy}
            />
            <label htmlFor="legacy-toggle" className="cursor-pointer select-none">
              Inclure les associations historiques (avant 2009)
            </label>
          </div>
        </form>

        {!loading && total !== null && (
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "Aucun résultat pour cette recherche."
              : `${total.toLocaleString("fr-FR")} résultat${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`}
          </p>
        )}

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <AssociationCard key={i} loading={true} />
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((r) => (
              <AssociationCard key={r.id} result={r} />
            ))}
          </div>
        )}

        {!loading && hasSearched && total === 0 && (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <Search className="size-10 mx-auto opacity-30" />
            <p className="text-sm">Aucune association trouvée.</p>
            {!includeLegacy && (
              <p className="text-xs">
                Essayez d&apos;activer les données historiques pour élargir la recherche.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
