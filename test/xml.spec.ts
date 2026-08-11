import fs from 'fs';
import path from 'path';
import { XMLSerializer } from '@xmldom/xmldom';
import * as xpath from 'xpath';
import { getMNXScore, getScoreFromMusicXml } from '../src';
import {
  childNodesOf,
  getDocumentElement,
  parseXml,
  querySelector,
  querySelectorAll,
  selectOne,
  type Element,
} from '../src/xml';

describe('xml adapter', () => {
  const sample = `
    <root>
      <item id="1">Hello</item>
      <item id="2">World</item>
      <nested>
        <item id="3">Nested</item>
      </nested>
    </root>
  `;

  it('parses XML into a Document', () => {
    const doc = parseXml(sample);
    expect(getDocumentElement(doc).tagName).toBe('root');
  });

  it('selects elements via querySelector / querySelectorAll', () => {
    const doc = parseXml(sample);
    const first = querySelector(doc, 'item');
    expect(first?.getAttribute('id')).toBe('1');

    const items = querySelectorAll(doc, 'item');
    expect(items.map(el => el.getAttribute('id'))).toEqual(['1', '2', '3']);
  });

  it('selects attributes and text with XPath', () => {
    const doc = parseXml(sample);
    const idAttr = xpath.select1(
      'string(//item[@id="2"]/@id)',
      doc as unknown as Node
    );
    expect(idAttr).toBe('2');

    const textValue = xpath.select1(
      'string(//item[@id="1"]/text())',
      doc as unknown as Node
    );
    expect(textValue).toBe('Hello');

    const nested = querySelector(doc, 'nested');
    expect(nested).not.toBeNull();
    const relative = querySelector(nested!, 'item');
    expect(relative?.textContent).toBe('Nested');
  });

  it('supports predicates, relative paths, and parent/ancestor', () => {
    const doc = parseXml(sample);
    const byPredicate = selectOne('//item[@id="2"]', doc);
    expect(byPredicate?.textContent).toBe('World');

    const nestedItem = selectOne('//nested/item', doc);
    expect(nestedItem?.getAttribute('id')).toBe('3');

    const parent = selectOne('..', nestedItem!);
    expect(parent?.tagName).toBe('nested');

    const ancestorRoot = selectOne('ancestor::root', nestedItem!);
    expect(ancestorRoot?.tagName).toBe('root');
  });

  it('exposes child nodes without relying on NodeList.forEach', () => {
    const doc = parseXml(sample);
    const names = childNodesOf(getDocumentElement(doc))
      .filter((n): n is Element => n.nodeType === 1)
      .map(n => n.tagName);
    expect(names).toEqual(['item', 'item', 'nested']);
  });

  it('serializes elements with XMLSerializer', () => {
    const doc = parseXml('<root><item id="1">Hello</item></root>');
    const item = querySelector(doc, 'item');
    const xml = new XMLSerializer().serializeToString(item!);
    expect(xml).toBe('<item id="1">Hello</item>');
  });

  it('throws on malformed XML', () => {
    expect(() => parseXml('<root><unclosed>')).toThrow();
  });

  it('converts an existing MusicXML fixture without changing MNX output', () => {
    const fixtureDir = path.join(__dirname, 'fixtures');
    const inputXmlString = fs.readFileSync(
      path.join(fixtureDir, 'basic.musicxml'),
      'utf8'
    );
    const outputJSON = fs.readFileSync(
      path.join(fixtureDir, 'basic.mnx'),
      'utf8'
    );

    const score = getScoreFromMusicXml(inputXmlString);
    expect(getMNXScore(score)).toStrictEqual(JSON.parse(outputJSON));
  });
});
