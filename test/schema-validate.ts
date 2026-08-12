import fs from 'fs';
import path from 'path';
import Ajv2020 from 'ajv/dist/2020';
import type { ErrorObject, ValidateFunction } from 'ajv';

const SCHEMA_PATH = path.join(__dirname, '..', 'schema', 'mnx-schema.json');

let validateFn: ValidateFunction | null = null;

export function getMnxValidator(): ValidateFunction {
  if (!validateFn) {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    const ajv = new Ajv2020({
      allErrors: true,
      strict: false,
    });
    validateFn = ajv.compile(schema);
  }
  return validateFn;
}

export function validateMnxDocument(doc: unknown): {
  valid: boolean;
  errors: ErrorObject[] | null | undefined;
} {
  const validate = getMnxValidator();
  const valid = validate(doc);
  return { valid: !!valid, errors: validate.errors };
}

export function formatAjvErrors(
  errors: ErrorObject[] | null | undefined
): string[] {
  if (!errors || !errors.length) {
    return [];
  }
  return errors.map(err => {
    const instancePath = err.instancePath || '/';
    const allowed = err.params?.allowedValues
      ? ` (allowed: ${JSON.stringify(err.params.allowedValues)})`
      : '';
    const additional = err.params?.additionalProperty
      ? ` (unexpected: ${err.params.additionalProperty})`
      : '';
    return `${instancePath}: ${err.message}${allowed}${additional}`;
  });
}
