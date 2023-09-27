import { hostHyperRPC, writeHyperschema } from '@hyperschema/core';
import fastify from 'fastify';
import http from 'http';
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
  await writeHyperschema(path.join(__dirname, '../hyperschema.json'), hs);
  await app.listen({
    port: 3100,
  });
})().then(() => {
  console.log('server started');
});
