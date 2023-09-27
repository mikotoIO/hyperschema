import { HyperRPC, defineService } from '@hyperschema/core';
import { z } from 'zod';

export const Pet = z.object({
  name: z.string(),
});
type Pet = z.infer<typeof Pet>;

export const Person = z.object({
  name: z.string(),
  age: z.number().int(),
  isAwesome: z.boolean(),
  avatar: z.string().optional(),
  pet: Pet.array(),
});
type Person = z.infer<typeof Person>;

// rpc code
const hrpc = new HyperRPC().context(async () => ({
  username: 'cactus',
}));

export const mainService = defineService({
  hello: hrpc.fn({ person: Person }, z.string()).do(async ({ person }) => {
    return `Hello, ${person.name}!`;
  }),

  onTick: hrpc.event(z.string()),
});
