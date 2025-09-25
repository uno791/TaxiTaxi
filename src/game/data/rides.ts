import type { Ride } from '../types';

export const RIDES: Ride[] = [
  {
    id: 'regular-1',
    name: 'Mrs. Suda',
    start: {
      position: { x: -8, z: -68 },
      heading: Math.PI / 2,
    },
    destination: {
      position: { x: -9, z: 60 },
      radius: 3,
      description: 'Head north along the avenue and ease toward the west walkway with the dim porch light.',
    },
    dialogues: [
      'Thanks for picking me up again, child. The nights keep getting colder.',
      'Drop me by the quiet walkway. Stay on the main road and ease left past the single streetlight.',
      'If the night wind whistles, ignore it. The spirits love to tease drivers.',
    ],
    pay: 55,
  },
  {
    id: 'regular-2',
    name: 'Mr. Kiet',
    start: {
      position: { x: 6, z: -50 },
      heading: Math.PI / 2,
    },
    destination: {
      position: { x: 9, z: 78 },
      radius: 3,
      description: 'Go straight to the far end of the avenue, then angle right toward the cool-blue porch light.',
    },
    dialogues: [
      'Evening driver. Long night ahead?',
      'Same drop as earlier – the house with the cool-blue porch. Make a clean right turn when the road slopes.',
      'Strange how everyone ends up near that boarded-up field lately…',
    ],
    pay: 65,
  },
  {
    id: 'regular-3',
    name: 'Linh',
    start: {
      position: { x: -4, z: -30 },
      heading: 0,
    },
    destination: {
      position: { x: -11, z: 102 },
      radius: 3,
      description: 'Cut across the side street and pull up to the walkway with the warm orange light.',
    },
    dialogues: [
      'Hey! You remember me, right? I feel safer with familiar faces.',
      'Can you take me to the loft? From the intersection, keep straight and stop at the orange-lit walkway.',
      'They say a spirit medium vanished nearby last year. I still hear her bells.',
    ],
    pay: 70,
  },
  {
    id: 'regular-4',
    name: 'Brother Somchai',
    start: {
      position: { x: -10, z: -20 },
      heading: Math.PI / 2,
    },
    destination: {
      position: { x: 11, z: 118 },
      radius: 3,
      description: 'Follow the main avenue north and keep right toward the last porch before the fields.',
    },
    dialogues: [
      'The temple bells rang twice tonight – a bad omen.',
      'Bring me to the shrine house with the cracked lanterns. Drive north, keep right when the road tightens.',
      'If you hear whispering, keep your eyes on the road. Spirits hate attention.',
    ],
    pay: 75,
  },
  {
    id: 'killer',
    name: 'Mute Stranger',
    start: {
      position: { x: 0, z: -36 },
      heading: Math.PI / 2,
    },
    destination: {
      position: { x: -4, z: 138 },
      radius: 5,
      description: 'Keep heading north past the last streetlights into the open field.',
    },
    dialogues: [
      '…',
      'Drive to the open field past the gum trees. Do not take the plaza turn.',
      'Do not slow down. Do not look back.',
    ],
    pay: 0,
    decision: true,
  },
];
