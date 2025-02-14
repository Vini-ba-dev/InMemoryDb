import {
  Query,
  Modifier,
  GroupBy,
  LogMsg,
  unknownObj,
  Mapped,
  _0bject,
} from "./types";

export class Model<T> {
  private model: T[];
  private logs: string[];
  private versions: T[][];
  constructor() {
    this.model = [];
    this.logs = [];
    this.versions = [[], []];
  }
  private createLog(data: LogMsg) {
    const log = `| ${data.date} | method use: ${data.method} | query: ${data.query} | changes: ${data.changes} | status: ${data.status}|`;
    this.logs.push(log);
  }
  readLogs() {
    return this.logs;
  }
  getAll() {
    return this.model;
  }
  getVersions() {
    return this.versions;
  }
  createVersion() {
    const h = structuredClone(this.model);
    this.versions.push(h);
    this.versions.shift();
  }

  private where(item: unknownObj, where: Query) {
    for (const queryFieldsIndex in where) {
      const value = where[queryFieldsIndex].value;
      const modifier = where[queryFieldsIndex].modifier;
      const field = where[queryFieldsIndex].field;

      switch (modifier) {
        case Modifier.start:
          if (!String(item[field]).startsWith(String(value))) return false;
          continue;
        case Modifier.end:
          if (!String(item[field]).endsWith(String(value))) return false;
          continue;
        case Modifier.has:
          if (!String(item[field]).includes(String(value))) return false;
          continue;
        case Modifier.exclude:
          if (String(item[field]).includes(String(value))) return false;
          continue;
        default:
          if (item[field] != value) return false;
      }
    }
    return true;
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
    const date = new Date();

    this.createVersion();
    this.model.push(data);

    this.createLog({
      date,
      method: "create",
      query: "",
    });
  }
  createMany(data: T[]) {
    const date = new Date();

    data.forEach((n) => {
      this.model.push(n);
    });
    this.createLog({
      date,
      method: "createMany",
      query: "",
    });
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
    const date = new Date();

    this.createVersion();

    for (let index in this.model) {
      if (this.where(this.model[index] as unknownObj, data.where)) {
        const valuesParamenters = data.data;

        const updateKeys = Object.keys(valuesParamenters);
        const updateValues = Object.values(valuesParamenters);

        updateKeys.forEach((key, i) => {
          //@ts-ignore
          this.model[index][key] = updateValues[i];
        });

        this.createLog({
          date,
          method: "update",
          query: JSON.stringify(data.where),
        });
        return;
      }
    }
  }
  updateMany(data: { where: Query; data: Partial<T> }) {
    const date = new Date();

    let results = false;
    let acc = 0;
    for (let index in this.model) {
      if (this.where(this.model[index] as unknownObj, data.where)) {
        acc++;
        results = true;
        const valuesParamenters = data.data;

        const updateKeys = Object.keys(valuesParamenters);
        const updateValues = Object.values(valuesParamenters);

        updateKeys.forEach((key, i) => {
          //@ts-ignore
          this.model[index][key] = updateValues[i];
        });
      }
    }
    this.createLog({
      date,
      method: "updateMany",
      query: JSON.stringify(data.where),
    });
  }
  delete(data: { where: Query }) {
    const date = new Date();

    for (let index in this.model) {
      if (this.where(this.model[Number(index)] as unknownObj, data.where)) {
        console.log(this.model.splice(Number(index), 1));

        this.createLog({
          date,
          method: "delete",
          query: JSON.stringify(data.where),
        });
        return;
      }
    }
  }
  deleteMany(data: { where: Query }) {
    const date = new Date();

    let acc = 0;
    for (let index in this.model) {
      if (this.where(this.model[index] as unknownObj, data.where)) {
        acc++;
        console.log(this.model.splice(Number(index), 1));
      }
    }
    this.createLog({
      date,
      method: "deleteMany",
      query: JSON.stringify(data.where),
    });
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
    //Convert each element in an simple obj
    return extractingValues.map((mapped: _0bject) => {
      return Object.fromEntries(mapped.entries());
    });
  }
}
