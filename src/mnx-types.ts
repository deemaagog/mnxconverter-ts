/* eslint-disable */
/**
 * Automatically generated from schema/mnx-schema.json.
 * DO NOT MODIFY BY HAND. Run `npm run generate:types`.
 */

/**
 * An encoding of Common Western Music Notation.
 */
export type MNXDocument = GlobalAttrs & {
  global: Global;
  layouts?: SystemLayout[];
  mnx: Mnx;
  parts: Part[];
  scores?: Score[];
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "string".
 */
export type String = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "id".
 */
export type Id = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "global".
 */
export type Global = GlobalAttrs & {
  lyrics?: LyricsGlobal;
  measures: MeasureGlobal[];
  sounds?: SoundsGlobal;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "lyrics-global".
 */
export type LyricsGlobal = GlobalAttrs & {
  lineMetadata?: LyricLinesMetadata;
  lineOrder?: LyricLineId[];
};
/**
 * This interface was referenced by `LyricLinesMetadata`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "lyric-line-metadata".
 */
export type LyricLineMetadata = GlobalAttrs & {
  label?: LyricLineLabel;
  lang?: LanguageCode;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "lyric-line-label".
 */
export type LyricLineLabel = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "language-code".
 */
export type LanguageCode = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "lyric-line-id".
 */
export type LyricLineId = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-global".
 */
export type MeasureGlobal = GlobalAttrs & {
  barline?: Barline;
  ending?: Ending;
  fermata?: Fermata;
  fine?: Fine;
  jump?: Jump;
  key?: Key;
  number?: MeasureNumber;
  repeatEnd?: RepeatEnd;
  repeatStart?: RepeatStart;
  segno?: Segno;
  tempos?: Tempo[];
  time?: Time;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "barline".
 */
export type Barline = GlobalAttrs & {
  type: BarlineType;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "barline-type".
 */
export type BarlineType =
  | 'regular'
  | 'dotted'
  | 'dashed'
  | 'heavy'
  | 'double'
  | 'final'
  | 'heavyLight'
  | 'heavyHeavy'
  | 'tick'
  | 'short'
  | 'noBarline';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ending".
 */
export type Ending = GlobalAttrs & {
  color?: Color;
  duration: EndingDuration;
  numbers?: EndingNumber[];
  open?: EndingOpen;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "color".
 */
export type Color = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ending-duration".
 */
export type EndingDuration = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ending-number".
 */
export type EndingNumber = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ending-open".
 */
export type EndingOpen = boolean;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "fermata".
 */
export type Fermata = GlobalAttrs & {
  duration?: FermataDuration;
  orient?: Orientation;
  pointing?: UpDownAuto;
  symbol?: FermataSymbol;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "fermata-duration".
 */
export type FermataDuration = 'auto' | 'none' | 'veryLong' | 'long' | 'normal' | 'short' | 'veryShort';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "orientation".
 */
export type Orientation = 'above' | 'below' | 'auto';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "up-down-auto".
 */
export type UpDownAuto = 'up' | 'down' | 'auto';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "fermata-symbol".
 */
export type FermataSymbol =
  'normal' | 'angled' | 'square' | 'doubleAngled' | 'doubleSquare' | 'doubleDot' | 'halfCurve' | 'curlew';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "fine".
 */
export type Fine = GlobalAttrs & {
  color?: Color;
  location: RhythmicPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "rhythmic-position".
 */
export type RhythmicPosition = GlobalAttrs & {
  fraction: Fraction;
  graceIndex?: IntegerUnsigned;
};
/**
 * @minItems 2
 * @maxItems 2
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "fraction".
 */
export type Fraction = [IntegerUnsigned, IntegerUnsigned];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "integer-unsigned".
 */
export type IntegerUnsigned = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "jump".
 */
export type Jump = GlobalAttrs & {
  location: RhythmicPosition;
  type: JumpType;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "jump-type".
 */
export type JumpType = 'dsalfine' | 'segno';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "key".
 */
export type Key = GlobalAttrs & {
  color?: Color;
  fifths: Fifths;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "fifths".
 */
export type Fifths = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-number".
 */
export type MeasureNumber = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "repeat-end".
 */
export type RepeatEnd = GlobalAttrs & {
  times?: RepeatTimes;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "repeat-times".
 */
export type RepeatTimes = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "repeat-start".
 */
export type RepeatStart = GlobalAttrs & {};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "segno".
 */
export type Segno = GlobalAttrs & {
  color?: Color;
  glyph?: SmuflGlyph;
  location: RhythmicPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "smufl-glyph".
 */
export type SmuflGlyph = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tempo".
 */
export type Tempo = GlobalAttrs & {
  bpm: Bpm;
  location?: RhythmicPosition;
  value: NoteValue;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "bpm".
 */
export type Bpm = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "note-value".
 */
export type NoteValue = GlobalAttrs & {
  base: NoteValueBase;
  dots?: PositiveInteger;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "note-value-base".
 */
export type NoteValueBase =
  | 'duplexMaxima'
  | 'maxima'
  | 'longa'
  | 'breve'
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | '16th'
  | '32nd'
  | '64th'
  | '128th'
  | '256th'
  | '512th'
  | '1024th'
  | '2048th'
  | '4096th';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "positive-integer".
 */
export type PositiveInteger = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "time".
 */
export type Time = GlobalAttrs & {
  count: PositiveInteger;
  display?: TimeSignatureDisplay;
  unit: TimeSignatureUnit;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "time-signature-display".
 */
export type TimeSignatureDisplay = 'common' | 'cut';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "time-signature-unit".
 */
export type TimeSignatureUnit = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128;
/**
 * This interface was referenced by `SoundsGlobal`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "sound".
 */
export type Sound = GlobalAttrs & {
  midiNumber?: MidiNumber;
  name?: String;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "midi-number".
 */
export type MidiNumber = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "system-layout".
 */
export type SystemLayout = GlobalAttrs & {
  content: SystemLayoutContent;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-group".
 */
export type StaffGroup = GlobalAttrs & {
  barlineStyle?: StaffGroupBarlineStyle;
  content: SystemLayoutContent;
  label?: StaffLabel;
  symbol?: StaffSymbol;
  type: 'group';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-group-barline-style".
 */
export type StaffGroupBarlineStyle = 'individual' | 'instrument' | 'unified' | 'mensurstrich';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-label".
 */
export type StaffLabel = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-symbol".
 */
export type StaffSymbol = 'bracket' | 'brace' | 'noSymbol';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff".
 */
export type Staff = GlobalAttrs & {
  label?: StaffLabel;
  labelref?: StaffLabelref;
  sources: StaffSource[];
  symbol?: StaffSymbol;
  type: 'staff';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-labelref".
 */
export type StaffLabelref = 'name' | 'shortName';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-source".
 */
export type StaffSource = GlobalAttrs & {
  label?: StaffLabel;
  labelref?: StaffLabelref;
  part: Id;
  staff?: StaffNumber;
  stem?: StemDirection;
  voice?: VoiceName;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-number".
 */
export type StaffNumber = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "stem-direction".
 */
export type StemDirection = 'up' | 'down';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "voice-name".
 */
export type VoiceName = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "system-layout-content".
 */
export type SystemLayoutContent = (StaffGroup | Staff)[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "mnx".
 */
export type Mnx = GlobalAttrs & {
  support?: Support;
  version: VersionNumber;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "support".
 */
export type Support = GlobalAttrs & {
  useAccidentalDisplay?: boolean;
  useBeams?: boolean;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "version-number".
 */
export type VersionNumber = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "part".
 */
export type Part = GlobalAttrs & {
  kit?: Kit;
  measures: PartMeasure[];
  name?: PartName;
  shortName?: PartShortName;
  smuflFont?: SmuflFont;
  staves?: StaffCount;
  transposition?: PartTransposition;
};
/**
 * This interface was referenced by `Kit`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "kit-component".
 */
export type KitComponent = GlobalAttrs & {
  name?: String;
  sound?: Id;
  staffPosition: StaffPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-position".
 */
export type StaffPosition = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "part-measure".
 */
export type PartMeasure = GlobalAttrs & {
  arpeggios?: Arpeggio[];
  beams?: BeamList;
  clefs?: PositionedClef[];
  dynamics?: DynamicGroup[];
  measureRepeat?: MeasureRepeat;
  nonArpeggios?: NonArpeggio[];
  ottavas?: Ottava[];
  sequences: Sequence[];
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "arpeggio".
 */
export type Arpeggio = GlobalAttrs & {
  arrow?: boolean;
  direction?: UpDownAuto;
  position: RhythmicPosition;
  span: IdPair;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "beam".
 */
export type Beam = GlobalAttrs & {
  beams?: BeamList;
  direction?: BeamHookDirection;
  events: Id[];
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "beam-hook-direction".
 */
export type BeamHookDirection = 'left' | 'right' | 'auto';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "beam-list".
 */
export type BeamList = Beam[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "positioned-clef".
 */
export type PositionedClef = GlobalAttrs & {
  clef: Clef;
  position?: RhythmicPosition;
  staff?: StaffNumber;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "clef".
 */
export type Clef = GlobalAttrs & {
  color?: SimpleColor;
  glyph?: SmuflGlyph;
  octave?: OttavaAmountOrZero;
  showOctave?: boolean;
  sign: ClefSign;
  staffPosition: StaffPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "simple-color".
 */
export type SimpleColor = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ottava-amount-or-zero".
 */
export type OttavaAmountOrZero = 1 | 2 | -1 | -2 | 3 | -3 | 0;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "clef-sign".
 */
export type ClefSign = 'C' | 'F' | 'G';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "dynamic-group".
 */
export type DynamicGroup = GlobalAttrs & {
  accentPrefix?: DynamicPrefix;
  accentSuffix?: DynamicSuffix;
  end?: MeasureRhythmicPosition;
  glyphs?: SmuflGlyph[];
  orient?: MultiStaffOrientation;
  position: RhythmicPosition;
  prefix?: String;
  relativeValue?: RelativeDynamicValue;
  residualValue?: DynamicValue;
  staff?: StaffNumber;
  staffEnd?: StaffNumber;
  suffix?: String;
  type: DynamicGroupType;
  value?: DynamicValue;
  visuallyContinues?: Id;
  voice?: VoiceName;
  wedgeType?: WedgeType;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "dynamic-prefix".
 */
export type DynamicPrefix = 's' | 'r' | '';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "dynamic-suffix".
 */
export type DynamicSuffix = 'z' | '';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-rhythmic-position".
 */
export type MeasureRhythmicPosition = GlobalAttrs & {
  measure: Id;
  position: RhythmicPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "multi-staff-orientation".
 */
export type MultiStaffOrientation = 'above' | 'auto' | 'below' | 'between';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "relative-dynamic-value".
 */
export type RelativeDynamicValue = 'louder' | 'softer';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "dynamic-value".
 */
export type DynamicValue =
  | 'ppp'
  | 'pp'
  | 'p'
  | 'mp'
  | 'mf'
  | 'f'
  | 'ff'
  | 'fff'
  | 'n'
  | 'pppp'
  | 'ppppp'
  | 'ffff'
  | 'fffff'
  | 'pppppp'
  | 'ffffff';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "dynamic-group-type".
 */
export type DynamicGroupType = 'immediate' | 'gradual' | 'relative' | 'accent';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "wedge-type".
 */
export type WedgeType = 'increasing' | 'decreasing';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-repeat".
 */
export type MeasureRepeat = GlobalAttrs & {
  counter?: MeasureRepeatCounter;
  displayNumber?: boolean;
  number: MeasureRepeatCount;
  staffPosition?: StaffPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-repeat-counter".
 */
export type MeasureRepeatCounter = GlobalAttrs & {
  count: PositiveInteger;
  orient?: MultiStaffOrientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-repeat-count".
 */
export type MeasureRepeatCount = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "non-arpeggio".
 */
export type NonArpeggio = GlobalAttrs & {
  position: RhythmicPosition;
  span: IdPair;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ottava".
 */
export type Ottava = GlobalAttrs & {
  end: MeasureRhythmicPosition;
  orient?: Orientation;
  position: RhythmicPosition;
  staff?: StaffNumber;
  value: OttavaAmount;
  voice?: VoiceName;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "ottava-amount".
 */
export type OttavaAmount = 1 | 2 | -1 | -2 | 3 | -3;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "sequence".
 */
export type Sequence = GlobalAttrs & {
  content: SequenceContent;
  fullMeasure?: FullMeasureRest;
  orient?: Orientation;
  staff?: StaffNumber;
  voice?: VoiceName;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "event".
 */
export type Event = GlobalAttrs & {
  duration: NoteValue;
  fermata?: Fermata;
  kitNotes?: KitNote[];
  lyrics?: Lyrics;
  markings?: EventMarkings;
  notes?: Note[];
  orient?: Orientation;
  rest?: Rest;
  slurs?: Slur[];
  staff?: StaffNumber;
  stemDirection?: StemDirection;
  type?: 'event';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "kit-note".
 */
export type KitNote = GlobalAttrs & {
  kitComponent: Id;
  perform?: PerformOptions;
  staff?: StaffNumber;
  ties?: TieList;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "perform-options".
 */
export type PerformOptions = GlobalAttrs & {};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tie".
 */
export type Tie = GlobalAttrs & {
  lv?: boolean;
  side?: SlurSide;
  target?: Id;
  targetType?: TieTargetType;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "slur-side".
 */
export type SlurSide = 'up' | 'down';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tie-target-type".
 */
export type TieTargetType = 'nextNote' | 'crossVoice' | 'arpeggio' | 'crossJump';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tie-list".
 */
export type TieList = Tie[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "lyrics".
 */
export type Lyrics = GlobalAttrs & {
  lines?: EventLyricLines;
};
/**
 * This interface was referenced by `EventLyricLines`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "event-lyric-line".
 */
export type EventLyricLine = GlobalAttrs & {
  text: String;
  type?: EventLyricLineType;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "event-lyric-line-type".
 */
export type EventLyricLineType = 'start' | 'middle' | 'end' | 'whole';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "event-markings".
 */
export type EventMarkings = GlobalAttrs & {
  accent?: Accent;
  bowDirection?: BowDirection;
  breath?: BreathMark;
  softAccent?: SoftAccent;
  spiccato?: Spiccato;
  staccatissimo?: Staccatissimo;
  staccato?: Staccato;
  stress?: StressMarking;
  strongAccent?: StrongAccent;
  tenuto?: Tenuto;
  tremolo?: TremoloSingle;
  unstress?: UnstressMarking;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "accent".
 */
export type Accent = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "bow-direction".
 */
export type BowDirection = GlobalAttrs & {
  direction: UpDown;
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "up-down".
 */
export type UpDown = 'up' | 'down';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "breath-mark".
 */
export type BreathMark = GlobalAttrs & {
  orient?: Orientation;
  symbol?: BreathMarkSymbol;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "breath-mark-symbol".
 */
export type BreathMarkSymbol = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "soft-accent".
 */
export type SoftAccent = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "spiccato".
 */
export type Spiccato = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staccatissimo".
 */
export type Staccatissimo = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staccato".
 */
export type Staccato = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "stress-marking".
 */
export type StressMarking = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "strong-accent".
 */
export type StrongAccent = GlobalAttrs & {
  orient?: Orientation;
  pointing?: UpDownAuto;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tenuto".
 */
export type Tenuto = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tremolo-single".
 */
export type TremoloSingle = GlobalAttrs & {
  marks: PositiveInteger;
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "unstress-marking".
 */
export type UnstressMarking = GlobalAttrs & {
  orient?: Orientation;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "note".
 */
export type Note = GlobalAttrs & {
  accidentalDisplay?: AccidentalDisplay;
  perform?: PerformOptions;
  pitch: Pitch;
  staff?: StaffNumber;
  ties?: TieList;
  written?: Written;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "accidental-display".
 */
export type AccidentalDisplay = GlobalAttrs & {
  enclosure?: AccidentalEnclosure;
  force?: boolean;
  show: boolean;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "accidental-enclosure".
 */
export type AccidentalEnclosure = GlobalAttrs & {
  symbol: AccidentalEnclosureSymbol;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "accidental-enclosure-symbol".
 */
export type AccidentalEnclosureSymbol = 'parentheses' | 'brackets';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "pitch".
 */
export type Pitch = GlobalAttrs & {
  alter?: Alter;
  octave: Octave;
  step: Step;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "alter".
 */
export type Alter = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "octave".
 */
export type Octave = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "step".
 */
export type Step = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "written".
 */
export type Written = GlobalAttrs & {
  diatonicDelta?: IntegerSigned;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "integer-signed".
 */
export type IntegerSigned = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "rest".
 */
export type Rest = GlobalAttrs & {
  staffPosition?: StaffPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "slur".
 */
export type Slur = GlobalAttrs & {
  endNote?: Id;
  lineType?: LineType;
  side?: SlurSide;
  sideEnd?: SlurSide;
  startNote?: Id;
  target: Id;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "line-type".
 */
export type LineType = 'dashed' | 'dotted' | 'solid' | 'wavy';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "grace".
 */
export type Grace = GlobalAttrs & {
  color?: Color;
  content: Event[];
  graceType?: GraceType;
  slash?: boolean;
  type: 'grace';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "grace-type".
 */
export type GraceType = 'makeTime' | 'stealFollowing' | 'stealPrevious';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tuplet".
 */
export type Tuplet = GlobalAttrs & {
  bracket?: YesNoAuto;
  content: SequenceContent;
  inner: NoteValueQuantity;
  orient?: Orientation;
  outer: NoteValueQuantity;
  showNumber?: TupletDisplaySetting;
  showValue?: TupletDisplaySetting;
  staff?: StaffNumber;
  type: 'tuplet';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "yes-no-auto".
 */
export type YesNoAuto = 'yes' | 'no' | 'auto';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "note-value-quantity".
 */
export type NoteValueQuantity = GlobalAttrs & {
  duration: NoteValue;
  multiple: PositiveInteger;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "tuplet-display-setting".
 */
export type TupletDisplaySetting = 'noNumber' | 'inner' | 'both';
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "space".
 */
export type Space = GlobalAttrs & {
  duration: Fraction;
  type: 'space';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "multi-note-tremolo".
 */
export type MultiNoteTremolo = GlobalAttrs & {
  content: Event[];
  individualDuration?: NoteValue;
  marks: PositiveInteger;
  outer: NoteValueQuantity;
  type: 'tremolo';
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "sequence-content".
 */
export type SequenceContent = (Event | Grace | Tuplet | Space | MultiNoteTremolo)[];
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "full-measure-rest".
 */
export type FullMeasureRest = GlobalAttrs & {
  fermata?: Fermata;
  staffPosition?: StaffPosition;
  visualDuration?: NoteValue;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "part-name".
 */
export type PartName = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "part-short-name".
 */
export type PartShortName = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "smufl-font".
 */
export type SmuflFont = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "staff-count".
 */
export type StaffCount = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "part-transposition".
 */
export type PartTransposition = GlobalAttrs & {
  interval: Interval;
  keyFifthsFlipAt?: IntegerSigned;
  prefersWrittenPitches?: boolean;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "interval".
 */
export type Interval = GlobalAttrs & {
  halfSteps: IntegerSigned;
  staffDistance: IntegerSigned;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "score".
 */
export type Score = GlobalAttrs & {
  layout?: Id;
  multimeasureRests?: MultimeasureRest[];
  name: ScoreName;
  pages?: Page[];
  useWritten?: boolean;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "multimeasure-rest".
 */
export type MultimeasureRest = GlobalAttrs & {
  duration: MeasureCount;
  label?: String;
  start: Id;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "measure-count".
 */
export type MeasureCount = number;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "score-name".
 */
export type ScoreName = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "page".
 */
export type Page = GlobalAttrs & {
  layout?: Id;
  systems: System[];
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "system".
 */
export type System = GlobalAttrs & {
  layout?: Id;
  layoutChanges?: LayoutChange[];
  measure: Id;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "layout-change".
 */
export type LayoutChange = GlobalAttrs & {
  layout: Id;
  location: MeasureRhythmicPosition;
};
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "root".
 */
export type Root = GlobalAttrs;

/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "global-attrs".
 */
export interface GlobalAttrs {
  _c?: String;
  _x?: VendorExtensions;
  id?: Id;
  [k: string]: any;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vendor-extensions".
 */
export interface VendorExtensions {
  [k: string]: VendorDict;
}
/**
 * This interface was referenced by `VendorExtensions`'s JSON-Schema definition
 * via the `patternProperty` "^.*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "vendor-dict".
 */
export interface VendorDict {
  [k: string]: any;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "lyric-lines-metadata".
 */
export interface LyricLinesMetadata {
  [k: string]: LyricLineMetadata;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "sounds-global".
 */
export interface SoundsGlobal {
  [k: string]: Sound;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "kit".
 */
export interface Kit {
  [k: string]: KitComponent;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "id-pair".
 */
export interface IdPair {
  end: Id;
  start: Id;
  [k: string]: any;
}
/**
 * This interface was referenced by `undefined`'s JSON-Schema
 * via the `definition` "event-lyric-lines".
 */
export interface EventLyricLines {
  [k: string]: EventLyricLine;
}
