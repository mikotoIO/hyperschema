import { writeHyperschema } from '@hyperschema/core';
import path from 'path';

import * as hs from './hyperschema';

writeHyperschema(path.join(__dirname, '../hyperschema.json'), hs).then(() => {
  console.log('built hyperschema');
});
