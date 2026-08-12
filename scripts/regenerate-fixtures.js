/**
 * Regenerate test/fixtures/*.mnx from the corresponding *.musicxml files.
 */
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, '..', 'test', 'fixtures');

async function main() {
  const { getMNXScore, getScoreFromMusicXml } = require('../src');

  const xmlFiles = fs
    .readdirSync(fixturesDir)
    .filter(f => f.endsWith('.musicxml'))
    .sort();

  for (const name of xmlFiles) {
    const basename = path.parse(name).name;
    const xml = fs.readFileSync(path.join(fixturesDir, name), 'utf8');
    const score = getScoreFromMusicXml(xml);
    const doc = getMNXScore(score);
    const outPath = path.join(fixturesDir, `${basename}.mnx`);
    fs.writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`);
    console.log(`Wrote ${basename}.mnx`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
