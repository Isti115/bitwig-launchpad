const NoteRole = {
  IN_KEY: 'IN_KEY',
  MINOR: 'MINOR',
  OFF_KEY: 'OFF_KEY',
  ROOT: 'ROOT',
}

const scaleRoles = {
   0: NoteRole.ROOT,
   1: NoteRole.OFF_KEY,
   2: NoteRole.IN_KEY,
   3: NoteRole.OFF_KEY,
   4: NoteRole.IN_KEY,
   5: NoteRole.IN_KEY,
   6: NoteRole.OFF_KEY,
   7: NoteRole.IN_KEY,
   8: NoteRole.OFF_KEY,
   9: NoteRole.MINOR,
  10: NoteRole.OFF_KEY,
  11: NoteRole.IN_KEY,
}

const ColorPurpose = {
  IN_KEY_DIM : 'IN_KEY_DIM' , IN_KEY_BRIGHT : 'IN_KEY_BRIGHT' ,
  MINOR_DIM  : 'MINOR_DIM'  , MINOR_BRIGHT  : 'MINOR_BRIGHT'  ,
  OFF_KEY_DIM: 'OFF_KEY_DIM', OFF_KEY_BRIGHT: 'OFF_KEY_BRIGHT',
  ROOT_DIM   : 'ROOT_DIM'   , ROOT_BRIGHT   : 'ROOT_BRIGHT'   ,

  KEY_INDICATOR: 'KEY_INDICATOR', KEY_INDICATOR_SHARP: 'KEY_INDICATOR_SHARP',

  SUSTAIN: 'SUSTAIN',
}

const CommonColor = {
  OFF: 'OFF',

  LOW_RED   : 'LOW_RED'   , MID_RED   : 'MID_RED'   , HIGH_RED   : 'HIGH_RED'   ,
  LOW_ORANGE: 'LOW_ORANGE', MID_ORANGE: 'MID_ORANGE', HIGH_ORANGE: 'HIGH_ORANGE',
  LOW_AMBER : 'LOW_AMBER' , MID_AMBER : 'MID_AMBER' , HIGH_AMBER : 'HIGH_AMBER' ,
  LOW_YELLOW: 'LOW_YELLOW', MID_YELLOW: 'MID_YELLOW', HIGH_YELLOW: 'HIGH_YELLOW',
  LOW_GREEN : 'LOW_GREEN' , MID_GREEN : 'MID_GREEN' , HIGH_GREEN : 'HIGH_GREEN' ,
}

const defaultColor = {
  [ColorPurpose.IN_KEY_DIM]: CommonColor.LOW_AMBER,
  [ColorPurpose.IN_KEY_BRIGHT]: CommonColor.HIGH_AMBER,

  [ColorPurpose.MINOR_DIM]: CommonColor.LOW_RED,
  [ColorPurpose.MINOR_BRIGHT]: CommonColor.HIGH_RED,

  [ColorPurpose.OFF_KEY_DIM]: CommonColor.OFF,
  [ColorPurpose.OFF_KEY_BRIGHT]: CommonColor.MID_YELLOW,

  [ColorPurpose.ROOT_DIM]: CommonColor.LOW_GREEN,
  [ColorPurpose.ROOT_BRIGHT]: CommonColor.HIGH_GREEN,

  [ColorPurpose.KEY_INDICATOR]: CommonColor.LOW_GREEN,
  [ColorPurpose.KEY_INDICATOR_SHARP]: CommonColor.LOW_RED,

  [ColorPurpose.SUSTAIN]: CommonColor.MID_RED,
}

const colorPurposeForRole = {
  [NoteRole.IN_KEY] :
    bright => bright ? ColorPurpose.IN_KEY_BRIGHT : ColorPurpose.IN_KEY_DIM,
  [NoteRole.MINOR] :
    bright => bright ? ColorPurpose.MINOR_BRIGHT : ColorPurpose.MINOR_DIM,
  [NoteRole.OFF_KEY] :
    bright => bright ? ColorPurpose.OFF_KEY_BRIGHT : ColorPurpose.OFF_KEY_DIM,
  [NoteRole.ROOT] :
    bright => bright ? ColorPurpose.ROOT_BRIGHT : ColorPurpose.ROOT_DIM,
}

const MIDIMessageType = {
  NOTE_OFF         : 0x80, // 128
  NOTE_ON          : 0x90, // 144
  KEY_PRESSURE     : 0xA0, // 160
  CONTROL_CHANGE   : 0xB0, // 176
  PROGRAM_CHANGE   : 0xC0, // 192
  CHANNEL_PRESSURE : 0xD0, // 208
  PITCH_BEND       : 0xE0, // 224
}

const Button = {
  ONE: 'ONE',
  TWO: 'TWO',
  THREE: 'THREE',
  FOUR: 'FOUR',
  FIVE: 'FIVE',
  SIX: 'SIX',
  SEVEN: 'SEVEN',
  EIGHT: 'EIGHT',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  H: 'H',
}

const topButtons = [
  Button.ONE,
  Button.TWO,
  Button.THREE,
  Button.FOUR,
  Button.FIVE,
  Button.SIX,
  Button.SEVEN,
  Button.EIGHT,
]

const sideButtons = [
  Button.A,
  Button.B,
  Button.C,
  Button.D,
  Button.E,
  Button.F,
  Button.G,
  Button.H,
]

const numberedNotes = [
  { base: 1, sharp: false },
  { base: 1, sharp: true },
  { base: 2, sharp: false },
  { base: 2, sharp: true },
  { base: 3, sharp: false },
  { base: 4, sharp: false },
  { base: 4, sharp: true },
  { base: 5, sharp: false },
  { base: 5, sharp: true },
  { base: 6, sharp: false },
  { base: 6, sharp: true },
  { base: 7, sharp: false },
]

const SysExMessages = {
  // Scroll "Hello world!":
  startHelloWorld: 'F0002029097C0548656C6C6F2002776f726c6421F7',
  // Stop scrolling:
  stopText: 'F00020290900F7',
}
