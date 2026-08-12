/**
 * Generate src/mnx-types.ts from schema/mnx-schema.json.
 *
 * json-schema-to-typescript does not fully support draft 2020-12
 * ($defs, unevaluatedProperties), so we preprocess into a draft-07-ish shape.
 */
const fs = require('fs');
const path = require('path');
const { compile } = require('json-schema-to-typescript');

const ROOT = path.join(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'schema', 'mnx-schema.json');
const OUT_PATH = path.join(ROOT, 'src', 'mnx-types.ts');

function rewriteRefs(obj) {
  if (Array.isArray(obj)) {
    return obj.map(rewriteRefs);
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        out[key] = value.replace('#/$defs/', '#/definitions/');
      } else if (key === 'unevaluatedProperties') {
        out.additionalProperties = value;
      } else {
        out[key] = rewriteRefs(value);
      }
    }
    return out;
  }
  return obj;
}

async function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const rootDef = schema.$defs.root;
  const forTypes = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'MNXDocument',
    description: schema.description,
    definitions: rewriteRefs(schema.$defs),
    ...rewriteRefs(rootDef),
  };

  const ts = await compile(forTypes, 'MNXDocument', {
    bannerComment: `/* eslint-disable */\n/**\n * Automatically generated from schema/mnx-schema.json.\n * DO NOT MODIFY BY HAND. Run \`npm run generate:types\`.\n */`,
    unreachableDefinitions: true,
    unknownAny: false,
    style: { singleQuote: true, semi: true },
  });

  fs.writeFileSync(OUT_PATH, ts);
  console.log(`Wrote ${OUT_PATH} (${ts.split('\n').length} lines)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
