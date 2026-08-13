# mnxconverter

A Javascript/Typescript package for converting between MusicXML and
the new MNX format. Works in browsers, Node.js, and React Native / Expo.

## Disclaimer

This converter was initially ported from the Python package
[w3c-cg/mnxconverter](https://github.com/w3c-cg/mnxconverter) and is still
limited in scope. Output shape follows the current
[MNX JSON schema](https://github.com/w3c-cg/mnx/blob/main/docs/mnx-schema.json)

## Installation

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

## Supported features

Coverage is fixture-driven (`test/fixtures/`). Status:

| Area | Status | Notes / fixtures |
| --- | --- | --- |
| Basic notes, rests, chords | Supported | `basic`, `basic_chord_rest`, `basic_rest_without_type`, `basic_scale` |
| Accidentals | Supported | `basic_accidentals` (`accidentalDisplay`) |
| Augmentation dots | Supported | `basic_aug_dots` |
| Ties | Supported | `basic_ties`, `tie_side` (incl. `side`) |
| Beams | Partial | Basic / hooks / over-barline / secondary breaks / grace beams. Encoding of `beams` on part-measure still TODO |
| Clefs / mid-bar clef changes | Supported | `clef_changes` |
| Grace notes | Supported | `grace_notes` |
| Key signatures | Supported | `keysigs` |
| Time signatures | Supported | `timesigs`, `timesig_glyphs` (`display: common\|cut`) |
| Multiple parts | Supported | `parts_basic` |
| Multiple voices | Supported | `voices_basic` (separate `sequences`, emits `voice`) |
| Ottavas | Supported | `octaveshifts` (`part-measure.ottavas`) |
| Repeats / endings | Supported | `repeats_*`, `repeats_altendings*` |
| Slurs | Partial | Basic / chords / note-targeted. Incomplete/outgoing slurs omitted (schema requires `target`) |
| Tuplets | Supported | `tuplets_*` |
| Markings / articulations | Supported | `markings` (staccato, accent, tenuto, tremolo single, …) |
| Dynamics | Not yet | |
| Lyrics | Not yet | |
| Jumps (D.S., Fine, …) | Not yet | |
| Layouts / system layouts | Not yet | |
| Multi-measure / full-measure rests | Not yet | |
| Tremolos (multi-note) | Not yet | Single-note tremolo via markings only |

## Maintaining this library

### Source of truth

1. **MNX output shape** — [`schema/mnx-schema.json`](schema/mnx-schema.json), copied from
   [w3c-cg/mnx](https://github.com/w3c-cg/mnx/blob/main/docs/mnx-schema.json).
2. **MusicXML → internal model heuristics** — this repo’s importer, with
   [w3c-cg/mnxconverter](https://github.com/w3c-cg/mnxconverter) as a useful reference
   (not authoritative for JSON field names or nesting).
3. **Examples** — official docs examples under
   [`docs/static/examples/json`](https://github.com/w3c-cg/mnx/tree/main/docs/static/examples/json).

`src/mnx-types.ts` is generated from the schema. Do not edit it by hand.

### Keep in sync with the official schema

```bash
# 1. Refresh the schema copy
curl -fsSL https://raw.githubusercontent.com/w3c-cg/mnx/main/docs/mnx-schema.json \
  -o schema/mnx-schema.json

# 2. Regenerate TypeScript types
npm run generate:types

# 3. See what fixtures / converter output no longer validates
npm run schema:report

# 4. Fix the exporter (src/mnx.ts) and importer (src/musicxml.ts / src/score.ts) as needed

# 5. Refresh golden MNX fixtures from MusicXML inputs
npm run fixtures:regenerate

# 6. Confirm everything
npm test
```

`npm test` includes AJV validation of every `.mnx` fixture **and** of live converter
output (`test/schema.spec.ts`).

### Add a new MusicXML → MNX feature

1. Prefer a small vertical slice (one notation concept).
2. Add a pair of fixtures under `test/fixtures/`:
   - `feature_name.musicxml` — input
   - `feature_name.mnx` — expected MNX (or generate it after the exporter works)
3. Implement parsing into the internal score model (`src/musicxml.ts`, `src/score.ts`).
4. Implement encoding to MNX (`src/mnx.ts`), matching the schema and official examples.
5. Run `npm run schema:report` and `npm test`.
6. If the Python converter already has a related test, reuse its MusicXML when useful —
   but regenerate or rewrite the `.mnx` against the **current** schema.

When schema and the Python converter disagree (for example ottavas belong on
`part-measure.ottavas` today, not inside sequence `content`), follow the schema.

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run generate:types` | Rebuild `src/mnx-types.ts` from `schema/mnx-schema.json` |
| `npm run schema:report` | Print field-level AJV errors for fixtures and converter output |
| `npm run fixtures:regenerate` | Rewrite all `*.mnx` from corresponding `*.musicxml` |
| `npm test` | Unit tests + schema validation |

## Credits

Highly inspired by the [Python converter](https://github.com/w3c-cg/mnxconverter)
developed by Adrian Holovaty.

## Links

- [MNX documentation](https://w3c-cg.github.io/mnx/docs/)
- [MNX schema](https://github.com/w3c-cg/mnx/blob/main/docs/mnx-schema.json)
- [W3C Music Notation Community Group](https://www.w3.org/community/music-notation/)
