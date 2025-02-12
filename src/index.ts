import { Db } from "./Db";
import { z } from "zod";
import { users } from "./Mocks";
import { Modifier } from "./types";

const UserSchema = z.object({
  id: z.number().int(),
  name: z.string().min(2),
  age: z.number().int().min(18, { message: "Min. must be 18" }),
  email: z.string().email({ message: "Should be a valid e-mail" }),
  type: z.enum(["admin", "common"]),
  country: z.string().min(2),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const client = new Db();

client.CreateModel("users", UserSchema);
users.forEach((user) => client.model.users.create(user));
