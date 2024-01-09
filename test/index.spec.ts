import { getMNXScore, getScoreFromMusicXml } from '../src';
import fs from 'fs';
import path from 'path';

// import jsdom from 'jsdom';
// const { JSDOM } = jsdom;
// global.DOMParser = new JSDOM().window.DOMParser;

describe('Should convert Music XML to MNX', () => {
  const fixtures = fs.readdirSync(path.join(__dirname, 'fixtures'), {
    withFileTypes: true,
  });

  for (const fixture of fixtures) {
    if (path.extname(fixture.name).toLowerCase() === '.musicxml') {
      const filename = path.parse(fixture.name).name;

      const inputXmlString = fs.readFileSync(
        path.join(__dirname, 'fixtures', filename + '.musicxml'),
        'utf8'
      );

      const outputJSON = fs.readFileSync(
        path.join(__dirname, 'fixtures', filename + '.mnx'),
        'utf8'
      );

      it(filename, () => {
        const score = getScoreFromMusicXml(inputXmlString);
        expect(getMNXScore(score)).toStrictEqual(JSON.parse(outputJSON));
      });
    }
  }
});
