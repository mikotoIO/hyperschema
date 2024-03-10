import {
  HyperschemaServer,
  SocketIOTransport,
  TypeScriptWriter,
  writeTypeScriptClient,
} from '@hyperschema/core';
import fastify from 'fastify';
import path from 'path';
import * as socketIO from 'socket.io';

import * as hs from './hyperschema';

const app = fastify();
app.get('/', async () => {
  return { hello: 'world' };
});

const hss = new HyperschemaServer({
  system: hs,
  root: hs.MainService,
  transports: [
    new SocketIOTransport({
      port: 3100,
    }),
  ],
  writers: [
    new TypeScriptWriter(path.join(__dirname, '../../client/src/hs-client.ts')),
  ],
});

(async function main() {
  console.log('generating hyperschema...');
  await hss.start({ generate: true });
  console.log('generated hyperschema!');
})().then(() => {
  console.log('server started');
});
