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

const query: Query = {
  where: [
    {
      field: "age",
      value: "20",
    },
  ],
};
