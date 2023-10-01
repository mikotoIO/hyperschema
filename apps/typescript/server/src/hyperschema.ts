import { HyperRPC, hsDate } from '@hyperschema/core';
import { z } from 'zod';

export const Calendar = z.object({
  name: z.string(),
  date: hsDate(),
});
type Calendar = z.infer<typeof Calendar>;

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
    .use(async (input) => {
      console.log('first middleware');
      console.log(input);
      return { ...input, answer: 42 };
    })
    .use(async (input) => {
      console.log('second middleware');
      console.log(input);
      return { ...input, notAnswer: input.answer + 1 };
    })
    .do(async ({ x, y, notAnswer }) => {
      console.log(notAnswer);
      return x + y;
    }),
});

export const MainService = h
  .service({
    child: ChildService,

    calendar: h.fn({}, Calendar).do(async () => {
      return {
        name: 'test name',
        date: new Date(),
      };
    }),
    add: h
      .fn({ x: z.number(), y: z.number() }, z.number())
      .do(async ({ x, y, $meta }) => {
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
