# mnxconverter

A Javascript/Typescript package for converting between MusicXML and
the new MNX format. Works in Browser and Node.js.

## Disclaimer

This converter is initially ported from Python Package https://github.com/w3c/mnxconverter and very limited in scope at the moment.
So far, it only reliably converts the types of notations
described in [Comparing MNX and MusicXML](https://w3c.github.io/mnx/docs/comparisons/musicxml/).

## Installation

First, make sure you have package installed:

```
npm install mnxconverter
```

or

```
yarn add mnxconverter
```

To convert a MusicXML file, outputting the MNX score object:

```typescript
import { getScoreFromMusicXml, getMNXScore } from 'mnxconverter';
const score = getScoreFromMusicXml('<?xml your music xml goes here....>'); // get internal model
const mnxScore = getMNXScore(score); // encode model as mnx score object

// {
//   "global": {...},
//   "mnx": {...},
//   "parts": {...}
// }
```

### Usage in Node.js

Install jsdom or any browser compatible DomParser

```
npm install jsdom
```

Set global variables

```javascript
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { DOMParser, XPathResult } = new JSDOM().window;
global.DOMParser = DOMParser;
global.XPathResult = XPathResult;
// conversion code like above...
```

## Credits

Highly inspired by [converter](https://github.com/w3c/mnxconverter) developed by Adrian Holovaty

## Links

[MNX documentation](https://w3c.github.io/mnx/docs/).
[W3C Music Notation Community Group](https://www.w3.org/community/music-notation/).
