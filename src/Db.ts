import { z } from "zod";
import { Table } from "./Table";

export class Db {
  tables: any;
  constructor() {
    this.tables = {};
  }
  CreateATable(name: string, schema: z.ZodObject<any>) {
    type zt = z.infer<typeof schema>;
    this.tables[name] = new Table<zt>(schema);
  }
}
