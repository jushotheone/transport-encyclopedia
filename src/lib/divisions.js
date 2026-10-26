// The eight permanent ZTS divisions. Colours come from the ZTS Creative Strategy v1.2.
export const divisions = [
  {
    slug: 'air',
    name: 'Air Transport',
    accent: '#31A8E0',
    secondary: '#F4FAFD',
    tagline: 'Master the sky',
    description: 'Planes, helicopters, drones, gliders and balloons. Learn how things fly, and how pilots find their way.',
    mission: 'Follow the flight paths across the sky.',
  },
  {
    slug: 'road',
    name: 'Road Transport',
    accent: '#F59E0B',
    secondary: '#32383D',
    tagline: 'Keep the world rolling',
    description: 'Cars, buses, lorries, ambulances and fire engines. Discover how junctions and lanes keep everyone moving.',
    mission: 'Crack the secrets of traffic flow.',
  },
  {
    slug: 'rail',
    name: 'Rail Transport',
    accent: '#D64045',
    secondary: '#69747C',
    tagline: 'Precision on parallel lines',
    description: 'Trains, trams, undergrounds and monorails. Find out why signals and timetables matter so much.',
    mission: 'Switch the points and keep trains safe.',
  },
  {
    slug: 'water',
    name: 'Water Transport',
    accent: '#008C95',
    secondary: '#12344A',
    tagline: 'Navigate the deep',
    description: 'Ships, ferries, boats and submarines. See how things float, and how ports connect the world.',
    mission: 'Chart a course through the currents.',
  },
  {
    slug: 'space',
    name: 'Space Transport',
    accent: '#4246A3',
    secondary: '#E9EEF6',
    tagline: 'Beyond the sky',
    description: 'Rockets, capsules, satellites and stations. Real missions are marked, and imagined ones are too.',
    mission: 'Plot a path through orbit.',
  },
  {
    slug: 'pipeline',
    name: 'Pipeline Transport',
    accent: '#24875D',
    secondary: '#B66A3C',
    tagline: 'The silent carriers',
    description: 'Water, oil and gas move quietly underground. Learn about flow, pressure and keeping nature safe.',
    mission: 'Follow the flow beneath your feet.',
  },
  {
    slug: 'cable',
    name: 'Cable Transport',
    accent: '#E97828',
    secondary: '#F7F7F4',
    tagline: 'Riding the high lines',
    description: 'Cable cars, gondolas and chairlifts. Find out how tension and balance carry people up mountains.',
    mission: 'Climb the mountain on a thread.',
  },
  {
    slug: 'future',
    name: 'Future Tech',
    accent: '#00BBD4',
    secondary: '#7057D9',
    tagline: 'Tomorrow, tested today',
    description: 'Experimental ideas such as hyperloops, flying cars and smart vehicles. These are not all real yet, so we say which are.',
    mission: 'Test ideas that do not exist yet.',
  },
]

export function getDivision(slug) {
  return divisions.find((d) => d.slug === String(slug).toLowerCase().trim())
}
