import { z } from "zod";
import { ErrorHandling } from "./ErrorHandling";
import { Query, Modifier } from "./types";

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
  findMany(data: Query): any {
    const queryParamenters = data.where;

    const queryResult = this.table.filter((line) => {
      //For each param, test if
      //has a modifier and if it checks if search
      const testForEachParam = queryParamenters.map((key, i) => {
        const value = queryParamenters[i].value;
        const modifier = queryParamenters[i].modifier;

        if (modifier != undefined)
          switch (modifier) {
            case Modifier.start:
              return String(line[key.field]).startsWith(String(value));
            case Modifier.end:
              return String(line[key.field]).endsWith(String(value));
            case Modifier.has:
              return String(line[key.field]).includes(String(value));
            case Modifier.exclude:
              return line[key.field] != queryParamenters[i].value;
          }
        if (line[key.field] == queryParamenters[i].value) {
          return true;
        } else {
          return false;
        }
      });

      //return final result for filter method,
      //by check all tests in an array of responses
      return testForEachParam.every((filedlReturn) => filedlReturn == true);
    });
    return queryResult;
  }
  update(data: { where: Partial<T>; data: Partial<T> }) {
    const partialUserSchema = this.schema.partial();

    try {
      ErrorHandling("update", "where", data.where, partialUserSchema);
      ErrorHandling("update", "data", data.data, partialUserSchema);

      const queryParamenters = data.where;

      const keys = Object.keys(queryParamenters);
      const values = Object.values(queryParamenters);

      const index = this.table.findIndex((n) => n[keys[0]] == values[0]);

      if (index == -1) {
        throw new Error("Query not found results");
      }

      const valuesParamenters = data.data;

      const updateKeys = Object.keys(valuesParamenters);
      const updatsValues = Object.values(valuesParamenters);

      updateKeys.forEach((n, i) => {
        this.table[index][n] = updatsValues[i];
      });
    } catch (error: any) {
      console.error(error);
    }
  }

  updateMany(data: { where: Partial<T>; data: Partial<T> }) {
    const partialUserSchema = this.schema.partial();

    try {
      ErrorHandling("updateMany", "where", data.where, partialUserSchema);
      ErrorHandling("updateMany", "data", data.data, partialUserSchema);

      const queryParamenters = data.where;

      const keys = Object.keys(queryParamenters);
      const values = Object.values(queryParamenters);

      const valuesParamenters = data.data;

      const updateKeys = Object.keys(valuesParamenters);
      const updatsValues = Object.values(valuesParamenters);

      for (let index = 0; index < this.table.length; index++) {
        if (this.table[index][keys[0]] == values[0]) {
          updateKeys.forEach((n, i) => {
            this.table[index][n] = updatsValues[i];
          });
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  }
}
