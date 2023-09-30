import { hostHyperRPC, writeTypeScriptClient } from '@hyperschema/core';
import fastify from 'fastify';
import path from 'path';
import * as socketIO from 'socket.io';

import * as hs from './hyperschema';

const app = fastify();
app.get('/', async () => {
  return { hello: 'world' };
});
const io = new socketIO.Server(app.server, {
  cors: { origin: '*' },
});

hostHyperRPC(io, hs.MainService);

(async function main() {
  console.log('generating hyperschema...');
  await writeTypeScriptClient(
    path.join(__dirname, '../../client/src/hs-client.ts'),
    hs,
  );
  console.log('generated hyperschema!');
  await app.listen({
    port: 3100,
  });
})().then(() => {
  console.log('server started');
});
