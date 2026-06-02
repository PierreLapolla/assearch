"use client";

import "@/bones/registry";
import { useState } from "react";
import { MapPin, Globe, Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/types";

const POSITION_CONFIG = {
  A: {
    label: "Active",
    className: "text-badge-success bg-badge-success-bg border-badge-success-border",
  },
  D: {
    label: "Dissoute",
    className: "text-badge-warning bg-badge-warning-bg border-badge-warning-border",
  },
  S: {
    label: "Supprimée",
    className: "text-destructive bg-destructive/10 border-destructive/30",
  },
} satisfies Record<string, { label: string; className: string }>;

const GROUPEMENT_LABELS: Record<string, string> = {
  S: "Association simple",
  U: "Union",
  F: "Fédération",
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

/** Returns a validated absolute http/https URL, or null if invalid/unparseable. */
function normalizeUrl(url: string | null): string | null {
  if (!url?.trim()) return null;
  const candidate = url.startsWith("http") ? url : `https://${url}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}


interface Props {
  result?: SearchResult;
  loading?: boolean;
}

export function AssociationCard({ result, loading = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isLegacy = result?.source === "import";
  const posConfig =
    result?.position && result.position in POSITION_CONFIG
      ? POSITION_CONFIG[result.position as keyof typeof POSITION_CONFIG]
      : null;
  const groupLabel = result?.groupement
    ? GROUPEMENT_LABELS[result.groupement]
    : null;
  const dateCreat = formatDate(result?.date_creat ?? null);
  const dateDisso = formatDate(result?.date_disso ?? null);
  const website = normalizeUrl(result?.website ?? null);
  const websiteOk = result?.website_ok ?? null;

  const longDescription = (result?.description?.length ?? 0) > 220;
  const descriptionText =
    longDescription && !expanded
      ? result!.description!.slice(0, 220) + "…"
      : result?.description;

  const hasMeta =
    result?.address ||
    result?.city ||
    result?.postal_code ||
    dateCreat ||
    dateDisso ||
    website;

  return (
    <Skeleton name="association-card" loading={loading} animate="shimmer">
      <article className="bg-card border border-border border-l-4 border-l-primary p-5 transition-shadow hover:shadow-md">
        {/* Title row */}
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <h2 className="flex-1 min-w-0 text-base font-bold text-primary leading-snug">
            {result?.title ?? "Sans titre"}
          </h2>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {isLegacy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-badge-warning bg-badge-warning-bg border border-badge-warning-border cursor-help">
                    Données historiques
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-60 text-center">
                  Ces données proviennent de l&apos;ancien répertoire et n&apos;ont pas été mises
                  à jour depuis 2009.
                </TooltipContent>
              </Tooltip>
            )}
            {posConfig && (
              <span
                className={cn(
                  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border",
                  posConfig.className,
                )}
              >
                {posConfig.label}
              </span>
            )}
          </div>
        </div>

        {/* Groupement */}
        {groupLabel && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Users className="size-3" aria-hidden="true" />
            {groupLabel}
          </p>
        )}

        {/* Description */}
        {result?.description && (
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            {descriptionText}
            {longDescription && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  {expanded ? "Voir moins" : "Voir plus"}
                </button>
              </>
            )}
          </p>
        )}

        {/* Address + meta */}
        {hasMeta && (
          <div className="border-t border-border pt-3 mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {(result?.address || result?.city || result?.postal_code) && (
              <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
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
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3 text-primary" aria-hidden="true" />
                Créée le {dateCreat}
              </span>
            )}
            {dateDisso && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <Clock className="size-3" aria-hidden="true" />
                Dissoute le {dateDisso}
              </span>
            )}
            {website && (
              websiteOk === false ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground line-through hover:no-underline opacity-60"
                    >
                      <Globe className="size-3" aria-hidden="true" />
                      {safeHostname(website)}
                      <ExternalLink className="size-2.5" aria-hidden="true" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-52 text-center">
                    Ce lien semble inaccessible — les données RNA peuvent être obsolètes.
                  </TooltipContent>
                </Tooltip>
              ) : (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Globe className="size-3" aria-hidden="true" />
                  {safeHostname(website)}
                  <ExternalLink className="size-2.5 opacity-60" aria-hidden="true" />
                </a>
              )
            )}

          </div>
        )}

      </article>
    </Skeleton>
  );
}
