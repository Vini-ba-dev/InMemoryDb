import { z } from "zod";

class Table<T extends object> {
  private schema: z.ZodObject<any>;
  table: any[];

  constructor(schema: z.ZodObject<any>) {
    this.schema = schema;
    this.table = [];
  }
  insert(data: T): void {
    try {
      const parsedData = this.schema.parse(data);
      this.table.push(parsedData);
    } catch (error) {
      console.error(error);
    }
  }
}
