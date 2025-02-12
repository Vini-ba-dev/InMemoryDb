export enum Modifier {
  end = "end",
  start = "start",
  has = "has",
  exclude = "exclude",
}

export type Query = {
  where: [{ field: string; value: string | number; modifier?: Modifier }];
};

export type GroupBy = {
  by: string[];
  where: Query;
  type: string;
  target: string;
};
