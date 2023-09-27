import { HyperRPC } from '@hyperschema/core';
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
const h = new HyperRPC().context(async () => ({
  username: 'cactus',
}));

export const ChildService = h.service({});

export const MainService = h.service({
  child: ChildService,

  add: h
    .fn({ x: z.number(), y: z.number() }, z.number())
    .do(async ({ x, y }) => {
      return x + y;
    }),

  hello: h.fn({ person: Person }, z.string()).do(async ({ person }) => {
    return `Hello, ${person.name}!`;
  }),

  onTick: h.event(z.string()),
});
