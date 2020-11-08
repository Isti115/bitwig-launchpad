loadAPI(12);

host.setShouldFailOnDeprecatedUse(true)

host.defineController(
  'Novation',
  'Launchpad Mini',
  '0.3',
  '6e26ac0c-2c3e-440c-a7fc-a64dac7d3992',
  'isti'
)
host.defineMidiPorts(1, 1)

load('utilities.js')
load('discovery.js')

discover.mini()

load('common.js')
load('deviceInfo.js')
load('Launchpad.js')

// println(Object.keys(this))

const lp = new Launchpad()

function init() {
  lp.init(host.getMidiInPort(0), host.getMidiOutPort(0), deviceInfo.mini)
}

function flush() { lp.flush() }

function exit() { lp.exit() }
