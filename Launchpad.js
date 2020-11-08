function Launchpad () {
  const methods = [
    // Lifecycle
    'init', 'start', 'reset', 'update', 'flush', 'exit',

    // Methods
    'onSysex', 'sendSysex',
    'onMidi', 'sendMidi', 'sendNote', 'sendCC',
    'getColorForPurpose', 'getNoteForPosition',
    'updateKeyIndicator',
    'getKeyTranslationTable', 'updateKeyTranslationTable',
    'updateLED', 'updateColorForPosition', 'updateColors',
  ]

  methods.forEach(m => { this[m] = this[m].bind(this) }, this)
}

Launchpad.prototype = {
  // Lifecycle

  init (midiIn, midiOut, deviceInfo) {
    this.midiIn = midiIn
    this.midiOut = midiOut
    this.deviceInfo = deviceInfo

    println(`${this.deviceInfo.name} initialized!`)

    this.start()
  },

  start () {
    this.deviceInfo.setup(this)

    this.noteInput = this.midiIn.createNoteInput(this.deviceInfo.name)
    this.noteInput.setShouldConsumeEvents(false)
    this.midiIn.setSysexCallback(this.onSysex)
    this.midiIn.setMidiCallback(this.onMidi)

    this.LEDUpdateQueue = []

    // Device Id request
    // this.sendSysex('F07E7F0601F7')
    println(`${this.deviceInfo.name} started!`)

    this.reset()
  },

  reset () {
    this.root = 0

    this.xStep = 1
    this.yStep = 5

    this.offset = 30

    this.update()
  },

  update () {
    this.updateKeyTranslationTable()
    this.updateColors()
  },

  flush () {
    while (this.LEDUpdateQueue.length > 0) {
      const currentUpdate = this.LEDUpdateQueue.shift()
      this.sendNote(
        this.deviceInfo.positionToNote(currentUpdate.position),
        currentUpdate.value
      )
    }
  },

  exit () {
    this.deviceInfo.winddown(this.midiOut)
  },

  // Properties

  actions: {
    [Button.ONE  ]: { press () {}, release () {}},
    [Button.TWO  ]: { press () {}, release () {}},
    [Button.THREE]: {
      press () { this.root -= this.xStep; this.update() },
      release () {}
    },
    [Button.FOUR ]: {
      press () { this.root += this.xStep; this.update() },
      release () {}
    },
    [Button.FIVE ]: { press () {}, release () {}},
    [Button.SIX  ]: {
      press () { this.offset += this.xStep; this.update() },
      release () {}
    },
    [Button.SEVEN]: {
      press () { this.offset -= this.xStep; this.update() },
      release () {}
    },
    [Button.EIGHT]: { press () {}, release () {}},
    [Button.A    ]: { press () {}, release () {}},
    [Button.B    ]: {
      press () { this.offset -= this.yStep; this.update() },
      release () {}
    }
    ,
    [Button.C    ]: {
      press () { this.offset += this.yStep; this.update() },
      release () {}
    },
    [Button.D    ]: { press () {}, release () {}},
    [Button.E    ]: {
      press () { this.root += this.yStep; this.update() },
      release () {}
    },
    [Button.F    ]: {
      press () { this.root -= this.yStep; this.update() },
      release () {}
    },
    [Button.G    ]: { press () {}, release () {}},
    [Button.H    ]: { press () {}, release () {}},
  },

  // Getters, setters

  set root (r) { this._root = ((r % 12) + 12) % 12; this.updateKeyIndicator() },
  get root () { return this._root },

  // set xStep (v) { this._xStep = v; this.update() },
  // get xStep () { return this._xStep },

  // set yStep (v) { this._yStep = v; this.update() },
  // get yStep () { return this._yStep },

  // set offset (v) { this._offset = v; this.update() },
  // get offset () { return this._offset },

  // Methods

  onSysex (data) {
    println(data)
  },

  sendSysex (data) {
    this.midiOut.sendSysex(data)
  },

  onMidi (status, data1, data2) {
    // https://github.com/git-moss/DrivenByMoss/blob/e75d2dadb14819bf3db10f5e5f9b43ea641893bb/src/main/java/de/mossgrabers/framework/command/aftertouch/AftertouchAbstractViewCommand.java#L55
    if (isKeyPressure(status)) {
      this.noteInput.sendRawMidiEvent(
        status,
        this.getNoteForPosition(this.deviceInfo.noteToPosition(data1)),
        data2
      )
    } else {
      const button = this.deviceInfo.midiEventToButton(status, data1)
      if (button) {
        this.actions[button][data2 ? 'press' : 'release'].apply(this)
      }
    }
  },

  sendMidi (status, data1, data2) {
    this.midiOut.sendMidi(status, data1, data2)
  },

  sendNote (note, velocity) {
    this.sendMidi(MIDIMessageType.NOTE_ON, note, velocity)
  },

  sendCC (note, velocity) {
    this.sendMidi(MIDIMessageType.CONTROL_CHANGE, note, velocity)
  },

  getColorForPurpose (colorPurpose) {
    return this.deviceInfo.colors[defaultColors[colorPurpose]]
    // colorPurpose in this.deviceInfo.colors
    //   ? this.deviceInfo.colors[colorPurpose]
    //   : defaultColors[colorPurpose]
  },

  getNoteForPosition (position) {
    return Math.max(0, Math.min(127,
      this.offset + position.y * this.yStep + position.x * this.xStep
    ))
  },

  updateKeyIndicator () {
    const numberedNote = numberedNotes[this.root]
    range(7).forEach(i => {
      this.updateLED(
        { y: (7 - (2 + i) % 7), x: 8 },
        (numberedNote.base - 1) === i
          ? (
              numberedNote.sharp
                ? this.deviceInfo.colors[defaultColor[ColorPurpose.KEY_INDICATOR_SHARP]]
                : this.deviceInfo.colors[defaultColor[ColorPurpose.KEY_INDICATOR]]
            )
          : CommonColor.OFF
      )
    }, this)
  },

  getKeyTranslationTable () {
    const keyTranslationTable = range(128).map(() => -1)
    range(8).forEach(y => {range(8).forEach(x => {
      keyTranslationTable[
        this.deviceInfo.positionToNote({ y, x })
      ] = this.getNoteForPosition({ y, x })
    }, this) }, this)
    return keyTranslationTable
  },

  updateKeyTranslationTable () {
    this.keyTranslationTable = this.getKeyTranslationTable()
    this.noteInput.setKeyTranslationTable(this.keyTranslationTable)
  },

  updateLED (position, value) {
    this.LEDUpdateQueue.push({ position, value })
  },

  updateColorForPosition (position, pressed) {
    this.updateLED(
      position,
      this.deviceInfo.colors[defaultColor[colorPurposeForRole[
        scaleRoles[(this.getNoteForPosition(position) - this.root + 12) % 12]
      ](false)]]
    )
  },

  updateColors () {
    range(8).forEach(y => {range(8).forEach(x => {
      this.updateColorForPosition({ y, x }, 20)
    }, this) }, this)
  },
}
