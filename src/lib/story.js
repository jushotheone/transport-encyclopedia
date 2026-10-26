// Story content: route themes, clues, field missions and card rarity.
import { hashString } from '@/lib/routegen'

// What each division's puzzle looks like, and the real idea the child just practised.
export const routeThemes = {
  air: { vehicle: '✈️', deco: 'dash', from: 'Airport', to: 'Destination', learned: 'Planes follow fixed flight paths called airways, so they never meet in the same piece of sky.' },
  road: { vehicle: '🚗', deco: 'dash', from: 'Depot', to: 'Delivery', learned: 'Junctions and lanes keep traffic flowing. A good road network has more than one way to get somewhere.' },
  rail: { vehicle: '🚆', deco: 'sleepers', from: 'Station', to: 'Terminus', learned: 'Trains cannot steer. Track switches called points send them left or right.' },
  water: { vehicle: '⛵', deco: 'dash', from: 'Harbour', to: 'Port', learned: 'Ships follow marked shipping lanes, and buoys show where the water is safe and deep enough.' },
  space: { vehicle: '🚀', deco: 'dash', from: 'Launch pad', to: 'Orbit', learned: 'Rockets follow a trajectory planned in advance, because there are no roads in space.' },
  pipeline: { vehicle: '💧', deco: 'flow', from: 'Source', to: 'Tank', learned: 'Pipelines use valves and junctions to steer liquids and gas, just like points steer trains.' },
  cable: { vehicle: '🚡', deco: 'dots', from: 'Valley station', to: 'Summit', learned: 'Cable cars run on strong cables between stations, so the route is fixed and has to be planned carefully.' },
  future: { vehicle: '🌀', deco: 'flow', from: 'Test hub', to: 'Smart city', learned: 'Future transport is tested again and again before it carries people, because safety comes first.' },
}

// One clue unlocks per repaired route. They describe the anomaly, never who or what causes it.
export const clues = {
  air: { glyph: '◈', title: 'The radar that lied', text: 'Pilots saw an airport on their maps that was not there. The radar logs show the same strange shape each time.' },
  road: { glyph: '⬡', title: 'The signpost that moved', text: 'A road sign pointed to a junction that had moved overnight. Someone had scratched a tiny symbol into the metal.' },
  rail: { glyph: '⌬', title: 'The silent signal', text: 'Every signal on one line showed green at the same instant, which should be impossible. A shape glowed in the control panel.' },
  water: { glyph: '✦', title: 'The harbour that drifted', text: 'The harbour chart said "left", but the real harbour was on the right. The buoys had been marked with a pattern.' },
  space: { glyph: '⏣', title: 'The orbit that changed', text: 'A satellite arrived exactly where it should be, on a route nobody had planned. Its log held one repeating symbol.' },
  pipeline: { glyph: '⧖', title: 'The flow that reversed', text: 'Water flowed the wrong way for exactly one minute, then went back. The pressure graph drew a shape.' },
  cable: { glyph: '⌖', title: 'The station that was not there', text: 'Cable cars reached a summit station that is missing from every map. A symbol was etched on its door.' },
  future: { glyph: '⟡', title: 'The message with no name', text: 'A note appeared in the network with no sender. It said only: "Look at the routes, not the vehicles."' },
}

// Real-world challenges: the offline part of exploring. One is chosen per day.
export const fieldMissions = [
  { emoji: '👀', title: 'Spot three', text: 'On your next trip, spot three different kinds of vehicle. Which division is each one from?' },
  { emoji: '🛞', title: 'Wheel count', text: 'Find a vehicle with two wheels, one with four, and one with more than four. What is each one for?' },
  { emoji: '🚦', title: 'Signal watch', text: 'Watch a set of traffic lights for one whole cycle. How many cars get through before it changes?' },
  { emoji: '🗣️', title: 'Teach a grown-up', text: 'Tell someone one fun fact you learned today. Can you explain it without looking?' },
  { emoji: '🗺️', title: 'Route detective', text: 'Next time you travel, name the route you take. Is there a backup route if it gets blocked?' },
  { emoji: '✏️', title: 'Sketch a vehicle', text: 'Draw a vehicle you saw today. What is each part for? Why is it that shape?' },
  { emoji: '☁️', title: 'Sky check', text: 'Look up for two minutes. Count the aircraft or trails you see. Which way are they heading?' },
  { emoji: '🔊', title: 'Sound hunt', text: 'Close your eyes and listen. How many different transport sounds can you hear?' },
  { emoji: '📦', title: 'Where did it travel?', text: 'Pick something in your home. How do you think it got there? Plane, ship, train or lorry?' },
  { emoji: '🏗️', title: 'Build a route', text: 'Use cushions, blocks or toys to build a route with a backup. Then block one path. Does it still work?' },
  { emoji: '🧭', title: 'North star', text: 'Find which direction is north near your home. How would a pilot or sailor use it?' },
  { emoji: '🤔', title: 'Ask why', text: 'Pick a vehicle and ask a grown-up "why is it shaped like that?" Write down the answer.' },
]

export function fieldMissionFor(day) {
  return fieldMissions[hashString(day) % fieldMissions.length]
}

// Card rarity is a fixed, fair property of each vehicle.
export const rarities = [
  { id: 'common', label: 'Common', colour: '#94a3b8', holo: false },
  { id: 'rare', label: 'Rare', colour: '#38bdf8', holo: true },
  { id: 'epic', label: 'Epic', colour: '#a855f7', holo: true },
  { id: 'legendary', label: 'Legendary', colour: '#fbbf24', holo: true },
]

export function rarityOf(slug) {
  const n = hashString(slug) % 100
  return rarities[n < 58 ? 0 : n < 83 ? 1 : n < 95 ? 2 : 3]
}
