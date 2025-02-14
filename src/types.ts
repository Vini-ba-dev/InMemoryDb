export enum Modifier {
  end = "end",
  start = "start",
  has = "has",
  exclude = "exclude",
}

export type Query = [
  { field: string; value: string | number; modifier?: Modifier }
];

export type GroupBy = {
  by: string[];
  where: Query;
  type: string;
  target: string;
};

export type ModelType = {
  [i: string]: unknown;
};

export type LogMsg = {
  date: Date;
  method: string;
  query: any;
};

export type unknownObj = {
  [i: string]: unknown;
};

export type Mapped = {
  set: (arg1: string, arg2: unknown) => void;
  get: (arg: string) => number;
};

export type _0bject = {
  entries: () => unknown[][];
};
