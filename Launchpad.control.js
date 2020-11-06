loadAPI(12);

host.setShouldFailOnDeprecatedUse(true)

host.defineController(
  'Novation',
  'Launchpad',
  '0.1',
  '6e26ac0c-2c3e-440c-a7fc-a64dac7d3992',
  'isti'
)
host.defineMidiPorts(1, 1)

load('utilities.js')
load('common.js')
load('deviceInfo.js')
load('Launchpad.js')

// println(Object.keys(this))

const lp = new Launchpad()

function init() {
  lp.init(host.getMidiInPort(0), host.getMidiOutPort(0), deviceInfo.mini)
  println('Launchpad initialized!')
}

function flush() {
  lp.flush()

  // Scroll "Hello world!"
  // lp.midiOut.sendSysex('F0002029097C0548656C6C6F2002776f726c6421F7')
}

function exit() {
  lp.exit()
}
