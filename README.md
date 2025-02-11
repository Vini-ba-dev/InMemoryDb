# In Memory SQL Like Database

I will use Prisma ORM to guide my methods and Zod to validate creations.

---

# Creating a table

First, you need to initialized a Zod schema:

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

Then import Db class:

```ts
const client = new Db();

/**
 * Create a table method call a service class
 * that is our model it selfie.
 * Because we are store a collection of objs,
 * model is a better name
 */
client.CreateModel("users", UserSchema);
```

## Creation

### `client.model.insert()`

Insert a new register in db.

```ts
client.tables.users.insert({
  name: "John Doe",
  email: "john@example.com",
});
```
