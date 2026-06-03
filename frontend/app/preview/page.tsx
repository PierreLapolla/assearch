/**
 * Dev-only page for boneyard skeleton capture.
 * Renders AssociationCard with loading={false} so boneyard can snapshot
 * the real layout geometry. Run `npx boneyard-js build --url http://localhost:3001`
 *
 * NoSSR is required: boneyard adds data-boneyard-content server-side but not
 * during hydration, causing React hydration warnings without it.
 */
import { NoSSR } from "@/components/no-ssr";
import { AssociationCard } from "@/components/association-card";
import type { SearchResult } from "@/lib/types";

/* Representative sample cards — first card determines skeleton geometry. */
const SAMPLE_RESULTS: SearchResult[] = [
  {
    id: "preview:1",
    score: 1,
    source: "waldec",
    title: "Association pour la promotion des arts vivants et des pratiques culturelles en milieu urbain",
    description:
      "Développement et promotion des pratiques artistiques et culturelles dans les quartiers prioritaires de la politique de la ville. Organisation de résidences d'artistes, ateliers participatifs, expositions et spectacles vivants tout au long de l'année pour les habitants.",
    address: "45 avenue de la République, Bâtiment C",
    city: "Marseille",
    postal_code: "13003",
    website: "https://example-association.fr",
    date_creat: "2001-09-12",
    date_disso: null,
    position: "A",
    nature: "D",
    groupement: "S",
  },
  {
    id: "preview:2",
    score: 1,
    source: "waldec",
    title: "Union des associations du bassin versant de la Loire",
    description:
      "Coordination des actions environnementales menées par les associations riveraines.",
    address: null,
    city: "Orléans",
    postal_code: "45000",
    website: null,
    date_creat: "1998-06-01",
    date_disso: "2019-11-30",
    position: "D",
    nature: "D",
    groupement: "U",
  },
  {
    id: "preview:3",
    score: 1,
    source: "import",
    title: "Société de secours mutuels des ouvriers chapeliers de Paris",
    description: "Association de bienfaisance fondée au XIXe siècle.",
    address: "Rue du Faubourg Saint-Antoine",
    city: "Paris",
    postal_code: "75012",
    website: null,
    date_creat: null,
    date_disso: null,
    position: "A",
    nature: "D",
    groupement: "S",
  },
];

export default function PreviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <p className="text-xs text-muted-foreground border border-dashed border-border rounded px-3 py-2">
        Page de capture boneyard{" — "}uniquement visible en développement.
      </p>
      <NoSSR>
        {SAMPLE_RESULTS.map((r) => (
          <AssociationCard key={r.id} result={r} />
        ))}
      </NoSSR>
    </div>
  );
}
