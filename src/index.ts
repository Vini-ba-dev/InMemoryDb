import { Db } from "./Db";
import { z } from "zod";
import { users } from "./Mocks";

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
// client.model.users.createMany([users[3], users[0]]);

// const t1 = client.model.users.findMany({
//   where: {
//     age: 30,
//     type: "common",
//   },
// });

// const t2 = client.model.users.findFirst({
//   where: {
//     age: 30,
//     type: "common",
//   },
// });

// console.log(client.model.users.table[0]);

// const t3 = client.model.users.update({
//   where: {
//     id: 1,
//     age: 26,
//   },
//   data: { age: 26, type: "common" },
// });

// console.log(client.model.users.table[0]);
// console.log(client.model.users.table[2]);
// const t4 = client.model.users.updateMany({
//   where: {
//     type: "admin",
//   },
//   data: { age: 26, type: "common" },
// });

// console.log(client.model.users.table[2]);

// const t5 = client.model.users.count({
//   where: {
//     type: "admin",
//   },
// });

// console.log(t5);

// const t6 = client.model.users.findMany({
//   where: [
//     {
//       field: "age",
//       value: 25,
//       modifier: "exclude",
//     },
//     // {
//     //   field: "name",
//     //   value: "Bob",
//     //   modifier: "start",
//     // },
//     {
//       field: "email",
//       value: "example",
//       modifier: "has",
//     },
//   ],
// });

// console.log(t6);

// const t6 = client.model.users.groupBy({
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

// console.log(t6);
