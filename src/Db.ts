import { z } from "zod";
import { Model } from "./Model";

export class Db {
  model: any;
  constructor() {
    this.model = {};
  }
  CreateModel(name: string, schema: z.ZodObject<any>) {
    type zt = z.infer<typeof schema>;
    this.model[name] = new Model<zt>(schema);
  }
}
