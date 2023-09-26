import yaml from 'yaml';
import { ZodString, z } from 'zod';

import * as hs from './hyperschema';

// type reference
type HSType = string | { type: string; param: HSType[] };
type HSField = { name: string; type: HSType };

type HSStruct = {
  kind: 'struct';
  fields: HSField[];
};

type Hyperschema = {
  types: Record<string, HSStruct>;
};

function buildHyperschema(schema: any) {
  // get key-value pairs
  const hyperschema: Hyperschema = {
    types: {},
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
      hyperschema.types[k] = {
        kind: 'struct',
        fields,
      };
    }
  });
  return hyperschema;
}

console.log(yaml.stringify(buildHyperschema(hs)));
