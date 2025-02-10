import { z } from "zod";

export const ErrorHandling = (
  method: string,
  agr: string,
  obj: Partial<z.ZodObject<any>>,
  schema: z.ZodObject<any>
) => {
  const test = schema.safeParse(obj);
  if (!test.success) {
    throw new Error(`
        Method: ${method} has an error
        At: ${agr}
        From Zod: ${test.error.message}
        `);
  }
};
