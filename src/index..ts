import { Db } from "./Db";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().length(1),
  age: z.number().int().min(18, { message: "Min. must be 18" }),
  email: z.string().email({ message: "Should be a valid e-mail" }),
});

const client = new Db();

client.CreateATable("users", UserSchema);

client.tables.users.insert({
  age: 18,
  name: "Vini",
});

const t = client.tables.users.FindUnique({
  where: {
    name: "Vini",
  },
});

console.log(t);
