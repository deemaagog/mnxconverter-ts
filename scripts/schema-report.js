/**
 * Print a field-level MNX schema breakage report for fixtures and converter output.
 */
const fs = require('fs');
const path = require('path');

// Register ts-jest / ts-node style require for src imports via compiled approach:
// run via npx ts-node instead — see package.json script.
const ROOT = path.join(__dirname, '..');
const fixturesDir = path.join(ROOT, 'test', 'fixtures');

async function main() {
  // Lazy-load after ts-node/register
  const { getMNXScore, getScoreFromMusicXml } = require('../src');
  const {
    formatAjvErrors,
    validateMnxDocument,
  } = require('../test/schema-validate');

  const mnxFiles = fs
    .readdirSync(fixturesDir)
    .filter(f => f.endsWith('.mnx'))
    .sort();

  const summary = {
    fixtures: { pass: 0, fail: 0 },
    converter: { pass: 0, fail: 0 },
    errorCounts: {},
  };

  console.log('=== Checked-in .mnx fixtures ===\n');
  for (const name of mnxFiles) {
    const doc = JSON.parse(
      fs.readFileSync(path.join(fixturesDir, name), 'utf8')
    );
    const { valid, errors } = validateMnxDocument(doc);
    if (valid) {
      summary.fixtures.pass += 1;
      console.log(`PASS  ${name}`);
    } else {
      summary.fixtures.fail += 1;
      console.log(`FAIL  ${name}`);
      for (const line of formatAjvErrors(errors)) {
        console.log(`      ${line}`);
        const key = line.replace(/^[^:]*: /, '');
        summary.errorCounts[key] = (summary.errorCounts[key] || 0) + 1;
      }
    }
  }

  console.log('\n=== Converter output ===\n');
  const xmlFiles = fs
    .readdirSync(fixturesDir)
    .filter(f => f.endsWith('.musicxml'))
    .sort();
  for (const name of xmlFiles) {
    const basename = path.parse(name).name;
    const xml = fs.readFileSync(path.join(fixturesDir, name), 'utf8');
    const score = getScoreFromMusicXml(xml);
    const doc = getMNXScore(score);
    const { valid, errors } = validateMnxDocument(doc);
    if (valid) {
      summary.converter.pass += 1;
      console.log(`PASS  ${basename}`);
    } else {
      summary.converter.fail += 1;
      console.log(`FAIL  ${basename}`);
      for (const line of formatAjvErrors(errors)) {
        console.log(`      ${line}`);
        const key = line.replace(/^[^:]*: /, '');
        summary.errorCounts[key] = (summary.errorCounts[key] || 0) + 1;
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(
    `Fixtures:  ${summary.fixtures.pass} pass / ${summary.fixtures.fail} fail`
  );
  console.log(
    `Converter: ${summary.converter.pass} pass / ${summary.converter.fail} fail`
  );
  console.log('\nTop error messages:');
  Object.entries(summary.errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .forEach(([msg, count]) => console.log(`  ${count}x  ${msg}`));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
