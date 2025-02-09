import { Db } from "./Db";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().min(18, { message: "Min. must be 18" }),
  email: z.string().email({ message: "Should be a valid e-mail" }),
});

const client = new Db();

client.CreateATable("users", UserSchema);

client.tables.users.insert({
  age: 18,
  name: "Vini",
  email: "test@email.com",
});

const t = client.tables.users.findUnique({
  where: {
    name: "Vini",
  },
});

console.log(t);
