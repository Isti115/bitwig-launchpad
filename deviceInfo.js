const miniHues = [
  [ 'OFF'     , 'LOW_GREEN' , 'MID_GREEN'  , 'HIGH_GREEN'  ],
  [ 'LOW_RED' , 'LOW_AMBER' , 'LOW_YELLOW' , 'MID_YELLOW'  ],
  [ 'MID_RED' , 'LOW_ORANGE', 'MID_AMBER'  , 'HIGH_YELLOW' ],
  [ 'HIGH_RED', 'MID_ORANGE', 'HIGH_ORANGE', 'HIGH_AMBER'  ],
]

const makeMiniColor = (
  (red, green, flash = false) => red + 16 * green + (flash ? 8 : 12)
)

const miniColors = {}
range(4).forEach(r => {range(4).forEach(g => {
    miniColors[miniHues[r][g]] = makeMiniColor(r, g)
})})

const deviceInfo = {
  mini: {
    name: 'Launchpad Mini',
    sysExId: 'f07e0006020020293600000000000302f7',
    setup: lp => { lp.sendMidi(176, 0, 0) },
    colors: miniColors,
    noteToPosition: note => ({ x: note & 0xF, y: 7 - (note >> 4) }),
    positionToNote: position => (7 - position.y) * 16 + position.x,
    midiEventToButton: (status, data1) => (
      (isChannelController(status) && 104 <= data1 && data1 <= 111)
        ? topButtons[data1 - 104]
        : isNoteOn(status) && ((data1 & 0xF) === 8)
        ? sideButtons[data1 >> 4]
        : null
    ),
    winddown: lp => { lp.sendMidi(176, 0, 0) },
  },
  x: {
    name: 'Launchpad X',
    sysExId: 'f07e0006020020290301000000020308f7',
    setup: lp => { lp.sendSysex('F0002029020C0E01F7') },
    colors: {
      [CommonColor.OFF]: 0,

      [CommonColor.LOW_RED]: 7,
      [CommonColor.MID_RED]: 6,
      [CommonColor.HIGH_RED]: 5,

      [CommonColor.LOW_AMBER]: 11,
      [CommonColor.MID_AMBER]: 10,
      [CommonColor.HIGH_AMBER]: 9,

      [CommonColor.LOW_YELLOW]: 15,
      [CommonColor.MID_YELLOW]: 14,
      [CommonColor.HIGH_YELLOW]: 13,

      // [CommonColor.LOW_GREEN]: 23,
      // [CommonColor.MID_GREEN]: 22,
      // [CommonColor.HIGH_GREEN]: 21,
      //
      [CommonColor.LOW_GREEN]: 19,
      [CommonColor.MID_GREEN]: 18,
      [CommonColor.HIGH_GREEN]: 17,
    },
    noteToPosition: note => ({ x: note % 10 - 1, y: Math.floor(note / 10) - 1 }),
    positionToNote: position => (position.y + 1) * 10 + position.x + 1,
    midiEventToButton: (status, data1) => (
      (isChannelController(status) && 91 <= data1 && data1 <= 98)
        ? topButtons[data1 - 91]
        : isChannelController(status) && (data1 % 10 === 9)
        ? sideButtons[8 - ((data1 - 9) / 10)]
        : null
    ),
    winddown: lp => { lp.sendSysex('F0002029020C0E00F7') },
  }
}

const deviceInfoForSysExResponse = {
  'f07e0006020020293600000000000302f7': deviceInfo.mini,
  'f07e0006020020290301000000020308f7': deviceInfo.x,
}
