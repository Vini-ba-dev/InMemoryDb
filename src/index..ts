import { Db } from "./Db";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const client = new Db();

client.CreateATable("users", UserSchema);

client.tables.users.Create({
  age: 18,
  name: "Vini",
});

const t = client.tables.users.FindUnique({
  where: {
    name: "Vini",
  },
});

console.log(t);
