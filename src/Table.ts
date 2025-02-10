import { z } from "zod";
import { ErrorHandling } from "./ErrorHandling";

export class Table<T extends object> {
  private schema: z.ZodObject<any>;
  table: any[];

  constructor(schema: z.ZodObject<any>) {
    this.schema = schema;
    this.table = [];
  }

  create(data: T): void {
    try {
      ErrorHandling("create", "data", data, this.schema);

      this.table.push(data);
    } catch (error: any) {
      console.error(error);
    }
  }
  createMany(data: T[]) {
    try {
      data.forEach((n) => {
        ErrorHandling("createMany", "data", n, this.schema);

        this.table.push(n);
      });
    } catch (error: any) {
      console.error(error);
    }
  }
  findMany(data: { where: Partial<T> }): T[] | undefined {
    const partialUserSchema = this.schema.partial();
    try {
      ErrorHandling("findMany", "where", data.where, partialUserSchema);

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
    } catch (error: any) {
      console.error(error);
    }
  }
  findFirst(data: { where: Partial<T> }): T | undefined {
    const partialUserSchema = this.schema.partial();
    try {
      ErrorHandling("findFirst", "where", data.where, partialUserSchema);
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
    } catch (error: any) {
      console.error(error);
    }
  }
  update(data: { where: Partial<T>; data: Partial<T> }) {
    const partialUserSchema = this.schema.partial();

    try {
      ErrorHandling("update", "where", data.where, partialUserSchema);
      ErrorHandling("update", "data", data.data, partialUserSchema);
      // partialUserSchema.parse(data.where);

      // const test = partialUserSchema.safeParse(data.data);

      // const queryParamenters = data.where;

      // const key = Object.keys(queryParamenters);
      // const value = Object.values(queryParamenters);

      // const index = this.table.findIndex((n) => n.key == value);
    } catch (error: any) {
      console.error(error);
    }
  }
}
