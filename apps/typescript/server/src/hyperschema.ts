import { z } from 'zod';

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
