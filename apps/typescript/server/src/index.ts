import {
  buildHyperschema,
  generateTypeScriptClient,
  hostHyperRPC,
  writeTypeScriptClient,
} from '@hyperschema/core';
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
  await writeTypeScriptClient(
    path.join(__dirname, '../../client/src/hs-client.ts'),
    hs,
  );
  // console.log('generating hyperschema...');
  // await writeHyperschema(path.join(__dirname, '../hyperschema.json'), hs);
  // console.log('generated hyperschema!');
  // await app.listen({
  //   port: 3100,
  // });
})().then(() => {
  console.log('server started');
});
