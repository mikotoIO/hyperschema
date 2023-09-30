import { HyperRPC, NotFoundError } from '@hyperschema/core';
import { z } from 'zod';

export const Pet = z.object({
  name: z.string(),
});
type Pet = z.infer<typeof Pet>;

export const Person = z.object({
  name: z.string(),
  age: z.number().int(),
  isAwesome: z.boolean(),
  avatar: z.string().nullable(),
  pet: Pet.array(),
});
type Person = z.infer<typeof Person>;

// rpc code
const h = new HyperRPC().context(async () => ({}));

export const ChildService = h.service({
  add2: h
    .fn({ x: z.number(), y: z.number() }, z.number())
    .do(async ({ x, y }) => {
      return x + y;
    }),
});

export const MainService = h
  .service({
    child: ChildService,

    add: h
      .fn({ x: z.number(), y: z.number() }, z.number())
      .do(async ({ x, y, $meta }) => {
        throw new NotFoundError();
        console.log($meta);
        return x + y;
      }),

    hello: h.fn({ person: Person }, z.string()).do(async ({ person }) => {
      return `Hello, ${person.name}!`;
    }),

    onTick: h.event(z.number()).emitter((emit, ctx) => {
      // console.log(`setting up for ${ctx.$meta.connId}...}`);
      // const interval = setInterval(() => {
      //   emit(Math.random());
      // }, 1000);
      // return () => {
      //   console.log(`cleaning up for ${ctx.$meta.connId}.`);
      //   clearInterval(interval);
      // };
    }),
  })
  .root();
