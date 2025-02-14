import { z } from "zod";
import { Model } from "./Model";

export class Db {
  model: any;
  constructor() {
    this.model = {};
  }
  CreateModel<T>(name: string) {
    this.model[name] = new Model<T>();
  }
}
