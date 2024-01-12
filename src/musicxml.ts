/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Fraction from 'fraction.js';
import {
  Bar,
  BarPart,
  Beam,
  Clef,
  Ending,
  GraceNoteGroup,
  KeySignature,
  Note,
  OctaveShift,
  Part,
  PositionedClef,
  RhythmicDuration,
  Score,
  Sequence,
  Slur,
  TupletRatio,
  Event,
  Rest,
  Pitch,
  WHITE_KEY,
  BeamHook,
} from './score';

const RHYTHM_TYPES = new Map([
  ['breve', [2, 1]],
  ['whole', [1, 1]],
  ['half', [1, 2]],
  ['quarter', [1, 4]],
  ['quater', [1, 4]], // Non-standard
  ['eighth', [1, 8]],
  ['eigth', [1, 8]], // Non-standard
  ['quaver', [1, 8]], // Non-standard
  ['8th', [1, 8]], // Non-standard
  ['semiquaver', [1, 16]], // Non-standard
  ['sixteenth', [1, 16]], // Non-standard
  ['16th', [1, 16]],
  ['32nd', [1, 32]],
  ['32th', [1, 32]], // Non-standard
  ['64th', [1, 64]],
  ['128th', [1, 128]],
  ['256th', [1, 256]],
  ['512th', [1, 512]],
  ['1024th', [1, 1024]],
]);

const ACCIDENTAL_TYPES_FOR_IMPORT = new Map([
  ['sharp', Note.ACCIDENTAL_SHARP],
  ['natural', Note.ACCIDENTAL_NATURAL],
  ['flat', Note.ACCIDENTAL_FLAT],
  ['double-sharp', Note.ACCIDENTAL_DOUBLE_SHARP],
  ['sharp-sharp', Note.ACCIDENTAL_DOUBLE_SHARP],
  ['flat-flat', Note.ACCIDENTAL_DOUBLE_FLAT],
  ['natural-sharp', Note.ACCIDENTAL_NATURAL_SHARP],
  ['natural-flat', Note.ACCIDENTAL_NATURAL_FLAT],
]);

const SLUR_SIDES_FOR_IMPORT = new Map([
  ['above', Slur.SIDE_UP],
  ['below', Slur.SIDE_DOWN],
]);

const OCTAVE_SHIFT_TYPES_FOR_IMPORT = new Map([
  [['8', 'down'].toString(), OctaveShift.TYPE_8VA],
  [['8', 'up'].toString(), OctaveShift.TYPE_8VB],
  [['15', 'down'].toString(), OctaveShift.TYPE_15MA],
  [['15', 'up'].toString(), OctaveShift.TYPE_15MB],
  [['16', 'down'].toString(), OctaveShift.TYPE_15MA], // Non-standard
  [['16', 'up'].toString(), OctaveShift.TYPE_15MB], // Non-standard
  [['22', 'down'].toString(), OctaveShift.TYPE_22MA],
  [['22', 'up'].toString(), OctaveShift.TYPE_22MB],
]);

const ENDING_TYPES_FOR_IMPORT = {
  start: Ending.TYPE_START,
  stop: Ending.TYPE_STOP,
  discontinue: Ending.TYPE_DISCONTINUE,
};
const DEFAULT_KEYSIG = 0;
const DIVISION_DURATION_WHOLE_NOTE = 4; // MusicXML constant specifying how many <divisions> are in a whole note.

export const getScoreFromMusicXml = (xmlString: string): Score => {
  let xml = getMusicxml(xmlString);
  xml = cleanMusicxml(xml);
  return readMusicxml(xml);
};

class NotationImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotationImportError';
  }
}

class NotationDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotationDataError';
  }
}

const getMusicxml = (xmlString: string) => {
  const parser = new DOMParser();

  try {
    return parser.parseFromString(xmlString, 'text/xml');
  } catch (error) {
    throw new NotationImportError('XML syntax error');
  }
};

const convertToTimewise = (xml: Document): Document => {
  const firstPart = xml.querySelector('part');

  if (!firstPart) {
    throw new Error("Couldn't convert partwise to timewise. No part found.");
  }

  // Create a new root element with the 'score-timewise' tag name
  const newRootElement = xml.createElement('score-timewise');

  // Copy attributes from the original root element to the new one
  for (const attr of xml.documentElement.attributes) {
    newRootElement.setAttribute(attr.name, attr.value);
  }

  while (xml.documentElement.firstChild) {
    newRootElement.appendChild(xml.documentElement.firstChild);
  }

  // Replace the original root element with the new one
  xml.replaceChild(newRootElement, xml.documentElement);

  // Create an array to store new measure elements
  const newMeasures: HTMLElement[] = [];

  // Iterate through measures in the first part
  firstPart.querySelectorAll('measure').forEach(oldMeasure => {
    const newMeasure = xml.createElement('measure');

    // Copy attributes from old measure to new measure
    for (const attr of oldMeasure.attributes) {
      newMeasure.setAttribute(attr.name, attr.value);
    }

    newRootElement.appendChild(newMeasure);
    newMeasures.push(newMeasure);
  });

  // Iterate through parts in the XML
  xml.querySelectorAll('part').forEach(part => {
    part.querySelectorAll('measure').forEach((measure, i) => {
      try {
        const newMeasure = newMeasures[i];
        const measurePart = xml.createElement('part');

        // Set 'number' attribute
        measurePart.setAttribute(
          'number',
          newMeasure.getAttribute('number') || String(i + 1)
        );

        // Copy attributes from part to measure part
        for (const attr of part.attributes) {
          measurePart.setAttribute(attr.name, attr.value);
        }

        // Move elements from measure to measure part
        measure.childNodes.forEach(subEl => {
          measurePart.appendChild(subEl.cloneNode(true));
        });

        // Append measure part to new measure
        newMeasure.appendChild(measurePart);

        // Remove measure from part
        part.removeChild(measure);
      } catch (error) {
        // This measure wasn't in the first part. Skip!
      }
    });

    // Remove the original part
    newRootElement.removeChild(part);
  });

  return xml;
};

const cleanMusicxml = (xml: Document): Document => {
  const tag = xml.documentElement.tagName;
  if (tag == 'score-partwise') {
    xml = convertToTimewise(xml);
  } else if (tag != 'score-timewise') {
    throw new NotationImportError(
      "Didn't find 'score-partwise' or 'score-timewise'."
    );
  }
  return xml;
};

const readMusicxml = (xml: Document) => {
  const reader = new MusicXMLReader(xml);
  return reader.read();
};

class MusicXMLReader {
  xml: Document;
  score: Score;
  partDivisions: Record<string, number>;
  openTies: Note[];
  currentBeams: [Sequence, Event, [number, string][]][];
  openBeams: Record<string, Record<number, Beam>>;
  openTuplets: Record<string, Event[]>;
  currentTuplets: [Sequence, Event[], TupletRatio][];
  openSlurs: Record<
    number,
    [
      Slur,
      Record<string, string>,
      Record<string, string> | null,
      Note,
      Note | null,
    ]
  >;
  completeSlurs: [
    Slur,
    Record<string, string>,
    Record<string, string> | null,
    Note,
    Note | null,
  ][];
  currentGraceNoteGroup: GraceNoteGroup | null;
  nextEventId: number;
  nextNoteId: number;
  currentOctaveShift: [number, (Rest | Note)[]] | null;
  completeOctaveShifts: [number, (Rest | Note)[]][];

  constructor(xml: Document) {
    this.xml = xml;
    this.score = new Score();
    this.partDivisions = {};
    this.openTies = [];
    this.currentBeams = [];
    this.openBeams = {};
    this.openTuplets = {};
    this.currentTuplets = [];
    this.openSlurs = {};
    this.completeSlurs = [];
    this.currentGraceNoteGroup = null;
    this.nextEventId = 1;
    this.nextNoteId = 1;
    this.currentOctaveShift = null;
    this.completeOctaveShifts = [];
  }

  read(): Score {
    this.parsePartList();
    this.parseMeasures();
    return this.score;
  }

  parsePartList(): void {
    const parts = this.score.parts;
    const partListEl = this.xml.querySelector('part-list');
    if (partListEl !== null) {
      for (const scorePartEl of partListEl.querySelectorAll('score-part')) {
        const part = this.parsePart(scorePartEl);
        parts.push(part);
      }
    }
  }

  parsePart(scorePartEl: Element): Part {
    const partId = scorePartEl.getAttribute('id');
    if (partId === null) {
      throw new Error("<score-part> is missing an 'id' attribute.");
    }

    const partNameEl = scorePartEl.querySelector('part-name');
    const name = partNameEl ? partNameEl.textContent : null;

    let firstMeasureEl;
    try {
      firstMeasureEl = this.xml.evaluate(
        `measure/part[@id="${partId}"]`,
        this.xml,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue as Element;
    } catch (error) {
      // handle the error
      console.error(error);
    }

    const transpose = firstMeasureEl
      ? this.parseMeasureTranspose(firstMeasureEl)
      : 0;

    return new Part(partId, name, transpose);
  }

  parseMeasureTranspose(measureEl: Element): number {
    let result = 0;
    const transposeEl = measureEl.querySelector('attributes/transpose');

    if (transposeEl !== null) {
      const chromaticEl = transposeEl.querySelector('chromatic');
      if (chromaticEl !== null && chromaticEl.textContent) {
        try {
          result += parseInt(chromaticEl.textContent);
        } catch (error) {
          // handle the error
          console.error(error);
        }
      }

      const octaveChangeEl = transposeEl.querySelector('octave-change');
      if (octaveChangeEl !== null && octaveChangeEl.textContent) {
        try {
          result += parseInt(octaveChangeEl.textContent) * 12;
        } catch (error) {
          // handle the error
          console.error(error);
        }
      }
    }

    return result;
  }

  parseMeasures(): void {
    const score = this.score;
    const bars = score.bars;
    const parts = score.parts;

    const measureElements = this.xml.querySelectorAll('measure');

    measureElements.forEach((measureEl, idx) => {
      const bar = new Bar(score, idx);
      bars.push(bar);

      measureEl.querySelectorAll('part').forEach((measurePartEl, partIdx) => {
        this.parseMeasurePart(measurePartEl, bar, parts[partIdx]);
      });
    });
  }

  parseMeasurePart(measurePartEl: Element, bar: Bar, part: Part): void {
    let position = 0;
    const barPart = new BarPart();

    for (const el of measurePartEl.children) {
      const tag = el.nodeName; // tagName

      if (tag === 'attributes') {
        this.parseMeasureAttributes(el, bar, part, barPart, position);
      } else if (tag === 'backup') {
        position -= this.parseForwardBackup(el);
      } else if (tag === 'barline') {
        this.parseBarline(el, bar);
      } else if (tag === 'direction') {
        this.parseDirection(el);
      } else if (tag === 'forward') {
        position += this.parseForwardBackup(el);
      } else if (tag === 'note') {
        position += this.parseNote(el, part, barPart);
      }
    }

    bar.barParts[part.partId] = barPart;

    if (this.completeSlurs.length) {
      this.completeSlurs.forEach(obj => {
        this.addSlur(...obj);
      });
      this.completeSlurs.length = 0;
    }

    for (const [sequence, eventList, ratio] of this.currentTuplets) {
      sequence.setTuplet(ratio, eventList);
    }
    this.currentTuplets.length = 0;

    this.processBeams(part.partId);

    for (const [shiftType, noteList] of this.completeOctaveShifts) {
      this.addOctaveShift(shiftType, noteList);
    }
    this.completeOctaveShifts.length = 0;
  }

  parseMeasureAttributes(
    attributesEl: Element,
    bar: Bar,
    part: Part,
    barPart: BarPart,
    position: number
  ): void {
    for (const el of attributesEl.children) {
      const tag = el.nodeName;
      if (tag === 'clef') {
        barPart.clefs.push(this.parseClef(part, el, position));
      } else if (tag === 'divisions') {
        this.partDivisions[part.partId] = this.parseDivisions(el);
      } else if (tag === 'key') {
        bar.keysig = this.parseKey(el, part);
      } else if (tag === 'time') {
        bar.timesig = this.parseTime(el);
      }
    }
  }

  parseClef(
    part: Part,
    clefEl: Element,
    musicxmlPosition: number
  ): PositionedClef {
    let sign = null;
    let line = null;
    for (const el of clefEl.children) {
      const tag = el.nodeName;
      if (tag === 'sign') {
        if (el.textContent !== null) {
          sign = el.textContent;
        }
      } else if (tag === 'line') {
        if (el.textContent !== null) {
          line = parseInt(el.textContent, 10);
        }
      }
    }

    if (sign === null || line === null) {
      throw new NotationDataError(`Invalid clef in part ${part.partId}`);
    }

    // # Convert MusicXML clef position (1 = bottom staff line)
    //     # to MNX clef position (1 = middle staff line).
    //     # TODO: This assumes a five-line staff at the moment.
    const verticalPosition = 2 * line - 6;

    const rhythmicPosition = new Fraction(
      musicxmlPosition,
      this.partDivisions[part.partId] * DIVISION_DURATION_WHOLE_NOTE
    );

    const clef = new Clef(sign, verticalPosition);
    return new PositionedClef(clef, rhythmicPosition);
  }

  parseDivisions(divisionsEl: Element): number {
    if (divisionsEl.textContent !== null) {
      return parseInt(divisionsEl.textContent, 10);
    }
    throw new NotationDataError('Divisions element is missing content');
  }

  parseBarline(barlineEl: Element, bar: Bar) {
    for (const el of barlineEl.children) {
      const tag = el.nodeName;

      if (tag === 'ending') {
        this.parseEnding(el, bar);
      } else if (tag === 'repeat') {
        const direction = el.getAttribute('direction');

        if (!direction) {
          throw new NotationDataError(
            "<repeat>  is missing a 'direction' attribute."
          );
        }

        if (direction === 'forward') {
          bar.startRepeat = true;
        } else if (direction === 'backward') {
          const times = el.getAttribute('times')
            ? parseInt(el.getAttribute('times') || '', 10)
            : 2;
          bar.endRepeat = times;
        }
      }
    }
  }

  parseEnding(el: Element, bar: Bar) {
    const endingType = el.getAttribute(
      'type'
    ) as keyof typeof ENDING_TYPES_FOR_IMPORT;

    if (endingType === 'start') {
      const numberAttr = el.getAttribute('number');

      const numbers = numberAttr
        ? numberAttr
            .split(/[\s,]+/)
            // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            .filter(n => n.trim().match(/^\d+$/))
            .map(Number)
        : [];

      if (numbers.length > 0) {
        bar.startEnding = new Ending(
          ENDING_TYPES_FOR_IMPORT[endingType],
          numbers
        );
      }
    } else if (['stop', 'discontinue'].includes(endingType)) {
      bar.stopEnding = new Ending(ENDING_TYPES_FOR_IMPORT[endingType]);
    }
  }

  parseForwardBackup(el: Element): number {
    this.currentGraceNoteGroup = null;
    const durationEl = el.querySelector('duration');

    if (!durationEl) {
      return 0;
    }

    return this.parseDuration(durationEl);
  }

  parseDirection(directionEl: Element): void {
    for (const el of directionEl.children) {
      const tag = el.tagName;
      if (tag === 'direction-type') {
        this.parseDirectionType(el);
      }
    }
  }

  parseDirectionType(directionTypeEl: Element): void {
    for (const el of directionTypeEl.children) {
      const tag = el.tagName;
      if (tag === 'octave-shift') {
        this.parseOctaveShift(el);
      }
      // Add more conditions for other tags within direction-type as needed
    }
  }

  parseOctaveShift(octaveShiftEl: Element): void {
    const type = octaveShiftEl.getAttribute('type');
    if (type === 'up' || type === 'down') {
      const size = octaveShiftEl.getAttribute('size') || '8';
      if (this.currentOctaveShift !== null) {
        // TODO: Close the current octave shift? Raise error?
      }

      const sizeTypeKey = [size, type].toString();
      if (OCTAVE_SHIFT_TYPES_FOR_IMPORT.has(sizeTypeKey)) {
        const shiftType = OCTAVE_SHIFT_TYPES_FOR_IMPORT.get(sizeTypeKey);
        this.currentOctaveShift = [shiftType!, []];
      } else {
        throw new NotationDataError(
          `<${octaveShiftEl.tagName}> has an unsupported type/size combination.`
        );
      }
    } else if (type === 'stop') {
      if (this.currentOctaveShift === null) {
        // TODO: Close the current octave shift? Raise error?
      } else {
        if (!this.currentOctaveShift[1]) {
          // TODO: Raise error?
          return;
        }
        this.completeOctaveShifts.push(this.currentOctaveShift);
        this.currentOctaveShift = null;
      }
    }
  }

  parseDuration(el: Element): number {
    const duration = parseInt(el.textContent || '', 10);
    if (isNaN(duration)) {
      return 0; // TODO: Raise an error here?
    }

    return duration;
  }

  parseKey(keyEl: Element, part: Part): KeySignature {
    try {
      const fifths = parseInt(
        keyEl.querySelector('fifths')?.textContent || '',
        10
      );
      return new KeySignature(fifths).toConcert(part);
    } catch (error) {
      // Handle the error according to your application's requirements
      console.error('Error parsing key:', error);
      // You may return a default value or throw an exception here
      return new KeySignature(DEFAULT_KEYSIG).toConcert(part);
    }
  }

  parseTime(timeEl: Element): number[] {
    let isValid = true;
    let numerator = 4;
    let denominator = 4;

    try {
      const beatsEl = timeEl.querySelector('beats');
      // @ts-expect-error
      numerator = parseInt(beatsEl.textContent || '', 10);
    } catch (error) {
      isValid = false;
    }

    try {
      const beatTypeEl = timeEl.querySelector('beat-type');
      // @ts-expect-error
      denominator = parseInt(beatTypeEl.textContent || '', 10);
    } catch (error) {
      isValid = false;
    }

    if (!isValid) {
      if (timeEl.getAttribute('symbol') !== 'common') {
        // Handle error or throw an exception based on your requirements
        console.error('Invalid data in <time> element}');
        // You may return a default value or throw an exception here
        throw new NotationDataError('Invalid data in <time> element }');
      }
    }

    return [numerator, denominator];
  }

  parseNote(noteEl: Element, part: Part, barPart: BarPart): number {
    let sequenceId = '';
    let isChord = false;
    let isGrace = false;
    let isRest = false;
    let duration = 0;
    let noteType = null;
    let numDots = 0;
    const beams: [number, string][] = [];
    const closedTupletNumbers: string[] = [];
    let timeMod: TupletRatio | null = null;
    let event;

    const note = new Note(this.score, `note${this.nextNoteId}`);

    for (const el of noteEl.children) {
      const tag = el.tagName;

      switch (tag) {
        case 'accidental': {
          const accidental = el.textContent || '';
          if (ACCIDENTAL_TYPES_FOR_IMPORT.has(accidental)) {
            note.renderedAcc = ACCIDENTAL_TYPES_FOR_IMPORT.get(accidental)!;
          } else {
            throw new NotationDataError(
              `Got unsupported value "${accidental}" for <${tag}>}.`
            );
          }
          break;
        }
        case 'beam':
          beams.push(this.parseBeam(el));
          break;
        case 'chord':
          isChord = true;
          break;
        case 'dot':
          numDots += 1;
          break;
        case 'duration':
          duration = this.parseDuration(el);
          break;
        case 'grace':
          isGrace = true;
          break;
        case 'notations':
          // eslint-disable-next-line no-case-declarations
          const newClosedTupletNumbers = this.parseNotations(el, note);
          if (newClosedTupletNumbers.length) {
            closedTupletNumbers.push(...newClosedTupletNumbers);
          }
          break;
        case 'pitch':
          note.pitch = this.parsePitch(el);
          break;
        case 'rest':
          isRest = true;
          break;
        case 'time-modification':
          timeMod = this.parseTimeModification(el, noteType);
          break;
        case 'type':
          noteType = this.parseType(el);
          break;
        case 'voice':
          sequenceId = el.textContent || '';
          break;
      }
    }

    if (timeMod === null && closedTupletNumbers.length) {
      throw new NotationDataError(
        '<note> is missing a valid <time-modification>'
      );
    }

    if (noteType === null) {
      try {
        noteType = new Fraction(
          duration,
          this.partDivisions[part.partId] * DIVISION_DURATION_WHOLE_NOTE
        );
        numDots = 0;
      } catch (error) {
        throw new NotationDataError(
          `<note> 
          )} is missing a valid <type> or <duration>.`
        );
      }
    }

    const rhythmicDuration = new RhythmicDuration(noteType, numDots);
    const sequence = barPart.getOrCreateSequence(sequenceId);

    if (isChord) {
      event = sequence.getLastEvent();
      if (event) {
        if (
          rhythmicDuration &&
          event.duration &&
          !event.duration.equals(rhythmicDuration)
        ) {
          throw new NotationDataError(
            'Two separate <note>s within the same chord had different durations}.'
          );
        }
      } else {
        // # TODO: Got a <note> with <chord> without a previous
        //         # <note> in the voice. Show an error? For now, we
        //         # effectively ignore the <chord> in this situation.
        event = new Event(sequence, `ev${this.nextEventId}`, rhythmicDuration);
        this.nextEventId += 1;
        sequence.items.push(event);
      }
    } else {
      event = new Event(sequence, `ev${this.nextEventId}`, rhythmicDuration);
      this.nextEventId += 1;

      if (isGrace) {
        if (!this.currentGraceNoteGroup) {
          this.currentGraceNoteGroup = new GraceNoteGroup(sequence);
          sequence.items.push(this.currentGraceNoteGroup);
        }
        this.currentGraceNoteGroup.events.push(event);
      } else {
        this.currentGraceNoteGroup = null;
        sequence.items.push(event);
      }
    }

    let eventItem;
    if (isRest) {
      eventItem = new Rest();
    } else {
      if (!note.pitch) {
        throw new NotationDataError('The <note> is missing <pitch>.');
      }
      eventItem = note;
      this.nextNoteId += 1;
    }

    event.eventItems.push(eventItem);

    if (Object.keys(this.openTuplets).length) {
      for (const eventList of Object.values(this.openTuplets)) {
        eventList.push(event);
      }
      for (const number of closedTupletNumbers) {
        const completeTuplet = this.openTuplets[number];
        if (completeTuplet) {
          this.currentTuplets.push([sequence, completeTuplet, timeMod!]);
          delete this.openTuplets[number];
        }
      }
    }

    if (beams.length) {
      this.currentBeams.push([sequence, event, beams]);
    }

    if (this.currentOctaveShift) {
      this.currentOctaveShift[1].push(eventItem);
    }

    // # Return the duration of this event, to increment our internal position.
    //     # We don't do this if is_chord==True, because we assume the first <note>
    //     # already incremented the position.
    if (duration !== null && !isChord) {
      return duration;
    } else {
      return 0;
    }
  }

  parseBeam(beamEl: Element): [number, string] {
    const number = parseInt(beamEl.getAttribute('number') || '1', 10);
    if (isNaN(number)) {
      throw new NotationDataError('<beam>  has an invalid "number" attribute.');
    }
    return [number, beamEl.textContent || ''];
  }

  parseNotations(notationsEl: Element, note: Note): string[] {
    const closedTupletNumbers: string[] = [];
    for (const el of notationsEl.children) {
      const tag = el.tagName;
      if (tag === 'slur') {
        this.parseSlur(el, note);
      } else if (tag === 'tied') {
        const tiedType = el.getAttribute('type');
        if (tiedType === 'start') {
          this.openTies.push(note);
        } else if (tiedType === 'stop') {
          // Find the Note that started this tie.
          if (!note.pitch) {
            throw new NotationDataError(
              '<tied> must come after <pitch> within <note>.'
            );
          }
          const startNote = this.getOpenTieByEndNote(note);
          if (startNote) {
            startNote.tieEndNote = note.noteId;
            note.isReferenced = true;
          }
        }
      } else if (tag === 'tuplet') {
        const closedTupletNumber = this.parseTuplet(el);
        if (closedTupletNumber) {
          closedTupletNumbers.push(closedTupletNumber);
        }
      }
    }
    return closedTupletNumbers;
  }

  parseSlur(slurEl: Element, note: Note): void {
    const slurType = slurEl.getAttribute('type');
    const slurNumber = parseInt(slurEl.getAttribute('number') || '1', 10) || 1;
    const attrs = Object.assign(
      {},
      ...Array.from(slurEl.attributes, ({ name, value }) => ({
        [name]: value,
      }))
    );

    if (slurType === 'start') {
      let side = null;

      if (SLUR_SIDES_FOR_IMPORT.has(slurEl.getAttribute('placement') || '')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        side = SLUR_SIDES_FOR_IMPORT.get(
          slurEl.getAttribute('placement') || ''
        )!;
      }

      this.openSlurs[slurNumber] = [
        new Slur(null, side),
        attrs,
        null,
        note,
        null,
      ];
    } else if (slurType === 'stop') {
      const openSlurs = this.openSlurs;
      try {
        openSlurs[slurNumber][2] = attrs;
        openSlurs[slurNumber][4] = note;
      } catch (error) {
        // Got <slur type="stop"> without matching <slur type="start">.
        // Handle KeyError, raise an error, or perform other actions as needed.
        console.error(error);
      } finally {
        const completedSlur = openSlurs[slurNumber];
        if (completedSlur) {
          this.completeSlurs.push(completedSlur);
          delete openSlurs[slurNumber];
        }
      }
    }
  }

  parseTuplet(tupletEl: Element): string | null {
    // Parses <tuplet>. Returns the tuplet number if the tuplet
    // is now closed. Else returns None.
    let result: string | null = null;
    const number = tupletEl.getAttribute('number') || '1';
    const tupletType = tupletEl.getAttribute('type');
    if (tupletType === 'start') {
      this.openTuplets[number] = [];
    } else if (tupletType === 'stop') {
      result = number;
    }
    return result;
  }

  parsePitch(pitchEl: Element): Pitch {
    let alter = 0;
    let step: string | null = null;
    let octave: number | null = null;

    for (const el of pitchEl.children) {
      const tag = el.tagName;
      if (tag === 'alter') {
        alter = parseInt(el.textContent || '', 10);
        if (isNaN(alter)) {
          throw new NotationDataError('<pitch>  has an invalid <alter>.');
        }
      } else if (tag === 'octave') {
        octave = parseInt(el.textContent || '', 10);
        if (isNaN(octave)) {
          throw new NotationDataError('<pitch> has an invalid <octave>.');
        }
      } else if (tag === 'step') {
        step = el.textContent || '';
        if (!(step in WHITE_KEY)) {
          throw new NotationDataError('<pitch> has an invalid <step>.');
        }
      }
    }

    if (step === null) {
      throw new NotationDataError('<pitch> is missing <step>.');
    }

    if (octave === null) {
      throw new NotationDataError('<pitch> is missing <octave>.');
    }

    return new Pitch(step as WHITE_KEY, octave, alter);
  }

  parseTimeModification(
    timeModEl: Element,
    noteType: Fraction | null
  ): TupletRatio {
    let actualNotes: number | null = null;
    let normalNotes: number | null = null;
    let normalType: Fraction | null = null;
    let numDots = 0;

    for (const el of timeModEl.children) {
      const tag = el.tagName;
      if (tag === 'actual-notes') {
        actualNotes = parseInt(el.textContent || '', 10);
        if (isNaN(actualNotes)) {
          throw new NotationDataError(
            `<time-modification> has an invalid <${tag}>.`
          );
        }
      } else if (tag === 'normal-notes') {
        normalNotes = parseInt(el.textContent || '', 10);
        if (isNaN(normalNotes)) {
          throw new NotationDataError(
            `<time-modification> has an invalid <${tag}>.`
          );
        }
      } else if (tag === 'normal-type') {
        normalType = this.parseType(el);
      } else if (tag === 'normal-dot') {
        numDots += 1;
      }
    }

    if (normalType === null) {
      if (noteType === null) {
        throw new NotationDataError(
          `<${timeModEl.tagName}> must come after <type>.`
        );
      }
      normalType = noteType;
    }

    return new TupletRatio(
      normalNotes! * normalType.n,
      normalType.d,
      actualNotes! * normalType.n,
      normalType.d
    );
  }

  parseType(typeEl: Element): Fraction {
    const text = typeEl.textContent || '';
    const [numerator, denominator] = RHYTHM_TYPES.get(text) || [];
    if (numerator !== undefined && denominator !== undefined) {
      return new Fraction(numerator, denominator);
    } else {
      throw new NotationDataError(`<type> got unsupported value "${text}".`);
    }
  }

  getOpenTieByEndNote(endNote: Note): Note | null {
    for (let i = 0; i < this.openTies.length; i++) {
      const note = this.openTies[i];
      if (note !== endNote && note.pitch!.equals(endNote.pitch!)) {
        this.openTies.splice(i, 1);
        return note;
      }
    }
    return null;
  }

  addSlur(
    slur: Slur,
    startAttrs: Record<string, string>,
    endAttrs: Record<string, string> | null,
    startNote: Note,
    endNote: Note | null
  ): void {
    const otherSlurs = this.completeSlurs;
    const startEvent = this.score.getEventContainingNote(startNote);
    const endEvent = this.score.getEventContainingNote(endNote!);

    if (startEvent === endEvent) {
      // This is an "incomplete slur"
      slur.isIncomplete = true;
      slur.incompleteType =
        parseInt(startAttrs['default-x']) < 0
          ? Slur.INCOMPLETE_TYPE_INCOMING
          : Slur.INCOMPLETE_TYPE_OUTGOING;
    } else {
      slur.isIncomplete = false;
      slur.endEventId = endEvent!.eventId;
      endEvent!.isReferenced = true;

      // Check for slurs attached to specific notes
      if (
        this.heuristicSlurTargetsNotes(
          slur,
          startNote,
          startEvent!,
          endNote!,
          endEvent!,
          this.completeSlurs
        )
      ) {
        slur.startNote = startNote.noteId;
        slur.endNote = endNote!.noteId; // TODO: RESOLVE not null assertion
        startNote.isReferenced = true;
        endNote!.isReferenced = true; // TODO: RESOLVE not null assertion
      }
    }

    startEvent!.slurs.push(slur);
  }

  processBeams(partId: string): void {
    if (!(partId in this.openBeams)) {
      this.openBeams[partId] = {};
    }

    const partOpenBeams = this.openBeams[partId];
    const pendingEnds: number[] = [];

    for (const [sequence, event, beamData] of this.currentBeams) {
      event.isReferenced = true;
      beamData.sort((a, b) => a[0] - b[0]); // Ensure beam numbers are in ascending order.

      for (const [beamNumber, beamType] of beamData) {
        if (beamType === 'begin') {
          const beam = new Beam();
          beam.events.push(event);
          partOpenBeams[beamNumber] = beam;

          if (beamNumber === 1) {
            sequence.beams.push(beam);
          } else {
            try {
              const parentBeam = partOpenBeams[beamNumber - 1];
              parentBeam.children.push(beam);
            } catch (error) {
              throw new NotationDataError(
                `Got <beam number="${beamNumber}"> outside of <beam number="${
                  beamNumber - 1
                }">`
              );
            }
          }
        } else if (beamType === 'continue') {
          try {
            const beam = partOpenBeams[beamNumber];
            beam.events.push(event);
          } catch (error) {
            // TODO: Error message.
          }
        } else if (beamType === 'end') {
          try {
            const beam = partOpenBeams[beamNumber];
            beam.events.push(event);
            // Can't remove from partOpenBeams yet, because
            // there might be a secondary beam that relies
            // on this.
            pendingEnds.push(beamNumber);
          } catch (error) {
            // TODO: Error message.
          }
        } else if (
          beamType === 'forward hook' ||
          beamType === 'backward hook'
        ) {
          try {
            const parentBeam = partOpenBeams[beamNumber - 1];
            parentBeam.children.push(
              new BeamHook(event, beamType === 'forward hook')
            );
          } catch (error) {
            throw new NotationDataError(
              `Got <beam number="${beamNumber}"> outside of <beam number="${
                beamNumber - 1
              }">`
            );
          }
        }
      }

      if (pendingEnds.length) {
        for (const beamNumber of pendingEnds) {
          delete partOpenBeams[beamNumber];
        }
        pendingEnds.length = 0;
      }
    }

    this.currentBeams = [];
  }

  addOctaveShift(shiftType: number, noteList: (Note | Rest)[]): void {
    // noteList is assumed to be in order.
    const startEvent = this.score.getEventContainingNote(noteList[0]);
    const endEvent = this.score.getEventContainingNote(
      noteList[noteList.length - 1]
    );

    startEvent!.insertBefore(
      new OctaveShift(
        startEvent!.parent,
        shiftType,
        this.score.getEventMeasureLocation(endEvent!)
      )
    );
  }

  heuristicSlurTargetsNotes(
    slur: Slur,
    startNote: Note,
    startEvent: Event,
    endNote: Note,
    endEvent: Event,
    activeSlurs: [Slur, any, any, Note, Note | null][]
  ): boolean {
    for (const slurData of activeSlurs) {
      if (slurData[0] !== slur) {
        const otherStartEvent = this.score.getEventContainingNote(slurData[3]);
        const otherEndEvent = this.score.getEventContainingNote(slurData[4]!);
        if (otherStartEvent === startEvent && otherEndEvent === endEvent) {
          return true;
        }
      }
    }
    return false;
  }
}
