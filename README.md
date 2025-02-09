# In Memory SQL Like Database

I will use Prisma ORM to guide my methods and Zod to validate creations.

---

## Creation

### `client.model.insert()`

Insert a new register in db.

```ts
client.tables.users.insert({
  name: "John Doe",
  email: "john@example.com",
});
```
