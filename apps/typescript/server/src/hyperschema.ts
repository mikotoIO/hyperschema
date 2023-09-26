import { z } from 'zod';

function document<T extends z.ZodType>(docs: string, z: T): T {
  // brand the type
  return Object.assign({
    __docs: docs,
  });
}

export const Pet = z.object({
  name: z.string(),
});

export const Person = z.object({
  name: z.string(),
  age: z.number().int(),
  isAwesome: z.boolean(),
  avatar: z.string().optional(),
  pet: Pet.array(),
});
