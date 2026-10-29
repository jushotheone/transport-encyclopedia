// Riddle hunts. Each scene has riddle answers (targets) and look-alike things that are NOT the answer (decoys).
// Tapping a decoy still teaches something, so exploring is rewarded even when the guess is wrong.
import { expeditions } from '@/lib/expeditions'

const target = (division, id, hint, riddles) => {
  const spot = expeditions[division].spots.find((s) => s.id === id)
  return { id, title: spot.title, fact: spot.fact, hint, riddles }
}

export const hunts = {
  air: {
    scene: 'airfield',
    title: 'the airfield',
    intro: 'Tap the right thing to solve each riddle. Swipe to look around!',
    targets: [
      target('air', 'tower', 'Look for something tall near the middle with windows at the top.', [
        "I'm tall with big windows at the very top. People inside me tell pilots when it is safe to take off and land. What am I?",
        'Air traffic controllers work inside me, watching every plane in the sky. What am I?',
      ]),
      target('air', 'windsock', 'Look near the ground for a stripy bag on a pole.', [
        "I'm a stripy bag on a pole. I show which way the wind is blowing. What am I?",
        'Pilots check me before they take off to see what the wind is doing. What am I?',
      ]),
      target('air', 'airliner', 'Look up! It is high in the sky.', [
        'I carry hundreds of people high above the clouds. Look up! What am I?',
        'I fly about 10,000 metres up, where the air is thin and smooth. Can you spot me?',
      ]),
      target('air', 'ambulance', 'Look to the right, on the round pad with an H.', [
        'I can hover and land without a runway, and I rush to emergencies. What am I?',
        'I have a spinning wing on top and I carry hurt people to hospital fast. What am I?',
      ]),
    ],
    decoys: [
      { id: 'hangar', title: 'Hangar', fact: 'A hangar is like a garage for aircraft. Engineers fix planes inside, out of the rain and wind.' },
      { id: 'fuel', title: 'Fuel truck', fact: 'Fuel trucks fill planes before they fly. A big airliner can hold tens of thousands of litres.' },
      { id: 'balloon', title: 'Hot air balloon', fact: 'A hot air balloon rises because the hot air inside is lighter than the cooler air outside.' },
      { id: 'runway', title: 'Runway', fact: 'Runway numbers show which way the runway points on a compass. Runway 27 points west.' },
    ],
  },
}
