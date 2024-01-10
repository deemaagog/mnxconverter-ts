/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MNXDocument,
  MNXEventContent,
  MNXGlobalMeasure,
  MNXGraceContent,
  MNXNote,
  MNXOctaveShiftContent,
  MNXPart,
  MNXPartMeasure,
  MNXPartMeasureClef,
  MNXSlur,
  MNXTupletContent,
  NoteValue,
} from './mnx-types';
import {
  Score,
  Note,
  Slur,
  OctaveShift,
  Ending,
  Bar,
  Part,
  Sequence,
  SequenceItem,
  SequenceDirection,
  GraceNoteGroup,
  Tuplet,
  Event,
  Pitch,
  PositionedClef,
  Clef,
  BarPart,
  RhythmicDuration,
} from './score';
import Fraction from 'fraction.js';

const NOTE_VALUE_BASES = new Map([
  [new Fraction(16).toString(), 'duplexMaxima'],
  [new Fraction(8).toString(), 'maxima'],
  [new Fraction(4).toString(), 'longa'],
  [new Fraction(2).toString(), 'breve'],
  [new Fraction(1).toString(), 'whole'],
  [new Fraction(1, 2).toString(), 'half'],
  [new Fraction(1, 4).toString(), 'quarter'],
  [new Fraction(1, 8).toString(), 'eighth'],
  [new Fraction(1, 16).toString(), '16th'],
  [new Fraction(1, 32).toString(), '32nd'],
  [new Fraction(1, 64).toString(), '64th'],
  [new Fraction(1, 128).toString(), '128th'],
  [new Fraction(1, 256).toString(), '256th'],
  [new Fraction(1, 512).toString(), '512th'],
  [new Fraction(1, 1024).toString(), '1024th'],
  [new Fraction(1, 2048).toString(), '2048th'],
  [new Fraction(1, 4096).toString(), '4096th'],
]);

const ACCIDENTAL_TYPES_FOR_EXPORT = new Map([
  [Note.ACCIDENTAL_SHARP, 'sharp'],
  [Note.ACCIDENTAL_NATURAL, 'natural'],
  [Note.ACCIDENTAL_FLAT, 'flat'],
  [Note.ACCIDENTAL_DOUBLE_SHARP, 'double-sharp'],
  [Note.ACCIDENTAL_DOUBLE_FLAT, 'double-flat'],
  [Note.ACCIDENTAL_NATURAL_SHARP, 'natural-sharp'],
  [Note.ACCIDENTAL_NATURAL_FLAT, 'natural-flat'],
]);

const SLUR_SIDES_FOR_EXPORT = new Map([
  [Slur.SIDE_UP, 'up'],
  [Slur.SIDE_DOWN, 'down'],
]);

const OCTAVE_SHIFT_TYPES_FOR_EXPORT = new Map([
  [OctaveShift.TYPE_8VA, -8], // Looks like shift value should be number according to spec. TODO: Create an issue
  [OctaveShift.TYPE_8VB, 8],
  [OctaveShift.TYPE_15MA, -15],
  [OctaveShift.TYPE_15MB, 15],
  [OctaveShift.TYPE_22MA, -22],
  [OctaveShift.TYPE_22MB, 22],
]);

const ENDING_TYPES_FOR_EXPORT = new Map([
  [Ending.TYPE_START, 'start'],
  [Ending.TYPE_STOP, 'stop'],
  [Ending.TYPE_DISCONTINUE, 'discontinue'],
]);

const SLUR_INCOMPLETE_LOCATIONS_FOR_EXPORT = new Map([
  [Slur.INCOMPLETE_TYPE_INCOMING, 'incoming'],
  [Slur.INCOMPLETE_TYPE_OUTGOING, 'outgoing'],
]);

export const getMNXScore = (score: Score): MNXDocument => {
  const writer = new MNXWriter(score);
  return writer.encodeScore();
};

class MNXWriter {
  score: Score;

  constructor(score: Score) {
    this.score = score;
  }

  encodeScore(): MNXDocument {
    const result: MNXDocument = {
      mnx: { version: 1 },
      global: this.encodeGlobal(),
      parts: this.encodeParts(),
    };
    return result;
  }

  encodeGlobal() {
    const measures = this.score.bars.map(bar => this.encodeMeasureGlobal(bar));
    return {
      measures,
    };
  }

  encodeMeasureGlobal(bar: Bar) {
    const result: MNXGlobalMeasure = {};
    if (bar.timesig.length && bar.timesigChanged()) {
      result['time'] = {
        count: bar.timesig[0],
        unit: bar.timesig[1],
      };
    }
    if (bar.keysig && bar.keysigChanged()) {
      result['key'] = { fifths: bar.keysig.fifths };
    }
    if (bar.startRepeat) {
      result['repeat-start'] = {};
    }
    if (bar.endRepeat) {
      const repeatEnd: MNXGlobalMeasure['repeat-end'] = {};
      if (bar.endRepeat > 2) {
        repeatEnd['times'] = bar.endRepeat;
      }
      result['repeat-end'] = repeatEnd;
    }
    if (bar.startEnding) {
      // @ts-expect-error TODO: Looks like ending duration shouldnt be required. TODO: Create issue
      result['ending'] = {
        numbers: bar.startEnding.numbers,
      };
    }
    return result;
  }

  encodeParts() {
    return this.score.parts.map(part => this.encodePart(part));
  }

  encodePart(part: Part): MNXPart {
    const result: MNXPart = {};
    if (part.name !== null) {
      result['name'] = part.name;
    }
    result['measures'] = this.score.bars.map(bar =>
      this.encodePartMeasure(bar.barParts[part.partId])
    );
    return result;
  }

  encodePartMeasure(barPart: BarPart) {
    const result: MNXPartMeasure = {
      // @ts-expect-error TODO: figure out type
      sequences: barPart.sequences.map(sequence =>
        this.encodeSequence(sequence)
      ),
    };
    if (barPart.clefs.length) {
      result['clefs'] = barPart.clefs.map(clef =>
        this.encodePositionedClef(clef)
      );
    }
    // TODO: Implement beams.
    return result;
  }

  encodeSequence(sequence: Sequence) {
    return {
      content: sequence.items.map(item => this.encodeSequenceItem(item)),
    };
  }

  encodeSequenceItem(item: SequenceItem) {
    if (item instanceof Event) {
      return this.encodeEvent(item);
    } else if (item instanceof Tuplet) {
      return this.encodeTuplet(item);
    } else if (item instanceof SequenceDirection) {
      return this.encodeSequenceDirection(item);
    } else if (item instanceof GraceNoteGroup) {
      return this.encodeGraceNoteGroup(item);
    }
  }

  encodeEvent(event: Event) {
    const result: MNXEventContent = { type: 'event' };
    result['duration'] = this.encodeNoteValue(event.duration);
    if (event.isReferenced) {
      result['id'] = event.eventId;
    }
    if (event.isRest()) {
      result['rest'] = {};
    } else {
      result['notes'] = event.eventItems.map(note =>
        this.encodeNote(note as Note)
      );
    }
    if (event.slurs && event.slurs.length) {
      const encodedSlurs = event.slurs
        .map(slur => this.encodeSlur(slur))
        .filter(s => s !== null);
      result['slurs'] = encodedSlurs as MNXSlur[];
    }
    return result;
  }

  encodeNoteValue(duration: RhythmicDuration) {
    const result: NoteValue = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      base: NOTE_VALUE_BASES.get(duration.frac.toString())!,
    };
    if (!result.base) {
      throw new Error(`Invalid duration fraction ${duration.frac.toString()}`);
    }
    if (duration.dots) {
      result['dots'] = duration.dots;
    }
    return result;
  }

  encodeNote(note: Note) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result: MNXNote = { pitch: this.encodePitch(note.pitch!) };
    if (note.isReferenced) {
      result['id'] = note.noteId;
    }
    if (note.renderedAcc) {
      result['accidentalDisplay'] = { show: true };
    }
    if (note.tieEndNote) {
      result['tied'] = { target: note.tieEndNote };
    }
    return result;
  }

  encodePitch(pitch: Pitch) {
    const result: MNXNote['pitch'] = {
      step: pitch.step,
      octave: pitch.octave,
    };
    if (pitch.alter) {
      result['alter'] = pitch.alter;
    }
    return result;
  }

  encodeSlur(slur: Slur) {
    const result: MNXSlur = {};
    if (slur.isIncomplete) {
      try {
        result['location'] = SLUR_INCOMPLETE_LOCATIONS_FOR_EXPORT.get(
          // Since we know it's incomplete
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          slur.incompleteType!
        );
      } catch (error) {
        // We got an unknown/missing slur.incompleteType.
        // Rather than generating invalid markup, we just
        // return null.
        return null;
      }
    } else {
      if (slur.endEventId === null) {
        // Don't create the <slur>, because we don't have
        // enough data.
        return null;
      }
      result['target'] = slur.endEventId;
      if (slur.startNote) {
        result['start-note'] = slur.startNote;
      }
      if (slur.endNote) {
        result['end-note'] = slur.endNote;
      }
    }
    if (slur.side !== null) {
      result['side'] = SLUR_SIDES_FOR_EXPORT.get(slur.side);
    }
    return result;
  }

  encodeTuplet(tuplet: Tuplet) {
    const result: MNXTupletContent = {
      inner: {
        // @ts-expect-error TODO
        duration: 'TODO',
        multiple: tuplet.ratio.innerNumerator,
      },
      outer: {
        // @ts-expect-error TODO
        duration: 'TODO',
        multiple: tuplet.ratio.outerNumerator,
      },
    };
    result['content'] = tuplet.items.map(
      item => this.encodeSequenceItem(item) as MNXEventContent
    );
    return result;
  }

  encodeSequenceDirection(direction: SequenceDirection) {
    if (direction instanceof OctaveShift) {
      return this.encodeOctaveShift(direction);
    }
  }

  encodeOctaveShift(octaveShift: OctaveShift): MNXOctaveShiftContent {
    return {
      end: octaveShift.endPos,
      type: 'octave-shift',
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: OCTAVE_SHIFT_TYPES_FOR_EXPORT.get(octaveShift.shiftType)!,
    };
  }

  encodeGraceNoteGroup(graceNoteGroup: GraceNoteGroup): MNXGraceContent {
    return {
      content: graceNoteGroup.events.map(event => this.encodeEvent(event)),
      type: 'grace',
    };
  }

  encodePositionedClef(positionedClef: PositionedClef) {
    const result: MNXPartMeasureClef = {
      clef: this.encodeClef(positionedClef.clef),
    };
    if (positionedClef.position.n !== 0) {
      result['position'] = this.encodeRhythmicPosition(positionedClef.position);
    }
    return result;
  }

  encodeClef(clef: Clef) {
    return {
      position: clef.position,
      sign: clef.sign,
    };
  }

  encodeRhythmicPosition(position: Fraction) {
    return {
      fraction: [position.n, position.d],
    };
  }
}
