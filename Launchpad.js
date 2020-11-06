function Launchpad () {
  const methods = [
    // Lifecycle
    'init', 'start', 'reset', 'update', 'flush', 'exit',

    // Methods
    'onMidi', 'sendMidi', 'sendNote', 'sendCC',
    'getColorForPurpose', 'getNoteForPosition',
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

    // println(defaultColor[ColorPurpose.SUSTAIN])

    this.start()
  },

  start () {
    this.noteInput = this.midiIn.createNoteInput('Launchpad ???')
    this.noteInput.setShouldConsumeEvents(false)
    this.midiIn.setMidiCallback(this.onMidi)

    this.LEDUpdateQueue = []

    this.reset()
  },

  reset () {
    this.sendMidi(MIDIMessageType.CONTROL_CHANGE, 0, 0)

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

  },

  // Getters, setters

  set root (r) {
    this._root = ((r % 12) + 12) % 12
  },

  get root () {
    return this._root
  },

  // Methods

  onMidi (status, data1, data2) {

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
