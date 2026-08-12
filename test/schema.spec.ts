import fs from 'fs';
import path from 'path';
import { getMNXScore, getScoreFromMusicXml } from '../src';
import { formatAjvErrors, validateMnxDocument } from './schema-validate';

const fixturesDir = path.join(__dirname, 'fixtures');

describe('MNX schema validation', () => {
  const fixtureFiles = fs
    .readdirSync(fixturesDir)
    .filter(name => name.endsWith('.mnx'))
    .sort();

  describe('checked-in fixtures', () => {
    for (const name of fixtureFiles) {
      it(name, () => {
        const doc = JSON.parse(
          fs.readFileSync(path.join(fixturesDir, name), 'utf8')
        );
        const { valid, errors } = validateMnxDocument(doc);
        if (!valid) {
          const details = formatAjvErrors(errors).join('\n');
          throw new Error(`${name} failed schema validation:\n${details}`);
        }
      });
    }
  });

  describe('converter output', () => {
    const musicXmlFiles = fs
      .readdirSync(fixturesDir)
      .filter(name => name.endsWith('.musicxml'))
      .sort();

    for (const name of musicXmlFiles) {
      const basename = path.parse(name).name;
      it(basename, () => {
        const xml = fs.readFileSync(path.join(fixturesDir, name), 'utf8');
        const score = getScoreFromMusicXml(xml);
        const doc = getMNXScore(score);
        const { valid, errors } = validateMnxDocument(doc);
        if (!valid) {
          const details = formatAjvErrors(errors).join('\n');
          throw new Error(
            `converter output for ${basename} failed schema validation:\n${details}`
          );
        }
      });
    }
  });
});
