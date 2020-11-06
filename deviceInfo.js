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
    colors: miniColors,
    noteToPosition: note => ({ x: note & 0xF, y: 7 - (note >> 4) }),
    positionToNote: position => (7 - position.y) * 16 + position.x,
  },
}
