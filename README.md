# Micro banco de dados em memória

O objetivo desse projeto é criar um micro banco de dados para ser usado em tempo de execução.
MInha motivação é ter uma forma melhor de controlar minhas coleções em JS, tanto para leitura quando criação de objetos.

O banco funciona como uma coleções de coleções. Chamaremos cada coleção de "model". Os nomes dos métodos vieram do Prisma ORM, e tentei me apróximar de sua estrutura de consulta.

=> No momento não há formas de criar IDs automaticos.

---

# Criando um schema

Vamos precisa da lib do Zod para criar nossos schemas. Os schemas são usado para valídar novas criações na coleção.

```ts
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

Depois vamos importar Db, que é a class pai que cuida de deixar os models centralizados numa única instância.

```ts
const client = new Db();
client.CreateModel("users", UserSchema);
```

## Criações

### client.model.users.create(user);

Cria um novo registro no banco, caso cumpra as valídações do Zod.

```ts
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

### client.model.users.createMany([users]);

Cria um novos registros no banco, caso cumpra as valídações do Zod.

```ts
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

As buscas são baseadas em query:

```ts
//Se nada for passado, o valor será tratato como igual (==)
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

### client.model.users.findFirst(query);

Acha e retorna o primeiro objeto que corresponde a busca.

```ts
const user = client.model.users.findFirst({
  where: {
    age: 30,
    type: "common",
  },
});
```

### client.model.users.findMany(query);

Acha e retorna um array de todos objetos que correspondem a busca.

```ts
const users = client.model.users.findMany({
  where: {
    age: 30,
    type: "common",
  },
});
```

---

## Atualizações

### client.model.users.update(query);

Atualiza o primeiro objeto que correspoder a query.

```ts
client.model.users.update({
  where: {
    id: 1,
    age: 26,
  },
  data: { age: 26, type: "common" },
});
```

### client.model.users.updateMany(query);

Atualiza o todos os objetos que correspoderem a query.

```ts
client.model.users.updateMany({
  where: {
    type: "admin",
  },
  data: { type: "common" },
});
```

---

## Agregação

### client.model.users.groupBy(query);

Retorna um array que é uma sumarização com os objetos que correspoderem a query.

```ts
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
