import * as fs from 'fs/promises';
import { format } from 'prettier';

import {
  HSFunction,
  HSService,
  HSStruct,
  HSType,
  Hyperschema,
  buildHyperschema,
} from './reflector';

function generateTSType(type: HSType): string {
  if (typeof type === 'string') {
    if (/^[A-Z]/.test(type)) {
      return type; // user-defined type
    }
    switch (type) {
      case 'string':
        return 'string';
      case 'int32':
      case 'float64':
        return 'number';
      case 'bool':
        return 'boolean';
      default:
        throw new Error(`Unknown type ${type}`);
    }
  }
  switch (type.type) {
    case 'array':
      return `Array<${generateTSType(type.param[0])}>`;
    case 'nullable':
      return `${generateTSType(type.param[0])} | null`;
    default:
      throw new Error(`Unknown type ${type}`);
  }
}

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
    case 'nullable':
      return `z.nullable(${generateHSType(type.param[0])})`;
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

function generateFunction(obj: { name: string; fn: HSFunction }, path: string) {
  return `${obj.name}(input: {${obj.fn.input
    .map((f) => `${f.name}: ${generateTSType(f.type)}`)
    .join(', ')}}): Promise<${generateTSType(obj.fn.output)}> {
    return this.client.call('${path}${path === '' ? '' : '/'}${
      obj.name
    }', input);
    }`;
}

function generateEvent(obj: { name: string; event: HSType }, path: string) {
  return `${obj.name}(cb: (data: ${generateTSType(
    obj.event,
  )}) => void): () => void {
    return this.client.on('${path}${path === '' ? '' : '/'}${obj.name}', cb);
  }`;
}

function generateService(obj: { name: string; service: HSService }) {
  const isRoot = obj.service.path === '';
  return `export class ${obj.name} ${isRoot ? 'extends RootService' : ''} {
    readonly PATH = '${obj.service.path}';
    ${obj.service.subservices
      .map((x) => `readonly ${x.name} = new ${x.service}(this.client);`)
      .join('\n')}

    constructor(protected client: HyperschemaClient) {
      ${isRoot ? 'super();' : ''}
      ${obj.service.subservices
        .map((x) => `this.${x.name} = new ${x.service}(this.client);`)
        .join('\n')}
    }
    ${obj.service.functions
      .map((x) => generateFunction(x, obj.service.path))
      .join('\n')}

    ${obj.service.events
      .map((x) => generateEvent(x, obj.service.path))
      .join('\n')}
  }`;
}

export async function generateTypeScriptClient(hs: Hyperschema) {
  return await format(
    `// Generated by Hyperschema compiler. Do not edit manually!
    import { z } from 'zod';
    import { HyperschemaClient, RootService } from "@hyperschema/client"

    ${hs.types.map(generateStruct).join('\n\n')}

    ${hs.services.map(generateService).join('\n\n')}
  `,
    { parser: 'typescript' },
  );
}

export async function writeTypeScriptClient(dir: string, hs: any) {
  await fs.writeFile(dir, await generateTypeScriptClient(buildHyperschema(hs)));
}
