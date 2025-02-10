import { z } from "zod";
import { formatZodError } from "./ErrorHandling";

export class Table<T extends object> {
  private schema: z.ZodObject<any>;
  table: any[];

  constructor(schema: z.ZodObject<any>) {
    this.schema = schema;
    this.table = [];
  }

  create(data: T): void {
    try {
      const parsedData = this.schema.parse(data);
      this.table.push(parsedData);
    } catch (error: any) {
      console.error(formatZodError(error));
    }
  }
  createMany(data: T[]) {
    try {
      data.forEach((n) => {
        const parsedData = this.schema.parse(n);
        this.table.push(parsedData);
      });
    } catch (error: any) {
      console.error(formatZodError(error));
    }
  }
  findMany(data: { where: Partial<T> }): T[] {
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
  findFirst(data: { where: Partial<T> }): T {
    const queryParamenters = data.where;
    const keys = Object.keys(queryParamenters);
    const values = Object.values(queryParamenters);

    const queryResult = this.table.find((line) => {
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
