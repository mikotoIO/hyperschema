import * as fs from 'fs/promises';
import stringify from 'json-stringify-pretty-compact';
import { z } from 'zod';

import { HyperRPCService } from './hrpc';

export type HSType = string | { type: string; param: HSType[] };
export type HSField = { name: string; type: HSType };

export type HSStruct = {
  kind: 'struct';
  fields: HSField[];
};

export type HSFunction = {
  input: HSField[];
  output: HSType;
};

export type HSService = {
  functions: { name: string; fn: HSFunction }[];
  events: { name: string; event: HSType }[];
};

export type Hyperschema = {
  types: { name: string; type: HSStruct }[];
  services: { name: string; service: HSService }[];
};

export function buildHyperschema(schema: any) {
  // get key-value pairs
  const hyperschema: Hyperschema = {
    types: [],
    services: [],
  };

  // filter out just zod objects, put into a set
  // used for deduplication checks
  const zodReverseMappings = new Map<z.ZodType, string>();
  Object.entries(schema).forEach(([k, v]) => {
    if (v instanceof z.ZodType) {
      zodReverseMappings.set(v, k);
    }
  });

  const computeType = (type: any): HSType => {
    if (!(type instanceof z.ZodType)) return 'unknown';
    if (zodReverseMappings.has(type)) {
      return zodReverseMappings.get(type) ?? 'unknown';
    }
    const tdn = type._def.typeName;
    if (typeof tdn === 'string') {
      switch (tdn) {
        case 'ZodString':
          return 'string';
        case 'ZodNumber':
          if ((type as z.ZodNumber)._def.checks.find((x) => x.kind === 'int'))
            return 'int32';
          return 'float64';
        case 'ZodBoolean':
          return 'bool';
        default:
          break;
      }
    }
    if (type instanceof z.ZodArray) {
      return {
        type: 'array',
        param: [computeType(type._def.type)],
      };
    }
    if (type instanceof z.ZodOptional) {
      return {
        type: 'optional',
        param: [computeType(type._def.innerType)],
      };
    }
    return 'unknown';
  };

  Object.entries(schema).forEach(([k, v]) => {
    if (v instanceof z.ZodObject) {
      const fields = Object.entries(v._def.shape()).map(
        ([field, type]): HSField => {
          // basic type inference
          return {
            name: field,
            type: computeType(type),
          };
        },
      );
      hyperschema.types.push({
        name: k,
        type: {
          kind: 'struct',
          fields,
        },
      });
    } else if (v instanceof HyperRPCService) {
      const functions: { name: string; fn: HSFunction }[] = Object.entries(
        v.functions,
      ).map(([k, v]) => {
        return {
          name: k,
          fn: {
            input: Object.entries(v.input).map(([k, v]) => ({
              name: k,
              type: computeType(v),
            })),
            output: computeType(v.output),
          },
        };
      });
      hyperschema.services.push({
        name: k,
        service: {
          functions,
          events: [],
        },
      });
    }
  });
  return hyperschema;
}

// write to a file
export async function writeHyperschema(dir: string, hs: any) {
  await fs.writeFile(dir, stringify(buildHyperschema(hs)));
}