// Expeditions: tap the hidden discoveries in each division's scene. Positions are percentages of the scene.
const h = (id, x, y, icon, title, fact) => ({ id, x, y, icon, title, fact })

export const expeditions = {
  air: {
    place: 'Airfield',
    spots: [
      h('airliner', 28, 22, 'plane', 'Airliner', 'Big passenger planes cruise about 10,000 metres up, higher than most clouds, where the air is thin and smooth.'),
      h('tower', 78, 70, 'tower', 'Control tower', 'Air traffic controllers watch the sky and tell pilots when to take off, when to land and which route to follow.'),
      h('windsock', 17, 72, 'wind', 'Windsock', 'A windsock shows which way the wind blows. Planes usually take off and land facing into the wind.'),
      h('ambulance', 80, 20, 'cross', 'Air ambulance', 'Air ambulances can land near an emergency where roads are blocked and carry patients to hospital quickly.'),
    ],
  },
  road: {
    place: 'Junction',
    spots: [
      h('lights', 24, 48, 'cone', 'Traffic lights', 'Traffic lights take turns, so vehicles do not cross each other at the same moment.'),
      h('bus', 60, 78, 'bus', 'Bus', 'One bus can carry as many people as many cars, so it means fewer vehicles and less traffic.'),
      h('ambulance', 82, 58, 'ambulance', 'Ambulance', 'Sirens and flashing lights warn other drivers to make way so the ambulance can reach people fast.'),
      h('lines', 30, 90, 'route', 'Road markings', 'Lines painted on the road show where lanes are, and where it is safe to overtake and where it is not.'),
    ],
  },
  rail: {
    place: 'Railway',
    spots: [
      h('train', 50, 64, 'train', 'Passenger train', 'Steel wheels roll on steel rails with very little friction, so trains can carry lots of people using little energy for each person.'),
      h('signal', 22, 38, 'lamp', 'Signal', 'Signals tell the driver whether the track ahead is clear. Only one train is allowed in each section at a time.'),
      h('points', 72, 88, 'split', 'Points', 'Points, also called switches, move the track so a train can go onto a different route.'),
      h('platform', 82, 36, 'ticket', 'Platform', 'Platforms are raised so passengers can step on and off at the same level as the train floor.'),
    ],
  },
  water: {
    place: 'Harbour',
    spots: [
      h('anchor', 22, 74, 'anchor', 'Anchor', 'An anchor digs into the seabed and holds a ship in place so it does not drift away.'),
      h('cargo', 58, 46, 'ship', 'Cargo ship', 'About 90% of the goods traded around the world travel by sea at some point in their journey.'),
      h('buoy', 80, 74, 'lifebuoy', 'Buoy', 'Buoys float on the sea and mark safe channels and hidden dangers, a bit like road signs for boats.'),
      h('lighthouse', 15, 26, 'lamp', 'Lighthouse', 'Lighthouses flash bright lights so sailors can find the coast and avoid rocks at night.'),
    ],
  },
  space: {
    place: 'Orbit',
    spots: [
      h('satellite', 28, 26, 'satellite', 'Satellite', 'Satellites circle the Earth and help with maps, weather forecasts, TV and GPS.'),
      h('rocket', 72, 34, 'rocket', 'Rocket', 'A rocket pushes hot gas down and backwards, and that push sends it up. Every action has an equal and opposite reaction.'),
      h('orbit', 76, 72, 'orbit', 'Orbit', 'Things in orbit are always falling around the Earth, but they move sideways so fast that they keep missing it.'),
      h('astronaut', 20, 76, 'user', 'Astronaut', 'Astronauts float on the space station because they and the station are in free fall around Earth, not because there is no gravity.'),
    ],
  },
  pipeline: {
    place: 'Pumping station',
    spots: [
      h('tank', 18, 66, 'cylinder', 'Storage tank', 'Storage tanks hold liquids until they are needed, like a big cupboard for a pipeline.'),
      h('valve', 50, 36, 'wrench', 'Valve', 'Valves open and close like taps to control the flow, or to stop it safely if something goes wrong.'),
      h('main', 80, 78, 'droplets', 'Water main', 'Clean water reaches your home through big underground pipes called water mains.'),
      h('pig', 36, 90, 'piggy', 'The "pig"', 'Engineers send a device nicknamed a "pig" through some pipelines to clean them and check for damage.'),
    ],
  },
  cable: {
    place: 'Mountain station',
    spots: [
      h('gondola', 55, 24, 'cablecar', 'Gondola', 'Many gondola cabins let go of the moving cable at the station, so people can step on slowly and safely.'),
      h('chairlift', 26, 66, 'snowflake', 'Chairlift', 'Chairlifts carry skiers up the mountain so they can ski down.'),
      h('mountain', 78, 56, 'mountain', 'Steep slope', 'Cable systems can climb slopes that are too steep for roads or railways.'),
      h('motor', 14, 20, 'cog', 'Drive station', 'A powerful motor turns a huge wheel at a station, pulling the cable round in a loop.'),
    ],
  },
  future: {
    place: 'Test city',
    spots: [
      h('hyperloop', 50, 56, 'gauge', 'Hyperloop idea', 'Hyperloop is an idea for pods that travel through low-pressure tubes. It is still experimental and not in everyday use.'),
      h('airtaxi', 24, 28, 'takeoff', 'Air taxi', 'Small electric aircraft that take off straight up are being tested for short trips across cities.'),
      h('selfdrive', 78, 72, 'bot', 'Self-driving car', 'Self-driving vehicles use cameras and sensors to see the road. They are still being tested to make sure they are safe.'),
      h('electric', 18, 76, 'battery', 'Clean power', 'Electric vehicles can be charged with electricity made from sunshine and wind.'),
    ],
  },
}

export const spotKey = (division, id) => `explore:${division}:${id}`
