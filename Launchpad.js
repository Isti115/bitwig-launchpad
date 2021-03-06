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

    this.transport = host.createTransport()

    this.cursorTrack = host.createCursorTrack(
      this.deviceInfo.name.replace(/ /,'_').toUpperCase(),
      this.deviceInfo.name,
      0, 0, true
    )
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

    this.sustain = false
    this.pitchBend = 0

    this.shift = false
    this.rootChooseMode = undefined

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
    [Button.ONE]: {
      press () { this.sustain = !this.sustain },
      release () { this.sustain = !this.sustain },

      pressShifted () { this.noteInput.arpeggiator().isEnabled().toggle() },
    },
    [Button.TWO]: {
      press () { this.sustain = !this.sustain },

      pressShifted () { this.noteInput.noteLatch().isEnabled().toggle() },
    },
    [Button.THREE]: {
      press () { this.pitchBend-- },
      pressShifted () { this.cursorTrack.selectPrevious() },
    },
    [Button.FOUR]: {
      press () { this.pitchBend++ },
      pressShifted () { this.cursorTrack.selectNext() },
    },
    [Button.FIVE]: {
      press () { this.rootChooseMode = 0 }, // Choose 'do'
      pressShifted () { this.rootChooseMode = 9 }, // Choose 'la'
    },
    [Button.SIX]: {
      press () { this.offset += this.xStep; this.update() },
      pressShifted () { this.root -= this.xStep; this.update() },
    },
    [Button.SEVEN]: {
      press () { this.offset -= this.xStep; this.update() },
      pressShifted () { this.root += this.xStep; this.update() },
    },
    [Button.EIGHT]: {
      press () { this.shift = true },
      releaseShifted () { this.shift = false },
    },
    [Button.A]: {
      press () { this.root++; this.offset++; this.update() },
      pressShifted () { this.offset += 12; this.update() },
    },
    [Button.B]: {
      press () { this.offset -= this.yStep; this.update() },
      pressShifted () { this.root += this.yStep; this.update() },
    },
    [Button.C]: {
      press () { this.offset += this.yStep; this.update() },
      pressShifted () { this.root -= this.yStep; this.update() },
    },
    [Button.D]: {
      press () { this.root--; this.offset--; this.update() },
      pressShifted () { this.offset -= 12; this.update() },
    },
    [Button.E]: {
      press () { this.cursorTrack.volume().inc(0.1) },
      pressShifted () { this.cursorTrack.volume().inc(0.02) },
    },
    [Button.F]: {
      press () { this.cursorTrack.volume().inc(-0.1) },
      pressShifted () { this.cursorTrack.volume().inc(-0.02) },
    },
    [Button.G]: { pressShifted () { this.reset() } },
    [Button.H]: {
      press () {
        this.transport.tapTempo()
        this.updateLED(
          { y: 0, x: 8 },
          this.deviceInfo.colors[defaultColor[ColorPurpose.TAP_TEMPO]]
        )
      },
      release () {
        this.updateLED({ y: 0, x: 8 }, this.deviceInfo.colors[CommonColor.OFF])
      },

      pressShifted () { this.exit() },
    },
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

  set pitchBend (v) {
    this._pitchBend = clamp(-10, 10)(v)

    this.noteInput.sendRawMidiEvent(
      MIDIMessageType.PITCH_BEND,
      64,
      Math.round(63.5 + this._pitchBend * 6.35)
    )

    this.updateLED(
      { x: 2, y: 8 },
      this._pitchBend < 0
        ? this.deviceInfo.colors[defaultColor[ColorPurpose.PITCHBEND]]
        : this.deviceInfo.colors[CommonColor.OFF]
    )
    this.updateLED(
      { x: 3, y: 8 },
      this._pitchBend > 0
        ? this.deviceInfo.colors[defaultColor[ColorPurpose.PITCHBEND]]
        : this.deviceInfo.colors[CommonColor.OFF]
    )
  },

  get pitchBend () {
    return this._pitchBend
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
    } else if (this.rootChooseMode !== undefined && isNoteOn(status)) {
      this.root = this.keyTranslationTable[data1] - this.rootChooseMode
      this.rootChooseMode = undefined
      this.update()
    } else {
      const button = this.deviceInfo.midiEventToButton(status, data1)
      if (button) {
        const action = (
          `${data2 > 0 ? 'press' : 'release'}${this.shift ? 'Shifted' : ''}`
        )
        if (action in this.actions[button]) {
          this.actions[button][action].apply(this)
        }
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
