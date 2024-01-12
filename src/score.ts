import Fraction from 'fraction.js';

const DEFAULT_KEYSIG = 0;
const NUM_PITCHES_IN_OCTAVE = 12;

export enum WHITE_KEY {
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  A = 'A',
  B = 'B',
}

const KEYSIG_PITCHES: Array<[number, [WHITE_KEY, number]]> = [
  [0, [WHITE_KEY.C, 0]],
  [1, [WHITE_KEY.G, 0]],
  [2, [WHITE_KEY.D, 0]],
  [3, [WHITE_KEY.A, 0]],
  [4, [WHITE_KEY.E, 0]],
  [5, [WHITE_KEY.B, 0]],
  [6, [WHITE_KEY.F, 1]],
  [7, [WHITE_KEY.C, 1]],
  [-1, [WHITE_KEY.F, 0]],
  [-2, [WHITE_KEY.B, -1]],
  [-3, [WHITE_KEY.E, -1]],
  [-4, [WHITE_KEY.A, -1]],
  [-5, [WHITE_KEY.D, -1]],
  [-6, [WHITE_KEY.G, -1]],
  [-7, [WHITE_KEY.C, -1]],
];

const KEYSIG_TO_PITCH = new Map(
  KEYSIG_PITCHES.map(entry => {
    return [entry[0], entry[1]];
  })
);

const PITCH_TO_KEYSIG = new Map(
  KEYSIG_PITCHES.map(entry => {
    return [entry[1], entry[0]];
  })
);

export class Score {
  parts: Part[] = [];
  bars: Bar[] = [];

  getEventMeasureLocation(event: Event): string {
    for (let barIdx = 0; barIdx < this.bars.length; barIdx++) {
      const bar = this.bars[barIdx];
      for (const barPart of Object.values(bar.barParts)) {
        for (const sequence of barPart.sequences) {
          let metricalPos = new Fraction(0, 1);
          for (const seqEvent of sequence.iterEvents()) {
            if (seqEvent === event) {
              return `${barIdx + 1}:${metricalPos.n}/${metricalPos.d}`;
            }
            metricalPos = metricalPos.add(seqEvent.duration.frac);
          }
        }
      }
    }
    return '';
  }

  getEventContainingNote(note: Note | Rest): Event | null {
    for (const bar of this.bars) {
      for (const barPart of Object.values(bar.barParts)) {
        for (const sequence of barPart.sequences) {
          for (const event of sequence.iterEvents()) {
            for (const eventItem of event.eventItems) {
              if (eventItem === note) {
                return event;
              }
            }
          }
        }
      }
    }
    return null;
  }
}

export class Part {
  partId: string;
  name: string | null = null;
  transpose = 0;

  constructor(partId: string, name: string | null = null, transpose = 0) {
    this.partId = partId;
    this.name = name;
    this.transpose = transpose;
  }
}

export class Bar {
  score: Score;
  idx: number;
  timesig: number[];
  keysig: KeySignature | null;
  startRepeat = false;
  endRepeat = 0;
  startEnding: Ending | null = null;
  stopEnding: Ending | null = null;
  barParts: Record<string, BarPart> = {};

  constructor(
    score: Score,
    idx: number,
    timesig: number[] = [],
    keysig: KeySignature | null = null
  ) {
    this.score = score;
    this.idx = idx;
    this.timesig = timesig;
    this.keysig = keysig;
  }

  previous(): Bar | null {
    return this.idx === 0 ? null : this.score.bars[this.idx - 1];
  }

  timesigChanged(): boolean {
    return (
      this.idx === 0 ||
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.previous()!.timesig.toString() !== this.timesig.toString()
    );
  }

  activeKeysig(): KeySignature {
    let idx = this.idx;
    while (idx >= 0) {
      const bar = this.score.bars[idx];
      if (bar.keysig !== null) {
        return bar.keysig;
      }
      idx -= 1;
    }
    return new KeySignature(DEFAULT_KEYSIG);
  }

  keysigChanged(): boolean {
    return (
      (this.idx === 0 && this.keysig && this.keysig.fifths !== 0) ||
      (this.idx !== 0 &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        !this.previous()!.activeKeysig().equals(this.activeKeysig()))
    );
  }
}

export class BarPart {
  sequences: Sequence[] = [];
  clefs: PositionedClef[] = [];

  getSequence(sequenceId: string): Sequence | null {
    for (const sequence of this.sequences) {
      if (sequence.sequenceId === sequenceId) {
        return sequence;
      }
    }
    return null;
  }

  getOrCreateSequence(sequenceId: string): Sequence {
    let sequence = this.getSequence(sequenceId);
    if (sequence === null) {
      sequence = new Sequence([], sequenceId);
      this.sequences.push(sequence);
    }
    return sequence;
  }
}

export class SequenceItem {
  parent: SequenceContent;

  constructor(parent: SequenceContent) {
    this.parent = parent;
  }

  insertBefore(otherSequenceItem: SequenceItem): void {
    const parentItems = this.parent.items;
    const idx = parentItems.indexOf(this);
    parentItems.splice(idx, 0, otherSequenceItem);
  }
}

export class SequenceContent {
  items: SequenceItem[];

  constructor(items: SequenceItem[]) {
    this.items = items;
  }

  *iterEvents(): Generator<Event, void, unknown> {
    for (const item of this.items) {
      if (item instanceof Event) {
        yield item;
      } else if (item instanceof SequenceContent) {
        yield* item.iterEvents();
      }
    }
  }

  findItemIdxByEvent(target: Event): number | null {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item instanceof Event) {
        if (item === target) {
          return i;
        }
      } else if (item instanceof SequenceContent) {
        const innerIdx = item.findItemIdxByEvent(target);
        if (innerIdx !== null) {
          return i + innerIdx;
        }
      }
    }
    return null;
  }

  foldItems(
    itemList: Event[],
    SequenceItemSubClass: typeof Tuplet,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    kwargs: any
  ): boolean {
    const startIdx = this.findItemIdxByEvent(itemList[0]);
    const endIdx = this.findItemIdxByEvent(itemList[itemList.length - 1]);

    if (startIdx !== null && endIdx !== null) {
      const foldedItems = this.items.slice(startIdx, endIdx + 1);
      this.items.splice(
        startIdx,
        endIdx - startIdx + 1,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new SequenceItemSubClass(this, foldedItems, kwargs)
      );
      return true;
    } else {
      throw new Error('Could not fold items.');
    }
  }

  setTuplet(ratio: TupletRatio, itemList: Event[]): void {
    this.foldItems(itemList, Tuplet, ratio);
  }
}

export class Sequence extends SequenceContent {
  sequenceId: string;
  beams: any[];

  constructor(items: SequenceItem[], sequenceId: string, beams: any[] = []) {
    super(items);
    this.sequenceId = sequenceId;
    this.beams = beams;
  }

  getLastEvent(): Event | null {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const obj = this.items[i];
      if (obj instanceof Event) {
        return obj;
      }
    }
    return null;
  }
}

export class Tuplet extends SequenceItem {
  items: SequenceItem[];
  ratio: TupletRatio;

  constructor(
    parent: SequenceContent,
    items: SequenceItem[],
    ratio: TupletRatio
  ) {
    super(parent);
    this.items = items;
    this.ratio = ratio;
  }
}

export class TupletRatio {
  outerNumerator: number;
  outerDenominator: number;
  innerNumerator: number;
  innerDenominator: number;

  constructor(
    outerNumerator: number,
    outerDenominator: number,
    innerNumerator: number,
    innerDenominator: number
  ) {
    this.outerNumerator = outerNumerator;
    this.outerDenominator = outerDenominator;
    this.innerNumerator = innerNumerator;
    this.innerDenominator = innerDenominator;
  }
}

export class GraceNoteGroup extends SequenceItem {
  events: Event[] = [];
}

export class Event extends SequenceItem {
  eventId: string;
  duration: RhythmicDuration;
  eventItems: EventItem[];
  slurs: Slur[];
  isReferenced: boolean;

  constructor(
    parent: SequenceContent,
    eventId: string,
    duration: RhythmicDuration
  ) {
    super(parent);
    this.eventId = eventId;
    this.duration = duration;
    this.eventItems = [];
    this.slurs = [];
    this.isReferenced = false;
  }

  isRest(): boolean {
    for (const eventItem of this.eventItems) {
      if (eventItem instanceof Note) {
        return false;
      }
    }
    return true;
  }
}

export class Beam {
  events: Event[] = [];
  children: any[] = [];
}

export class BeamHook {
  event: Event;
  isForward: boolean;

  constructor(event: Event, isForward: boolean) {
    this.event = event;
    this.isForward = isForward;
  }
}

export class SequenceDirection extends SequenceItem {}

export class OctaveShift extends SequenceDirection {
  //  These are arbitrary codes, used only internally.
  static TYPE_8VA = 1;
  static TYPE_8VB = 2;
  static TYPE_15MA = 3;
  static TYPE_15MB = 4;
  static TYPE_22MA = 5;
  static TYPE_22MB = 6;

  shiftType: number;
  endPos: any;

  constructor(parent: SequenceContent, shiftType: number, endPos: any = null) {
    super(parent);
    this.shiftType = shiftType;
    this.endPos = endPos;
  }
}

export class Ending {
  // These are arbitrary codes, used only internally.
  static TYPE_START = 1;
  static TYPE_STOP = 2;
  static TYPE_DISCONTINUE = 3;

  endingType: number;
  numbers: number[];

  constructor(endingType: number, numbers: number[] = []) {
    this.endingType = endingType;
    this.numbers = numbers;
  }
}

export class EventItem {}

export class Note extends EventItem {
  static ACCIDENTAL_SHARP = 1;
  static ACCIDENTAL_NATURAL = 2;
  static ACCIDENTAL_FLAT = 3;
  static ACCIDENTAL_DOUBLE_SHARP = 4;
  static ACCIDENTAL_DOUBLE_FLAT = 5;
  static ACCIDENTAL_NATURAL_SHARP = 6;
  static ACCIDENTAL_NATURAL_FLAT = 7;

  score: Score;
  noteId: string;
  pitch: Pitch | null;
  renderedAcc: number | null;
  tieEndNote: string | null;
  isReferenced: boolean;

  constructor(score: Score, noteId: string) {
    super();
    this.score = score;
    this.noteId = noteId;
    this.pitch = null;
    this.renderedAcc = null;
    this.tieEndNote = null;
    this.isReferenced = false;
  }
}

export class Rest extends EventItem {}

export class Slur {
  //  These are arbitrary codes, used only internally.
  static SIDE_UP = 1;
  static SIDE_DOWN = 2;
  static INCOMPLETE_TYPE_INCOMING = 1;
  static INCOMPLETE_TYPE_OUTGOING = 2;

  endEventId: string | null;
  side: number | null;
  isIncomplete: boolean | null;
  incompleteType: number | null;
  startNote: any;
  endNote: any;

  constructor(
    endEventId: string | null = null,
    side: number | null = null,
    isIncomplete: boolean | null = null,
    incompleteType: number | null = null,
    startNote: any = null,
    endNote: any = null
  ) {
    this.endEventId = endEventId;
    this.side = side;
    this.isIncomplete = isIncomplete;
    this.incompleteType = incompleteType;
    this.startNote = startNote;
    this.endNote = endNote;
  }
}

export class RhythmicDuration {
  frac: Fraction;
  dots: number;

  constructor(frac: Fraction, dots = 0) {
    this.frac = frac;
    this.dots = dots;
  }

  equals(other: RhythmicDuration): boolean {
    return (
      this.dots === other.dots && this.frac.toString() === other.frac.toString()
    );
  }
}

export const STEP_INTEGER_WHITE_KEY: Record<number, WHITE_KEY> = {
  0: WHITE_KEY.C,
  2: WHITE_KEY.D,
  4: WHITE_KEY.E,
  5: WHITE_KEY.F,
  7: WHITE_KEY.G,
  9: WHITE_KEY.A,
  11: WHITE_KEY.B,
};

export class Pitch {
  step: WHITE_KEY;
  octave: number;
  alter: number;

  constructor(step: WHITE_KEY, octave: number, alter = 0) {
    this.step = step;
    this.octave = octave;
    this.alter = alter;
  }

  equals(other: Pitch): boolean {
    return (
      this.step === other.step &&
      this.octave === other.octave &&
      this.alter === other.alter
    );
  }

  static fromMidiNumber(midiNumber: number, preferFlat = true): Pitch {
    const octave = Math.floor(midiNumber / NUM_PITCHES_IN_OCTAVE) - 1;
    let stepInteger = midiNumber % NUM_PITCHES_IN_OCTAVE;
    let alter: number;
    if (stepInteger in STEP_INTEGER_WHITE_KEY) {
      alter = 0;
    } else {
      if (preferFlat) {
        stepInteger = (stepInteger + 1) % NUM_PITCHES_IN_OCTAVE;
        alter = -1;
      } else {
        stepInteger =
          (stepInteger - 1 + NUM_PITCHES_IN_OCTAVE) % NUM_PITCHES_IN_OCTAVE;
        alter = 1;
      }
    }
    return new Pitch(STEP_INTEGER_WHITE_KEY[stepInteger], octave, alter);
  }

  midiNumber(): number {
    return (
      NUM_PITCHES_IN_OCTAVE * (this.octave + 1) +
      this.stepInteger() +
      this.alter
    );
  }

  stepInteger(): number {
    return {
      [WHITE_KEY.C]: 0,
      [WHITE_KEY.D]: 2,
      [WHITE_KEY.E]: 4,
      [WHITE_KEY.F]: 5,
      [WHITE_KEY.G]: 7,
      [WHITE_KEY.A]: 9,
      [WHITE_KEY.B]: 11,
    }[this.step];
  }

  accidentalString(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { 0: '', 1: '#', 2: '##', '-1': 'b', '-2': 'bb' }[this.alter]!;
  }

  scientificPitchString(): string {
    return `${this.step}${this.accidentalString()}${this.octave}`;
  }

  transposeChromatic(semitones: number): Pitch {
    if (!semitones) {
      return this;
    }
    return Pitch.fromMidiNumber(this.midiNumber() + semitones);
  }

  toConcert(part: Part): Pitch {
    return this.transposeChromatic(part.transpose);
  }
}

export class KeySignature {
  fifths: number;

  constructor(fifths: number) {
    this.fifths = fifths;
  }

  equals(other: KeySignature): boolean {
    return this.fifths === other.fifths;
  }

  static fromPitch(pitch: Pitch): KeySignature {
    try {
      const fifths = PITCH_TO_KEYSIG.get([pitch.step, pitch.alter]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return new KeySignature(fifths!);
    } catch (error) {
      // TODO: Try enharmonic equivalents.
      throw new Error(
        `Pitch ${pitch.scientificPitchString()} doesn't have a clear key signature`
      );
    }
  }

  pitch(): Pitch {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [step, alter] = KEYSIG_TO_PITCH.get(this.fifths)!;
    // TODO: Octave is hard-coded to 4. It would be more elegant
    // to have a separate PitchClass class to represent abstract
    // pitch classes removed from a specific octave.
    return new Pitch(step, 4, alter);
  }

  transposeChromatic(semitones: number): KeySignature {
    if (!semitones) {
      return this; // No alteration needed.
    }
    return KeySignature.fromPitch(this.pitch().transposeChromatic(semitones));
  }

  toConcert(part: Part): KeySignature {
    /**
     * Given a Part object that describes this KeySignature, returns
     * this KeySignature in concert pitch, taking the Part's
     * transposition into account.
     */
    return this.transposeChromatic(part.transpose);
  }
}

export class Clef {
  sign: string;
  position: number;

  constructor(sign: string, position: number) {
    this.sign = sign;
    this.position = position; // 0 means "middle of staff"
  }
}

export class PositionedClef {
  clef: Clef;
  position: Fraction;

  constructor(clef: Clef, position: Fraction) {
    this.clef = clef;
    this.position = position; // Rhythmic position within the bar.
  }
}
