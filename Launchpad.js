function Launchpad () {
  const methods = [
    // Lifecycle
    'init', 'start', 'reset', 'update', 'flush', 'exit',

    // Methods
    'onSysex', 'sendSysex',
    'onMidi', 'sendMidi', 'sendNote', 'sendCC',
    'noteObserver',
    'getColorForPurpose', 'getNoteForPosition',
    'updateKeyIndicator', 'updateKeyIndicators',
    'updateKeyTranslationTable',
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
    this.noteInput = this.midiIn.createNoteInput(this.deviceInfo.name)
    this.noteInput.setShouldConsumeEvents(false)

    this.midiIn.setSysexCallback(this.onSysex)
    this.midiIn.setMidiCallback(this.onMidi)

    this.cursorTrack = host.createCursorTrack(0, 0)
    this.cursorTrack.addNoteObserver(this.noteObserver)

    this.deviceInfo.setup(this)

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
        clamp128(this.deviceInfo.positionToNote(currentUpdate.position)),
        currentUpdate.value
      )
    }
  },

  exit () {
    this.deviceInfo.winddown(this.midiOut)
  },

  // Properties

  actions: {
    [Button.ONE  ]: {
      press () { this.sustain = !this.sustain },
      release () { this.sustain = !this.sustain },
    },
    [Button.TWO  ]: {
      press () { this.sustain = !this.sustain },
      release () {},
    },
    [Button.THREE]: {
      press () { this.root -= this.xStep; this.update() },
      release () {},
    },
    [Button.FOUR ]: {
      press () { this.root += this.xStep; this.update() },
      release () {},
    },
    [Button.FIVE ]: { press () {}, release () {} },
    [Button.SIX  ]: {
      press () { this.offset += this.xStep; this.update() },
      release () {},
    },
    [Button.SEVEN]: {
      press () { this.offset -= this.xStep; this.update() },
      release () {},
    },
    [Button.EIGHT]: { press () {}, release () {} },
    [Button.A    ]: { press () {}, release () {} },
    [Button.B    ]: {
      press () { this.offset -= this.yStep; this.update() },
      release () {},
    }
    ,
    [Button.C    ]: {
      press () { this.offset += this.yStep; this.update() },
      release () {},
    },
    [Button.D    ]: { press () {}, release () {} },
    [Button.E    ]: {
      press () { this.root += this.yStep; this.update() },
      release () {},
    },
    [Button.F    ]: {
      press () { this.root -= this.yStep; this.update() },
      release () {},
    },
    [Button.G    ]: { press () {}, release () {} },
    [Button.H    ]: { press () {}, release () {} },
  },

  // Getters, setters

  set root (r) { this._root = ((r % 12) + 12) % 12; this.updateKeyIndicators() },
  get root () { return this._root },

  set sustain (v) {
    this._sustain = v
    // this.userControls.getControl(1).set(this.sustain ? 127 : 0, 128)

    this.noteInput.sendRawMidiEvent(
      MIDIMessageType.CONTROL_CHANGE,
      64,
      v ? 127 : 0
    )

    this.updateLED(
      { x: 8, y: 8 },
      v
        ? this.deviceInfo.colors[defaultColor[ColorPurpose.SUSTAIN]]
        : this.deviceInfo.colors[CommonColor.OFF]
    )
  },

  get sustain () {
    return this._sustain
  },

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
        this.actions[button][data2 > 0 ? 'press' : 'release'].apply(this)
      } else {
        // this.updateColorForPosition(
        //   this.deviceInfo.noteToPosition(data1),
        //   data2 > 0
        // )
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

  noteObserver (isNoteOn, key, velocity) {
    this.keyToPositions[key].forEach(p => {
      this.updateColorForPosition(p, isNoteOn)
    }, this)

    const noteIndicator = numberedNotes[key % 12]
    if (isNoteOn) {
      this.updateLED(
        { y: (7 - (2 + noteIndicator.base) % 7), x: 8 },
        noteIndicator.sharp
          ? this.deviceInfo.colors[defaultColor[ColorPurpose.NOTE_INDICATOR_SHARP]]
          : this.deviceInfo.colors[defaultColor[ColorPurpose.NOTE_INDICATOR]]
      )
    } else {
      this.updateKeyIndicator(noteIndicator.base)
    }
  },

  getColorForPurpose (colorPurpose) {
    return this.deviceInfo.colors[defaultColors[colorPurpose]]
    // colorPurpose in this.deviceInfo.colors
    //   ? this.deviceInfo.colors[colorPurpose]
    //   : defaultColors[colorPurpose]
  },

  getNoteForPosition (position) {
    return clamp128(
      this.offset + position.y * this.yStep + position.x * this.xStep
    )
  },

  updateKeyIndicator (i) {
    const numberedNote = numberedNotes[this.root]

    this.updateLED(
      { y: (7 - (2 + i) % 7), x: 8 },
      numberedNote.base === i
        ? (
            numberedNote.sharp
              ? this.deviceInfo.colors[defaultColor[ColorPurpose.KEY_INDICATOR_SHARP]]
              : this.deviceInfo.colors[defaultColor[ColorPurpose.KEY_INDICATOR]]
          )
        : CommonColor.OFF
    )
  },

  updateKeyIndicators () {
    range(7).forEach(i => { this.updateKeyIndicator(i) }, this)
  },

  updateKeyTranslationTable () {
    this.keyTranslationTable = range(128).map(() => -1)
    this.keyToPositions = range(128).map(() => [])

    range(8).forEach(y => {range(8).forEach(x => {
      this.keyTranslationTable[
        this.deviceInfo.positionToNote({ y, x })
      ] = this.getNoteForPosition({ y, x })

      this.keyToPositions[this.getNoteForPosition({ y, x })].push({ y, x })
    }, this) }, this)

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
      ](pressed)]]
    )
  },

  updateColors () {
    range(8).forEach(y => {range(8).forEach(x => {
      this.updateColorForPosition({ y, x }, false)
    }, this) }, this)
  },
}
