// /lib/print/types.ts

export type PrintMetaItem = {
  label: string;
  value: string;
};

export type PrintKeyValueItem = {
  key: string;
  value: string;
};

export type PrintTableRow = (string | number | null)[];

// Innholdsblokker som kan brukes i en seksjon
export type PrintContentBlock =
  | { type: "paragraph"; text: string }
  | {
      type: "keyValueList";
      items: PrintKeyValueItem[];
      columns?: 1 | 2;
    }
  | {
      type: "table";
      headers: string[];
      rows: PrintTableRow[];
    };

// En seksjon i rapporten
export type PrintSection = {
  id: string;
  title?: string;
  content: PrintContentBlock[];
};

// Hele rapporten
export type PrintData = {
  title: string;
  subtitle?: string;
  meta?: PrintMetaItem[];
  sections: PrintSection[];
};
