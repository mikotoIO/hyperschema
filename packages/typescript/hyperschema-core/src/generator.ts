import * as fs from 'fs/promises';
import { format } from 'prettier';

import {
  HSService,
  HSStruct,
  HSType,
  Hyperschema,
  buildHyperschema,
} from './reflector';

function generateHSType(type: HSType): string {
  if (typeof type === 'string') {
    if (/^[A-Z]/.test(type)) {
      return type; // user-defined type
    }
    switch (type) {
      case 'string':
        return 'z.string()';
      case 'int32':
        return 'z.number().int()';
      case 'float64':
        return 'z.number()';
      case 'bool':
        return 'z.boolean()';
      default:
        throw new Error(`Unknown type ${type}`);
    }
  }
  switch (type.type) {
    case 'array':
      return `z.array(${generateHSType(type.param[0])})`;
    case 'optional':
      return `z.optional(${generateHSType(type.param[0])})`;
    default:
      throw new Error(`Unknown type ${type}`);
  }
}

function generateStruct(obj: { name: string; type: HSStruct }) {
  return `export const ${obj.name} = z.object({
    ${obj.type.fields
      .map((f) => `${f.name}: ${generateHSType(f.type)},`)
      .join('\n')}
  });
  export type ${obj.name} = z.infer<typeof ${obj.name}>;
  `;
}

function generateService(obj: { name: string; service: HSService }) {
  return `export class ${obj.name} {
    readonly PATH = '${obj.service.path}';
  }`;
}

export async function generateTypeScriptClient(hs: Hyperschema) {
  return await format(
    `// Generated by Hyperschema compiler. Do not edit manually!
    import { z } from 'zod';

    ${hs.types.map(generateStruct).join('\n\n')}

    ${hs.services.map(generateService).join('\n\n')}
  `,
    { parser: 'typescript' },
  );
}

export async function writeTypeScriptClient(dir: string, hs: any) {
  await fs.writeFile(dir, await generateTypeScriptClient(buildHyperschema(hs)));
}