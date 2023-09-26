import { buildHyperschema } from '@hyperschema/core';
import yaml from 'yaml';

import * as hs from './hyperschema';

console.log(yaml.stringify(buildHyperschema(hs)));
