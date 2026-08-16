import type {
  Beam as MNXBeam,
  Clef as MNXClef,
  Event as MNXEvent,
  EventMarkings,
  Grace as MNXGrace,
  MeasureGlobal,
  MNXDocument,
  Note as MNXNote,
  NoteValue,
  NoteValueQuantity,
  Ottava,
  OttavaAmount,
  Part as MNXPart,
  PartMeasure,
  PositionedClef as MNXPositionedClef,
  Sequence as MNXSequence,
  SequenceContent,
  Slur as MNXSlur,
  Tie as MNXTie,
  Tuplet as MNXTuplet,
} from './mnx-types';
import {
  AccentMarking,
  Beam,
  BeamHook,
  BreathMarking,
  Score,
  Note,
  SoftAccentMarking,
  SpiccatoMarking,
  StaccatissimoMarking,
  StaccatoMarking,
  StressMarking,
  StrongAccentMarking,
  Slur,
  TenutoMarking,
  TremoloMarking,
  UnstressMarking,
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
  Marking,
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

const SLUR_SIDES_FOR_EXPORT = new Map([
  [Slur.SIDE_UP, 'up' as const],
  [Slur.SIDE_DOWN, 'down' as const],
]);

const OCTAVE_SHIFT_TYPES_FOR_EXPORT = new Map<number, OttavaAmount>([
  [OctaveShift.TYPE_8VA, 1],
  [OctaveShift.TYPE_8VB, -1],
  [OctaveShift.TYPE_15MA, 2],
  [OctaveShift.TYPE_15MB, -2],
  [OctaveShift.TYPE_22MA, 3],
  [OctaveShift.TYPE_22MB, -3],
]);

function measureIdForIndex(index: number): string {
  return `m${index + 1}`;
}

function parseMeasureLocation(location: string): {
  measureIndex: number;
  fraction: [number, number];
} {
  const match = /^(\d+):(\d+)\/(\d+)$/.exec(location);
  if (!match) {
    throw new Error(`Invalid measure location: ${location}`);
  }
  return {
    measureIndex: parseInt(match[1], 10) - 1,
    fraction: [parseInt(match[2], 10), parseInt(match[3], 10)],
  };
}

export const getMNXScore = (score: Score): MNXDocument => {
  const writer = new MNXWriter(score);
  return writer.encodeScore();
};

class MNXWriter {
  score: Score;
  needsMeasureIds: boolean;
  useBeams: boolean;

  constructor(score: Score) {
    this.score = score;
    this.needsMeasureIds = this.scoreHasOttavas();
    this.useBeams = this.scoreHasBeams();
  }

  scoreHasOttavas(): boolean {
    for (const bar of this.score.bars) {
      for (const barPart of Object.values(bar.barParts)) {
        for (const sequence of barPart.sequences) {
          for (const item of sequence.items) {
            if (item instanceof OctaveShift) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  scoreHasBeams(): boolean {
    for (const bar of this.score.bars) {
      for (const barPart of Object.values(bar.barParts)) {
        for (const sequence of barPart.sequences) {
          if (sequence.beams.length) {
            return true;
          }
        }
      }
    }
    return false;
  }

  encodeScore(): MNXDocument {
    const support: NonNullable<MNXDocument['mnx']['support']> = {
      useAccidentalDisplay: true,
    };
    if (this.useBeams) {
      support.useBeams = true;
    }
    return {
      mnx: {
        version: 1,
        support,
      },
      global: this.encodeGlobal(),
      parts: this.encodeParts(),
    };
  }

  encodeGlobal() {
    return {
      measures: this.score.bars.map((bar, index) =>
        this.encodeMeasureGlobal(bar, index)
      ),
    };
  }

  endingDuration(startIndex: number): number {
    const bars = this.score.bars;
    if (bars[startIndex].stopEnding) {
      return 1;
    }
    for (let i = startIndex + 1; i < bars.length; i++) {
      if (bars[i].stopEnding) {
        return i - startIndex + 1;
      }
      if (bars[i].startEnding) {
        return i - startIndex;
      }
    }
    return 1;
  }

  encodeMeasureGlobal(bar: Bar, index: number): MeasureGlobal {
    const result: MeasureGlobal = {};
    if (this.needsMeasureIds) {
      result.id = measureIdForIndex(index);
    }
    if (bar.timesig && bar.timesigChanged()) {
      const timeData: NonNullable<MeasureGlobal['time']> = {
        count: bar.timesig.count,
        unit: bar.timesig.unit as 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128,
      };
      if (bar.timesig.display) {
        timeData.display = bar.timesig.display;
      }
      result.time = timeData;
    }
    if (bar.keysig && bar.keysigChanged()) {
      result.key = { fifths: bar.keysig.fifths };
    }
    if (bar.startRepeat) {
      result.repeatStart = {};
    }
    if (bar.endRepeat) {
      const repeatEnd: MeasureGlobal['repeatEnd'] = {};
      if (bar.endRepeat > 2) {
        repeatEnd.times = bar.endRepeat;
      }
      result.repeatEnd = repeatEnd;
    }
    if (bar.startEnding) {
      const ending: NonNullable<MeasureGlobal['ending']> = {
        duration: this.endingDuration(index),
        numbers: bar.startEnding.numbers,
      };
      if (
        bar.startEnding.endingType === Ending.TYPE_DISCONTINUE ||
        (!bar.stopEnding && !bar.endRepeat)
      ) {
        ending.open = true;
      }
      result.ending = ending;
    }
    return result;
  }

  encodeParts() {
    return this.score.parts.map(part => this.encodePart(part));
  }

  encodePart(part: Part): MNXPart {
    const result: MNXPart = {
      measures: this.score.bars.map(bar =>
        this.encodePartMeasure(bar.barParts[part.partId])
      ),
    };
    if (part.name !== null) {
      result.name = part.name;
    }
    return result;
  }

  encodePartMeasure(barPart: BarPart): PartMeasure {
    const ottavas: Ottava[] = [];
    const sequences = barPart.sequences.map(sequence =>
      this.encodeSequence(sequence, ottavas)
    );
    const result: PartMeasure = { sequences };
    if (barPart.clefs.length) {
      result.clefs = barPart.clefs.map(clef => this.encodePositionedClef(clef));
    }
    if (ottavas.length) {
      result.ottavas = ottavas;
    }
    const beams = barPart.sequences.flatMap(sequence =>
      sequence.beams.map(beam => this.encodeBeam(beam))
    );
    if (beams.length) {
      result.beams = beams;
    }
    return result;
  }

  encodeSequence(
    sequence: Sequence,
    ottavas: Ottava[]
  ): Pick<MNXSequence, 'content' | 'voice'> {
    const content: SequenceContent = [];
    let position = new Fraction(0, 1);

    for (const item of sequence.items) {
      if (item instanceof OctaveShift) {
        ottavas.push(this.encodeOttava(item, position));
        continue;
      }
      const encoded = this.encodeSequenceItem(item);
      if (encoded) {
        content.push(encoded);
      }
      if (item instanceof Event) {
        position = position.add(item.duration.frac);
      } else if (item instanceof Tuplet) {
        // Advance by outer (sounding) duration of the tuplet.
        let tupletPos = new Fraction(0, 1);
        for (const tupletEvent of item.items) {
          if (tupletEvent instanceof Event) {
            tupletPos = tupletPos.add(tupletEvent.duration.frac);
          }
        }
        // Scale to outer duration: outer/inner ratio.
        const outer = new Fraction(
          item.ratio.outerNumerator,
          item.ratio.outerDenominator
        );
        const inner = new Fraction(
          item.ratio.innerNumerator,
          item.ratio.innerDenominator
        );
        position = position.add(tupletPos.mul(outer).div(inner));
      } else if (item instanceof GraceNoteGroup) {
        // Grace notes do not advance the rhythmic position.
      }
    }

    const result: Pick<MNXSequence, 'content' | 'voice'> = { content };
    if (sequence.sequenceId) {
      result.voice = sequence.sequenceId;
    }
    return result;
  }

  encodeSequenceItem(item: SequenceItem): SequenceContent[number] | undefined {
    if (item instanceof Event) {
      return this.encodeEvent(item);
    }
    if (item instanceof Tuplet) {
      return this.encodeTuplet(item);
    }
    if (item instanceof SequenceDirection) {
      // Ottavas are lifted to part-measure.ottavas.
      return undefined;
    }
    if (item instanceof GraceNoteGroup) {
      return this.encodeGraceNoteGroup(item);
    }
    return undefined;
  }

  encodeEvent(event: Event): MNXEvent {
    const result: MNXEvent = {
      duration: this.encodeNoteValue(event.duration),
    };
    if (event.isReferenced) {
      result.id = event.eventId;
    }
    if (event.isRest()) {
      result.rest = {};
    } else {
      result.notes = event.eventItems.map(note =>
        this.encodeNote(note as Note)
      );
    }
    if (event.slurs && event.slurs.length) {
      const encodedSlurs = event.slurs
        .map(slur => this.encodeSlur(slur))
        .filter((s): s is MNXSlur => s !== null);
      if (encodedSlurs.length) {
        result.slurs = encodedSlurs;
      }
    }
    if (event.markings && event.markings.length) {
      result.markings = this.encodeEventMarkings(event.markings);
    }
    return result;
  }

  encodeNoteValue(duration: RhythmicDuration): NoteValue {
    const base = NOTE_VALUE_BASES.get(duration.frac.toString());
    if (!base) {
      throw new Error(`Invalid duration fraction ${duration.frac.toString()}`);
    }
    const result: NoteValue = {
      base: base as NoteValue['base'],
    };
    if (duration.dots) {
      result.dots = duration.dots;
    }
    return result;
  }

  encodeNoteValueQuantity(
    numerator: number,
    denominator: number
  ): NoteValueQuantity {
    const unit = new Fraction(1, denominator);
    const base = NOTE_VALUE_BASES.get(unit.toString());
    if (!base) {
      throw new Error(
        `Invalid note-value quantity ${numerator}/${denominator}`
      );
    }
    return {
      multiple: numerator,
      duration: { base: base as NoteValue['base'] },
    };
  }

  encodeNote(note: Note): MNXNote {
    const result: MNXNote = { pitch: this.encodePitch(note.pitch!) };
    if (note.isReferenced) {
      result.id = note.noteId;
    }
    if (note.renderedAcc) {
      result.accidentalDisplay = { show: true };
    }
    if (note.ties.length) {
      const ties: MNXTie[] = [];
      for (const tie of note.ties) {
        if (!tie.endNote) {
          continue;
        }
        const tieData: MNXTie = { target: tie.endNote.noteId };
        if (tie.side) {
          tieData.side = tie.side;
        }
        ties.push(tieData);
      }
      if (ties.length) {
        result.ties = ties;
      }
    }
    return result;
  }

  encodeEventMarkings(markings: Marking[]): EventMarkings {
    const result: EventMarkings = {};
    for (const marking of markings) {
      if (marking instanceof AccentMarking) {
        result.accent = {};
      } else if (marking instanceof BreathMarking) {
        result.breath = {};
      } else if (marking instanceof SoftAccentMarking) {
        result.softAccent = {};
      } else if (marking instanceof SpiccatoMarking) {
        result.spiccato = {};
      } else if (marking instanceof StaccatissimoMarking) {
        result.staccatissimo = {};
      } else if (marking instanceof StaccatoMarking) {
        result.staccato = {};
      } else if (marking instanceof StressMarking) {
        result.stress = {};
      } else if (marking instanceof StrongAccentMarking) {
        result.strongAccent = {};
      } else if (marking instanceof TenutoMarking) {
        result.tenuto = {};
      } else if (marking instanceof TremoloMarking) {
        result.tremolo = { marks: marking.marks };
      } else if (marking instanceof UnstressMarking) {
        result.unstress = {};
      }
    }
    return result;
  }

  encodePitch(pitch: Pitch): MNXNote['pitch'] {
    const result: MNXNote['pitch'] = {
      step: pitch.step as MNXNote['pitch']['step'],
      octave: pitch.octave,
    };
    if (pitch.alter) {
      result.alter = pitch.alter;
    }
    return result;
  }

  encodeSlur(slur: Slur): MNXSlur | null {
    // Incomplete slurs (no target) are not representable in the current schema.
    if (slur.isIncomplete || slur.endEventId === null) {
      return null;
    }
    const result: MNXSlur = {
      target: slur.endEventId,
    };
    if (slur.startNote) {
      result.startNote = slur.startNote;
    }
    if (slur.endNote) {
      result.endNote = slur.endNote;
    }
    if (slur.side !== null) {
      result.side = SLUR_SIDES_FOR_EXPORT.get(slur.side);
    }
    return result;
  }

  encodeTuplet(tuplet: Tuplet): MNXTuplet {
    return {
      type: 'tuplet',
      inner: this.encodeNoteValueQuantity(
        tuplet.ratio.innerNumerator,
        tuplet.ratio.innerDenominator
      ),
      outer: this.encodeNoteValueQuantity(
        tuplet.ratio.outerNumerator,
        tuplet.ratio.outerDenominator
      ),
      content: tuplet.items
        .map(item => this.encodeSequenceItem(item))
        .filter((item): item is SequenceContent[number] => item !== undefined),
    };
  }

  encodeOttava(octaveShift: OctaveShift, position: Fraction): Ottava {
    const end = parseMeasureLocation(String(octaveShift.endPos));
    return {
      position: { fraction: [position.n, position.d] },
      end: {
        measure: measureIdForIndex(end.measureIndex),
        position: { fraction: end.fraction },
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: OCTAVE_SHIFT_TYPES_FOR_EXPORT.get(octaveShift.shiftType)!,
    };
  }

  encodeGraceNoteGroup(graceNoteGroup: GraceNoteGroup): MNXGrace {
    return {
      type: 'grace',
      content: graceNoteGroup.events.map(event => this.encodeEvent(event)),
    };
  }

  encodeBeam(beam: Beam): MNXBeam {
    const result: MNXBeam = {
      events: beam.events.map(event => event.eventId),
    };
    if (beam.children.length) {
      result.beams = beam.children.map(child => this.encodeBeamChild(child));
    }
    return result;
  }

  encodeBeamChild(child: Beam | BeamHook): MNXBeam {
    if (child instanceof BeamHook) {
      return {
        events: [child.event.eventId],
        direction: child.isForward ? 'right' : 'left',
      };
    }
    return this.encodeBeam(child);
  }

  encodePositionedClef(positionedClef: PositionedClef): MNXPositionedClef {
    const result: MNXPositionedClef = {
      clef: this.encodeClef(positionedClef.clef),
    };
    if (positionedClef.position.n !== 0) {
      result.position = {
        fraction: [positionedClef.position.n, positionedClef.position.d],
      };
    }
    return result;
  }

  encodeClef(clef: Clef): MNXClef {
    return {
      staffPosition: clef.position,
      sign: clef.sign as MNXClef['sign'],
    };
  }
}
