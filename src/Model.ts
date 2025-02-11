import { z } from "zod";
import { ErrorHandling } from "./ErrorHandling";
import { Query, Modifier, GroupBy } from "./types";

export class Model<T extends object> {
  private schema: z.ZodObject<any>;
  table: T[];

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

      const queryResult = this.table.find((line: any) => {
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
  findMany(data: Query): T[] {
    const queryParamenters = data.where;

    const queryResult = this.table.filter((line: any) => {
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
              return !String(line[key.field]).includes(String(value));
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

      const index = this.table.findIndex((n: any) => n[keys[0]] == values[0]);

      if (index == -1) {
        throw new Error("Query not found results");
      }

      const valuesParamenters = data.data;

      const updateKeys = Object.keys(valuesParamenters);
      const updatsValues = Object.values(valuesParamenters);

      updateKeys.forEach((n, i) => {
        //@ts-ignore
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
        //@ts-ignore
        if (this.table[index][keys[0]] == values[0]) {
          updateKeys.forEach((n, i) => {
            //@ts-ignore
            this.table[index][n] = updatsValues[i];
          });
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  }
  groupBy(data: GroupBy) {
    const filtered = this.findMany(data);
    /***
     * Original code from: Hannah
     * at: https://dev.to/ketoaustin/sql-group-by-using-javascript-34og
     */

    //@ts-ignore
    const grouping = (objectArray, properties, target, sumName) => {
      //@ts-ignore
      return objectArray.reduce((accumulator, object) => {
        //@ts-ignore
        const values = properties.map((x) => object[x] || null);

        const key = JSON.stringify(values);
        if (!accumulator.has(key)) {
          accumulator.set(key, new Map());
          accumulator.get(key).set(sumName, 0);
          accumulator.get(key).set("Count", 0);

          properties.forEach(
            //@ts-ignore
            (agg, index) => accumulator.get(key).set(agg, values[index])
          );
        }

        accumulator
          .get(key)
          .set(sumName, accumulator.get(key).get(sumName) + object[target]);

        accumulator
          .get(key)
          .set("Count", accumulator.get(key).get("Count") + 1);

        return accumulator;
      }, new Map());
    };

    const sumName = "Sum_of_" + data.target;
    const result = grouping(filtered, data.by, data.target, sumName);
    const extractingValues = Array.from(result.values());

    extractingValues.forEach((element: any) => {
      element.set("avg", element.get(sumName) / element.get("Count"));
    });

    //Convert each element in an simple obj
    return extractingValues.map((obj: any) =>
      Object.fromEntries(obj.entries())
    );
  }
}
