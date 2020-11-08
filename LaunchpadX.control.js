loadAPI(12);

host.setShouldFailOnDeprecatedUse(true)

host.defineController(
  'Novation',
  'Launchpad X',
  '0.3',
  'd745798d-b202-4742-b339-fff6a4d034a1',
  'isti'
)
host.defineMidiPorts(1, 1)

load('utilities.js')
load('discovery.js')

discover.x()

load('common.js')
load('deviceInfo.js')
load('Launchpad.js')

// println(Object.keys(this))

const lp = new Launchpad()

function init() {
  lp.init(host.getMidiInPort(0), host.getMidiOutPort(0), deviceInfo.x)
}

function flush() { lp.flush() }

function exit() { lp.exit() }
