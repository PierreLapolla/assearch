/**
 * Dev-only page for boneyard skeleton capture.
 * Renders AssociationCard with loading={false} so boneyard can snapshot
 * the real layout geometry. Run `npx boneyard-js build` while this page
 * is reachable at /preview.
 */
import { AssociationCard } from "@/components/association-card";

const SAMPLE_RESULTS = [
  {
    id: "preview:1",
    score: 1,
    source: "waldec",
    title: "Association sportive de la Bastille",
    description:
      "Promotion des activités sportives et culturelles pour les habitants du 11e arrondissement. Organisation de tournois, ateliers et événements communautaires tout au long de l'année.",
    address: "12 RUE de la Roquette",
    city: "Paris",
    postal_code: "75011",
    website: "https://example.org",
    date_creat: "2005-03-15",
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
      "Coordination des actions environnementales menées par les associations riveraines sur l'ensemble du bassin versant.",
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
] as const;

export default function PreviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <p className="text-xs text-muted-foreground border border-dashed border-border rounded px-3 py-2">
        Page de capture boneyard{" — "}uniquement visible en développement.
      </p>
      {SAMPLE_RESULTS.map((r) => (
        <AssociationCard key={r.id} result={r} />
      ))}
    </div>
  );
}
