export type StyleClass = string;
export type Color = string;
export type MeasureLocation = string;
export type MeasureNumber = number;
export type SmuflGlyph = string;
export type PositiveInteger = number;
export type StaveLabel = string;
export type StaveSymbol = string;
export type StaveLabelref = string;
export type Id = string;
export type StaffNumber = number;
export type StemDirection = string;
export type VoiceName = string;
export type SystemLayoutContent = (
  | {
      content: SystemLayoutContent;
      label?: StaveLabel;
      symbol?: StaveSymbol;
      type: 'group';
    }
  | {
      label?: StaveLabel;
      labelref?: StaveLabelref;
      sources: {
        label?: StaveLabel;
        labelref?: StaveLabelref;
        part: Id;
        staff?: StaffNumber;
        stem?: StemDirection;
        voice?: VoiceName;
      }[];
      symbol?: StaveSymbol;
      type: 'staff';
    }
)[];
export type BeamList = {
  events: Id[];
  hooks?: {
    direction: string;
    event: Id;
  }[];
  inner?: BeamList;
}[];
export type StaffPosition = number;
export type IntegerUnsigned = number;
export type SmuflFont = string;
export type SlurTieEndLocation = string;
export type Orientation = string;
export type SlurSide = string;
export type TupletDisplaySetting = string;

/**
 * An encoding of Common Western Music Notation.
 */

export interface MNXGlobalMeasure {
  barline?: {
    type?: string;
  };
  ending?: {
    class?: StyleClass;
    color?: Color;
    duration: number;
    numbers?: number[];
    open?: boolean;
  };
  fine?: {
    class?: StyleClass;
    color?: Color;
    location: MeasureLocation;
  };
  index?: MeasureNumber;
  jump?: {
    location: MeasureLocation;
    type: string;
  };
  key?: {
    class?: StyleClass;
    color?: Color;
    fifths: number;
  };
  number?: MeasureNumber;
  'repeat-end'?: {
    times?: number;
  };
  'repeat-start'?: Record<string, unknown>;
  segno?: {
    class?: StyleClass;
    color?: Color;
    glyph?: SmuflGlyph;
    location: MeasureLocation;
  };
  tempos?: {
    bpm: number;
    location?: MeasureLocation;
    value: NoteValue;
  }[];
  time?: {
    count: PositiveInteger;
    unit: number;
  };
}

export interface MNXPartMeasureClef {
  clef: {
    class?: StyleClass;
    color?: string;
    glyph?: SmuflGlyph;
    octave?: number;
    position: StaffPosition;
    sign: string;
  };
  position?: {
    fraction: IntegerUnsigned[];
    graceIndex?: IntegerUnsigned;
  };
}

export interface MNXGraceContent {
  class?: StyleClass;
  color?: Color;
  content: MNXEventContent[];
  'grace-type'?: string;
  slash?: boolean;
  type: 'grace';
}

export interface MNXTupletContent {
  bracket?: string;
  content: MNXEventContent[];
  inner: NoteValueQuantity;
  orient?: Orientation;
  outer: NoteValueQuantity;
  'show-number'?: TupletDisplaySetting;
  'show-value'?: TupletDisplaySetting;
  staff?: StaffNumber;
  type: 'tuplet';
}

export interface MNXOctaveShiftContent {
  end: MeasureLocation;
  orient?: Orientation;
  staff?: StaffNumber;
  type: 'octave-shift';
  value: number;
}

export interface MNXPartMeasureSequence {
  content: (
    | MNXEventContent
    | MNXGraceContent
    | MNXTupletContent
    | MNXOctaveShiftContent
    | {
        duration: NoteValueQuantity;
        type: 'space';
      }
    | {
        glyph?: SmuflGlyph;
        type: 'dynamic';
        value: string;
      }
  )[];
  orient?: Orientation;
  staff?: StaffNumber;
  voice?: VoiceName;
}

export interface MNXPartMeasure {
  beams?: BeamList;
  clefs?: MNXPartMeasureClef[];
  sequences: MNXPartMeasureSequence[];
}

export interface MNXPart {
  id?: Id;
  measures?: MNXPartMeasure[];
  name?: string;
  'short-name'?: string;
  'smufl-font'?: SmuflFont;
  staves?: number;
}

export interface MNXDocument {
  global: {
    measures: MNXGlobalMeasure[];
    styles?: {
      color?: Color;
      selector: string;
    }[];
  };
  layouts?: {
    content: SystemLayoutContent;
    id: Id;
  }[];
  mnx: {
    version: number;
  };
  parts: MNXPart[];
  scores?: {
    layout?: Id;
    'multimeasure-rests'?: {
      duration: number;
      label?: string;
      start: MeasureNumber;
    }[];
    name: string;
    pages?: {
      layout?: Id;
      systems: {
        layout?: Id;
        'layout-changes'?: {
          layout: Id;
          location: MeasureLocation;
        }[];
        measure: MeasureNumber;
      }[];
    }[];
  }[];
}
export interface NoteValue {
  base: string;
  dots?: PositiveInteger;
}

export interface MNXSlur {
  'end-note'?: Id;
  'line-type'?: string;
  location?: SlurTieEndLocation;
  side?: SlurSide;
  'side-end'?: SlurSide;
  'start-note'?: Id;
  target?: Id;
}

export interface MNXNote {
  accidentalDisplay?: {
    cautionary?: boolean;
    editorial?: boolean;
    show: boolean;
  };
  class?: StyleClass;
  id?: Id;
  perform?: Record<string, unknown>;
  pitch: {
    alter?: number;
    octave: number;
    step: string;
  };
  'smufl-font'?: SmuflFont;
  staff?: StaffNumber;
  tied?: {
    location?: SlurTieEndLocation;
    target?: Id;
  };
}

export interface MNXEventContent {
  duration?: NoteValue;
  id?: Id;
  measure?: boolean;
  notes?: MNXNote[];
  orient?: Orientation;
  rest?: {
    position?: StaffPosition;
  };
  slurs?: MNXSlur[];
  'smufl-font'?: SmuflFont;
  staff?: StaffNumber;
  'stem-direction'?: StemDirection;
  type: 'event';
}
export interface NoteValueQuantity {
  duration: NoteValue;
  multiple: PositiveInteger;
}
