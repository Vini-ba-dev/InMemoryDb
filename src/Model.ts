import { z } from "zod";
import { ErrorHandling } from "./ErrorHandling";
import {
  Query,
  Modifier,
  GroupBy,
  LogMsg,
  unknownObj,
  Mapped,
  _0bject,
} from "./types";

export class Model<T extends object> {
  private schema: z.ZodObject<any>;
  private model: T[];
  log: LogMsg[];
  constructor(schema: z.ZodObject<any>) {
    this.schema = schema;
    this.model = [];
    this.log = [];
  }

  private where(item: unknownObj, { where }: any) {
    const testForEachParam = [];
    for (const queryFieldsIndex in where) {
      const value = where[queryFieldsIndex].value;
      const modifier = where[queryFieldsIndex].modifier;
      const field = where[queryFieldsIndex].field;

      switch (modifier) {
        case Modifier.start:
          testForEachParam.push(String(item[field]).startsWith(String(value)));
          continue;
        case Modifier.end:
          testForEachParam.push(String(item[field]).endsWith(String(value)));
          continue;
        case Modifier.has:
          testForEachParam.push(String(item[field]).includes(String(value)));
          continue;
        case Modifier.exclude:
          testForEachParam.push(!String(item[field]).includes(String(value)));
          continue;
        default:
          if (item[field] == value) {
            testForEachParam.push(true);
            continue;
          }
      }
      testForEachParam.push(false);
    }
    return testForEachParam.every((filedlReturn) => filedlReturn == true);
  }
  private grouping(
    objectArray: unknownObj[],
    properties: string[],
    target: string,
    sumName: string
  ) {
    /***
     * Original code from: Hannah
     * at: https://dev.to/ketoaustin/sql-group-by-using-javascript-34og
     */

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

      accumulator.get(key).set("Count", accumulator.get(key).get("Count") + 1);

      return accumulator;
    }, new Map());
  }

  create(data: T): void {
    try {
      ErrorHandling("create", "data", data, this.schema);

      const date = new Date();

      this.model.push(data);

      this.log.push({
        date,
        operationType: "create",
        queryUsed: data,
      });
    } catch (error: any) {
      console.error(error);
    }
  }
  createMany(data: T[]) {
    try {
      data.forEach((n) => {
        ErrorHandling("createMany", "data", n, this.schema);

        this.model.push(n);

        const date = new Date();
        this.log.push({
          date,
          operationType: "create",
          queryUsed: data,
        });
      });
    } catch (error: any) {
      console.error(error);
    }
  }
  findFirst(data: Query): T | undefined {
    for (let index in this.model) {
      let item = this.model[index];
      if (this.where(item as unknownObj, data)) {
        return item;
      }
    }
  }
  findMany(data: Query): T[] {
    const filtered = [];

    for (let index in this.model) {
      let item = this.model[index];
      if (this.where(item as unknownObj, data)) {
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
        if (this.where(this.model[index] as unknownObj, data)) {
          const valuesParamenters = data.data;

          const updateKeys = Object.keys(valuesParamenters);
          const updateValues = Object.values(valuesParamenters);

          updateKeys.forEach((key, i) => {
            //@ts-ignore
            this.model[index][key] = updateValues[i];
          });
          const date = new Date();
          this.log.push({
            date,
            operationType: "update",
            queryUsed: data.data,
          });

          return;
        }
      }

      throw new Error("Query not found results");
    } catch (error: any) {
      console.error(error);
    }
  }
  updateMany(data: { where: Query; data: Partial<T> }) {
    const partialUserSchema = this.schema.partial();

    try {
      ErrorHandling("update", "data", data.data, partialUserSchema);

      let results = false;
      for (let index in this.model) {
        if (this.where(this.model[index] as unknownObj, data)) {
          results = true;
          const valuesParamenters = data.data;

          const updateKeys = Object.keys(valuesParamenters);
          const updateValues = Object.values(valuesParamenters);

          updateKeys.forEach((key, i) => {
            //@ts-ignore
            this.model[index][key] = updateValues[i];
          });

          const date = new Date();
          this.log.push({
            date,
            operationType: "updateMany",
            queryUsed: data.data,
          });
        }
      }
      if (!results) throw new Error("Query not found results");
    } catch (error: any) {
      console.error(error);
    }
  }
  groupBy(data: GroupBy) {
    const filtered = this.findMany(data.where) as unknownObj[];
    if (filtered.length == 0) {
      throw new Error("Query not found results");
    }

    const sumName = "Sum_of_" + data.target;
    const result = this.grouping(filtered, data.by, data.target, sumName);
    const extractingValues = Array.from(result.values());

    extractingValues.forEach((element: Mapped) => {
      let avg = element.get(sumName) / element.get("Count");
      element.set("avg", avg);
    });

    // return extractingValues;
    // return extractingValues;
    //Convert each element in an simple obj
    return extractingValues.map((mapped: _0bject) => {
      let mp = mapped.entries();
      return Object.fromEntries(mp);
    });
  }
}
