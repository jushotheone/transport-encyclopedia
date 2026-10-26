// Mission Planner scenarios. Every option has a rating and a short reason, so
// there is no single "right" answer: kids weigh trade-offs, then must find a backup plan.
const o = (rating, why) => ({ rating, why })

export const disruptions = {
  air: 'A big storm rolls in and every flight is grounded!',
  road: 'A landslide blocks the road!',
  rail: 'A signal fault stops every train on the line!',
  water: 'Rough waves close the harbour!',
  space: 'The launch is delayed by bad weather!',
  pipeline: 'A valve fails and the flow must be shut off safely!',
  cable: 'Strong winds make it unsafe to run the cable cars!',
  future: 'The experimental system glitches, so engineers switch it off to stay safe!',
}

export const scenarios = [
  {
    id: 'snow-medicine',
    icon: 'pill',
    title: 'Snowbound medicine',
    story: 'A mountain village is cut off by snow. 40 boxes of medicine must arrive today. The village has one small flat field.',
    options: {
      air: o('great', 'A helicopter can land in the field and skip the blocked roads.'),
      road: o('poor', 'Snow has blocked the mountain road, so lorries cannot get through.'),
      rail: o('poor', 'There is no railway to the village, and trains need tracks.'),
      water: o('poor', 'There is no river or sea nearby for boats.'),
      space: o('poor', 'Rockets do not deliver boxes to fields. Satellites can help with maps and weather, though!'),
      pipeline: o('poor', 'Pipelines carry liquids and gas, not boxes.'),
      cable: o('ok', 'A cable car could lift boxes up the mountain, if one existed here and the wind stayed calm.'),
      future: o('ok', 'A delivery drone might do it, but drones are still being tested for long trips. A bold choice!'),
    },
  },
  {
    id: 'festival-rush',
    icon: 'party',
    title: 'Festival rush',
    story: '3,000 people need to get from the city to a seaside festival before the evening show starts.',
    options: {
      rail: o('great', 'One train carries hundreds of people and never gets stuck in traffic.'),
      road: o('ok', 'Buses can work, but thousands of people need lots of buses and might sit in traffic.'),
      air: o('poor', 'Planes are too small for this short trip, and they need airports.'),
      water: o('ok', 'A ferry carries many people if the town has a harbour, but it is slow.'),
      space: o('poor', 'Rockets carry a few astronauts into orbit, not festival crowds.'),
      pipeline: o('poor', 'Pipelines are for liquids and gas, not people!'),
      cable: o('poor', 'Cable cars carry only a few people at a time over short hills.'),
      future: o('poor', 'A super-fast pod would be amazing, but it is still an experiment. We cannot rely on it today.'),
    },
  },
  {
    id: 'island-books',
    icon: 'book',
    title: 'Island school books',
    story: '200 boxes of books must reach a school on an island before term starts. The sea is calm.',
    options: {
      water: o('great', 'A ferry or cargo boat carries lots of boxes across the sea in one trip.'),
      air: o('ok', 'Planes or helicopters could do it, but it would take many trips.'),
      road: o('poor', 'Roads stop at the water, unless there is a bridge.'),
      rail: o('poor', 'Tracks do not go across the sea.'),
      space: o('poor', 'Rockets are not for school deliveries!'),
      pipeline: o('poor', 'Books would get very soggy, and pipelines are for liquids anyway.'),
      cable: o('poor', 'Cables only cross short gaps, and this sea is wide.'),
      future: o('ok', 'A robot cargo boat could help, but they are still being tested.'),
    },
  },
  {
    id: 'cliff-rescue',
    icon: 'siren',
    title: 'Cliff path rescue',
    story: 'A hiker is hurt on a narrow cliff path. There is no road nearby, and they need a hospital fast.',
    options: {
      air: o('great', 'A rescue helicopter can hover and lift the hiker with no road needed.'),
      road: o('ok', 'An ambulance is great for the last part of the trip, but it cannot reach the cliff path.'),
      rail: o('poor', 'There are no tracks on a cliff path.'),
      water: o('ok', 'If the cliff is by the sea, a lifeboat can help, but cliffs can be hard to reach by water.'),
      space: o('poor', 'Satellites help rescuers find the spot with GPS, but they cannot carry the hiker.'),
      pipeline: o('poor', 'Pipelines cannot carry people.'),
      cable: o('poor', 'There is no cable car on this path.'),
      future: o('ok', 'A rescue drone could find the hiker quickly, but it cannot carry them yet.'),
    },
  },
  {
    id: 'thirsty-city',
    icon: 'droplets',
    title: 'Water for a thirsty city',
    story: 'A big city needs millions of litres of clean water every single day, all year round.',
    options: {
      pipeline: o('great', 'Pipes move water all day and night, quietly, with no drivers and no traffic.'),
      road: o('poor', 'It would need thousands of tanker lorries every day: traffic and pollution!'),
      rail: o('ok', 'Tanker trains carry lots, but only where tracks already go.'),
      water: o('ok', 'Tanker ships work if the city is on the coast, but not for a never-ending supply.'),
      air: o('poor', 'Planes are far too small and costly for this job.'),
      space: o('poor', 'Rockets cannot bring water to a city.'),
      cable: o('poor', 'Cables cannot carry that much water.'),
      future: o('poor', 'Nothing experimental moves this much water yet.'),
    },
  },
]

export const ratingPoints = { great: 1.5, ok: 1, poor: 0 }
export const ratingLabel = {
  great: { text: 'Great choice!', icon: 'star' },
  ok: { text: 'It could work', icon: 'thumbs' },
  poor: { text: 'Not a good fit', icon: 'help' },
}
