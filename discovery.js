host.addDeviceNameBasedDiscoveryPair(
  [ `Launchpad Mini MIDI 1` ],
  [ `Launchpad Mini MIDI 1` ]
)

range(16).forEach(i => {
  host.addDeviceNameBasedDiscoveryPair(
    [ `Launchpad Mini ${i + 1} MIDI 1` ],
    [ `Launchpad Mini ${i + 1} MIDI 1` ]
  )
})

host.addDeviceNameBasedDiscoveryPair(
  [ `Launchpad X MIDI 2` ],
  [ `Launchpad X MIDI 2` ]
)

range(16).forEach(i => {
  host.addDeviceNameBasedDiscoveryPair(
    [ `Launchpad X ${i + 1} MIDI 2` ],
    [ `Launchpad X ${i + 1} MIDI 2` ]
  )
})
