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

client.model.users.create(users[0]);
// console.log(client.model.users.model);
// const usersQueryReturn = client.model.users.findFirst({
//   where: [
//     {
//       field: "age",
//       value: 25,
//     },
//   ],
// });

// console.log(usersQueryReturn);

// client.model.users.update({
//   where: [
//     {
//       field: "age",
//       value: 25,
//     },
//   ],
//   data: {
//     age: 29,
//   },
// });

client.model.users.updateMany({
  where: [
    // {
    //   field: "type",
    //   value: "admin",
    // },
    {
      field: "name",
      value: "Al",
      modifier: Modifier.start,
    },
  ],
  data: { type: "common" },
});

console.log(client.model.users.log);
// const usersQueryReturn2 = client.model.users.findFirst({
//   where: [
//     {
//       field: "name",
//       value: "Alice",
//     },
//   ],
// });

// // console.log(usersQueryReturn2);

// const group = client.model.users.groupBy({
//   by: ["country", "age"],
//   where: [
//     {
//       field: "age",
//       value: 25,
//       modifier: "exclude",
//     },
//     {
//       field: "email",
//       value: "example",
//       modifier: "has",
//     },
//   ],
//   target: "subscriptionPrice",
// });

// console.log(group);
