export interface SearchResult {
  id: string;
  score: number;
  source: string | null;
  title: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  website: string | null;
  website_ok: boolean | null;
  date_creat: string | null;
  date_disso: string | null;
  position: string | null;
  nature: string | null;
  groupement: string | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  total_capped: boolean;
  results: SearchResult[];
}
