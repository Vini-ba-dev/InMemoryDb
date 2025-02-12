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
  findFirst(data: Query): T | undefined {
    const queryParamenters = data.where;
    return this.table.find((item: any) => {
      const testForEachParam = [];
      for (const queryFieldsIndex in queryParamenters) {
        const value = queryParamenters[queryFieldsIndex].value;
        const modifier = queryParamenters[queryFieldsIndex].modifier;
        const field = queryParamenters[queryFieldsIndex].field;

        if (modifier != undefined)
          switch (modifier) {
            case Modifier.start:
              testForEachParam.push(
                String(item[field]).startsWith(String(value))
              );
            case Modifier.end:
              testForEachParam.push(
                String(item[field]).endsWith(String(value))
              );
            case Modifier.has:
              testForEachParam.push(
                String(item[field]).includes(String(value))
              );
            case Modifier.exclude:
              testForEachParam.push(
                !String(item[field]).includes(String(value))
              );

              continue;
          }
        if (item[field] == value) {
          testForEachParam.push(true);
          continue;
        }
        testForEachParam.push(false);
      }
      return testForEachParam.every((filedlReturn) => filedlReturn == true);
    });
  }
  findMany(data: Query): T[] {
    const queryParamenters = data.where;

    const filtered = [];

    for (var tableIndex in this.table) {
      //For each param, test if
      //has a modifier and if it checks if search

      const testForEachParam = [];
      const line: any = this.table[tableIndex];

      for (const queryFieldsIndex in queryParamenters) {
        const value = queryParamenters[queryFieldsIndex].value;
        const modifier = queryParamenters[queryFieldsIndex].modifier;
        const field = queryParamenters[queryFieldsIndex].field;

        if (modifier != undefined)
          switch (modifier) {
            case Modifier.start:
              testForEachParam.push(
                String(line[field]).startsWith(String(value))
              );
            case Modifier.end:
              testForEachParam.push(
                String(line[field]).endsWith(String(value))
              );
            case Modifier.has:
              testForEachParam.push(
                String(line[field]).includes(String(value))
              );
            case Modifier.exclude:
              testForEachParam.push(
                !String(line[field]).includes(String(value))
              );

              continue;
          }
        if (line[field] == value) {
          testForEachParam.push(true);
          continue;
        }
        testForEachParam.push(false);
      }
      //return final result for filter method,
      //by check all tests in an array of responses
      if (testForEachParam.every((filedlReturn) => filedlReturn == true)) {
        filtered.push(line);
      }
    }
    return filtered;
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
