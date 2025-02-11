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
client.tables.users.insert({
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
