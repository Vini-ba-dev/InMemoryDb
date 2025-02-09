import { z } from "zod";
import { formatZodError } from "./ErrorHandling";

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
    } catch (error: any) {
      console.error(formatZodError(error));
    }
  }
  findUnique(data: { where: Partial<T> }): T[] {
    const queryParamenters = data.where;
    const keys = Object.keys(queryParamenters);
    const values = Object.values(queryParamenters);

    const queryResult = this.table.filter((line) => {
      for (let key = 0; key < keys.length; key++) {
        if (line[keys[key]] != values[key]) {
          return false;
        }
      }
      return true;
    });
    return queryResult;
  }
}
