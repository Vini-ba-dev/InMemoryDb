The aim of this project is to create a micro database to be used at runtime.
My motivation is to have a better way of controlling my JS collections, both for reading and creating objects.

The database works like a collection of collections. We'll call each collection a “model”. The method names come from Prisma ORM, and I've tried to approximate its query structure.

> ⚠️ There is currently no way to create automatic IDs.

---

# Creating a schema

We'll need the Zod library to create our schemas. Schemas are used to validate creations in the collection.

```tsx
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
```

Then we'll import Db, which is the parent class that takes care of keeping the models centralized in a single instance.

```tsx
const client = new Db();
client.CreateModel("users", UserSchema);
```

---

## Criações

### client.model.users.create(user)

Creates a new record in the bank if it meets Zod's validations. Otherwise, it throws an error.

```tsx
client.tables.users.create({
   {
    id: 1,
    name: "Alice",
    age: 25,
    email: "alice@example.com",
    type: "admin",
    country: "USA",
    subscriptionPrice: 29.99,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-05T15:30:00Z",
  }
});

```

### client.model.users.createMany([users])

Creates new records in the bank if it meets Zod's validations. Otherwise, it throws an error.

```tsx
const newUsers = [
  {
    id: 1,
    name: "Alice",
    age: 25,
    email: "alice@example.com",
    type: "admin",
    country: "USA",
    subscriptionPrice: 29.99,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-05T15:30:00Z",
  },
  {
    id: 2,
    name: "Bob",
    age: 30,
    email: "bob@example.com",
    type: "common",
    country: "USA",
    subscriptionPrice: 19.99,
    createdAt: "2024-02-02T11:15:00Z",
    updatedAt: "2024-02-06T16:45:00Z",
  },
];

client.model.users.createMany(newUsers);
```

---

## Busca

Searches are query-based:

```tsx
//If nothing is passed, the value will be treated as equal (==)
export enum Modifier {
  end = "end",
  start = "start",
  has = "has",
  exclude = "exclude",
}

type Query = {
  where: [
    { field: string | number; value: string | number; modifier?: Modifier }
  ];
};
```

### client.model.users.findFirst(query)

Acha e retorna o primeiro objeto que corresponde a busca.

```tsx
const usersQueryReturn = client.model.users.findFirst({
  where: [
    {
      field: "age",
      value: 25,
    },
  ],
});
```

### client.model.users.findMany(query)

Finds and returns the first object that matches the search.

```tsx
const usersQueryReturn = client.model.users.findMany({
  where: [
    {
      field: "age",
      value: 25,
    },
  ],
});
```

---

## Atualizações

### client.model.users.update(query)

Updates the first object that matches the query.

```tsx
client.model.users.update({
  where: {
    id: 1,
    age: 26,
  },
  data: { age: 26, type: "common" },
});
```

### client.model.users.updateMany(query)

Updates all objects that match the query.

```tsx
client.model.users.updateMany({
  where: {
    type: "admin",
  },
  data: { type: "common" },
});
```

---

## Agregação

### client.model.users.groupBy(query)

Returns an array that is a summary of the objects that match the query.

```tsx
const group = client.model.users.groupBy({
  by: ["country", "age"],
  where: [
    {
      field: "age",
      value: 25,
      modifier: "exclude",
    },
    {
      field: "email",
      value: "example",
      modifier: "has",
    },
  ],
  target: "subscriptionPrice",
});

//console.log(group)
[
  {
    Sum_of_subscriptionPrice: 19.99,
    Count: 1,
    country: "USA",
    age: 30,
    avg: 19.99,
  },
  {
    Sum_of_subscriptionPrice: 74.97,
    Count: 3,
    country: "Germany",
    age: 40,
    avg: 24.99,
  },
];
```
