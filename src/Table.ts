import { z } from "zod";

export class Table<T extends object> {
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
  findUnique(data: { where: Partial<T> }): T[] {
    const queryParamenters = data.where;

    let queryresult: T[] = [];

    this.table.filter((line) => {
      for (const [key, value] of Object.entries(queryParamenters)) {
        if (line[key] == value) queryresult.push(line);
      }
    });

    return queryresult;
  }
}
