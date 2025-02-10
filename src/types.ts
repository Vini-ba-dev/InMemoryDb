export enum Modifier {
  end = "end",
  start = "start",
  has = "has",
  exclude = "exclude",
}

export type Query = {
  where: [
    { field: string | number; value: string | number; modifier?: Modifier }
  ];
};

export type GroupBy = {
  by: string[];
  where: [
    { field: string | number; value: string | number; modifier?: Modifier }
  ];
  type: string;
  target: string;
};
