export type Item = {
  id: number;
  name: string;
  priceCents: number;
  photoURL: string | null;
  description: string;
  location: string;
  purchases?: any[]; // keep as-is for now
};

export type ItemPayload = {
  name: string;
  priceCents: number;
  description: string;
  location: string;
  photoURL?: string | null;
};
