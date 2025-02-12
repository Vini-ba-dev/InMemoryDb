import { z } from "zod";
import { ErrorHandling } from "./ErrorHandling";
import { Query, Modifier, GroupBy } from "./types";

export class Model<T extends object> {
  private schema: z.ZodObject<any>;
  model: T[];

  constructor(schema: z.ZodObject<any>) {
    this.schema = schema;
    this.model = [];
  }

  private where(item: any, { where }: any) {
    const testForEachParam = [];
    for (const queryFieldsIndex in where) {
      const value = where[queryFieldsIndex].value;
      const modifier = where[queryFieldsIndex].modifier;
      const field = where[queryFieldsIndex].field;

      if (modifier != undefined)
        switch (modifier) {
          case Modifier.start:
            testForEachParam.push(
              String(item[field]).startsWith(String(value))
            );
          case Modifier.end:
            testForEachParam.push(String(item[field]).endsWith(String(value)));
          case Modifier.has:
            testForEachParam.push(String(item[field]).includes(String(value)));
          case Modifier.exclude:
            testForEachParam.push(!String(item[field]).includes(String(value)));

            continue;
        }
      if (item[field] == value) {
        testForEachParam.push(true);
        continue;
      }
      testForEachParam.push(false);
    }
    return testForEachParam.every((filedlReturn) => filedlReturn == true);
  }
  create(data: T): void {
    try {
      ErrorHandling("create", "data", data, this.schema);

      this.model.push(data);
    } catch (error: any) {
      console.error(error);
    }
  }
  createMany(data: T[]) {
    try {
      data.forEach((n) => {
        ErrorHandling("createMany", "data", n, this.schema);

        this.model.push(n);
      });
    } catch (error: any) {
      console.error(error);
    }
  }
  findFirst(data: Query): T | undefined {
    for (let index in this.model) {
      let item = this.model[index];
      if (this.where(item, data)) {
        return item;
      }
    }
  }
  findMany(data: Query): T[] {
    const filtered = [];

    for (let index in this.model) {
      let item = this.model[index];
      if (this.where(item, data)) {
        filtered.push(item);
      }
    }
    return filtered;
  }
  update(data: { where: Query; data: Partial<T> }) {
    const partialUserSchema = this.schema.partial();

    try {
      ErrorHandling("update", "data", data.data, partialUserSchema);

      for (let index in this.model) {
        if (this.where(this.model[index], data)) {
          const valuesParamenters = data.data;

          const updateKeys = Object.keys(valuesParamenters);
          const updateValues = Object.values(valuesParamenters);

          updateKeys.forEach((key, i) => {
            //@ts-ignore
            this.model[index][key] = updateValues[i];
          });

          return;
        }
      }

      throw new Error("Query not found results");
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

      for (let index = 0; index < this.model.length; index++) {
        //@ts-ignore
        if (this.model[index][keys[0]] == values[0]) {
          updateKeys.forEach((n, i) => {
            //@ts-ignore
            this.model[index][n] = updatsValues[i];
          });
        }
      }
    } catch (error: any) {
      console.error(error);
    }
  }
  groupBy(data: GroupBy) {
    const filtered = this.findMany(data.where);
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
