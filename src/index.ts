import { Db } from "./Db";
import { z } from "zod";
import { users } from "./Mocks";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().min(18, { message: "Min. must be 18" }),
  email: z.string().email({ message: "Should be a valid e-mail" }),
  type: z.string(), //admin ou common
});

const client = new Db();

client.CreateATable("users", UserSchema);
users.forEach((user) => client.tables.users.create(user));

client.tables.users.insert(users[0]);
client.tables.users.createMany([users[3], users[0]]);

const t = client.tables.users.findUnique({
  where: {
    age: 30,
    type: "common",
  },
});
