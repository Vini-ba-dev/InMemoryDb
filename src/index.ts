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

client.CreateATable("users", UserSchema);
users.forEach((user) => client.tables.users.create(user));

client.tables.users.create(users[0]);
// client.tables.users.createMany([users[3], users[0]]);

// const t1 = client.tables.users.findMany({
//   where: {
//     age: 30,
//     type: "common",
//   },
// });

// const t2 = client.tables.users.findFirst({
//   where: {
//     age: 30,
//     type: "common",
//   },
// });

// console.log(client.tables.users.table[0]);

// const t3 = client.tables.users.update({
//   where: {
//     id: 1,
//     age: 26,
//   },
//   data: { age: 26, type: "common" },
// });

// console.log(client.tables.users.table[0]);
// console.log(client.tables.users.table[2]);
// const t4 = client.tables.users.updateMany({
//   where: {
//     type: "admin",
//   },
//   data: { age: 26, type: "common" },
// });

// console.log(client.tables.users.table[2]);

// const t5 = client.tables.users.count({
//   where: {
//     type: "admin",
//   },
// });

// console.log(t5);

// const t6 = client.tables.users.findMany({
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

// const t6 = client.tables.users.groupBy({
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
