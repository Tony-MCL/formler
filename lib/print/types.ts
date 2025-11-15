export type PrintMetaItem = {
  label: string;
  value: string;
};

export type PrintKeyValue = {
  key: string;
  value: string;
};

export type PrintTableCell = {
  value: string;
  align?: "left" | "center" | "right";
};

export type PrintTableRow = {
  cells: PrintTableCell[];
};

export type PrintTableBlock = {
  type: "table";
  headers?: string[];
  rows: PrintTableRow[];
};

export type PrintParagraphBlock = {
  type: "paragraph";
  text: string;
};

export type PrintKeyValueListBlock = {
  type: "keyValueList";
  items: PrintKeyValue[];
  columns?: 1 | 2;
};

export type PrintContentBlock =
  | PrintParagraphBlock
  | PrintTableBlock
  | PrintKeyValueListBlock;

export type PrintSection = {
  id: string;
  title?: string;
  content: PrintContentBlock[];
};

export type PrintData = {
  title: string;
  subtitle?: string;
  meta?: PrintMetaItem[];
  sections: PrintSection[];
};
