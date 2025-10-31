import type { CityId } from "../../constants/cities";

export type MissionPassengerModelId =
  | "none"
  | "generic"
  | "accountant"
  | "soldier"
  | "street-preacher"
  | "child"
  | "blind-woman"
  | "mirror-man"
  | "widow"
  | "clown"
  | "coroner"
  | "radio-host"
  | "nun"
  | "hooded-figure"
  | "officer"
  | "doctor"
  | "butcher"
  | "jester"
  | "priest"
  | "reflection"
  | "reaper";

export type MissionDialogueOptionConfig = {
  label: string;
  nextIndex?: number;
};

export type MissionDialogueEntry = {
  speaker: "driver" | "passenger" | "narration" | "internal" | "radio";
  text: string;
  speakerLabel?: string;
  options?: MissionDialogueOptionConfig[];
};

export type MissionPassengerPreviewConfig = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
};

export type MissionConfig = {
  id: string;
  pickupPosition: [number, number, number];
  passengerPosition: [number, number, number];
  dropoffPosition: [number, number, number];
  dropoffHint: string;
  reward: number;
  pickupRadius?: number;
  dropoffRadius?: number;
  passengerDialog?: string[];
  dialogue?: MissionDialogueEntry[];
  passengerName?: string;
  passengerModel?: MissionPassengerModelId;
  passengerRotation?: [number, number, number];
  passengerScale?: number;
  timeLimit?: number;
  passengerPreview?: MissionPassengerPreviewConfig;
};

const city1Missions: MissionConfig[] = [
  {
    id: "night1-accountant",
    pickupPosition: [-26, 1.5, -20],
    passengerPosition: [-26, 0.6, -20],
    dropoffPosition: [59, -1, -48],
    dropoffHint: "the counting house under the viaduct",
    reward: 200,
    pickupRadius: 3,
    dropoffRadius: 4,
    passengerRotation: [0, -Math.PI / 4, 0],
    passengerScale: 0.2,
    passengerName: "The Accountant",
    passengerModel: "accountant",
    timeLimit: 50,
    dialogue: [
      {
        speaker: "passenger",
        text: "I used to work with numbers. Neat, clean little lies, you know? Numbers always balance, even when you don't. I lost count one night... one missing digit, one missing person. Maybe it was you. Maybe it was me. My ledger bleeds red now. Can you smell the ink, driver? It smells like copper.",
      },
      {
        speaker: "driver",
        text: "What do you tell them?",
        options: [
          { label: "Are you alright?" },
          { label: "You should see someone." },
          { label: "That's not how ledgers work." },
        ],
      },
      {
        speaker: "passenger",
        text: "Balance is everything. You'll see soon enough.",
      },
    ],
    passengerPreview: {
      position: [0, 0.6, 0],
      rotation: [0, Math.PI, 0],
      scale: 1.2,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 80,
    },
  },
  {
    id: "night1-soldier",
    pickupPosition: [59, 0, -58],
    passengerPosition: [59, 0, -58],
    dropoffPosition: [-18, -1, 11],
    dropoffHint: "the memorial barge at the docks",
    reward: 300,
    timeLimit: 40,
    pickupRadius: 3.5,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Soldier",
    passengerModel: "soldier",
    dialogue: [
      {
        speaker: "passenger",
        text: "Funny, how cities look the same no matter where you fight. The headlights, like muzzle flashes. The silence after a scream. You ever wonder if war just follows some of us home, driver? Maybe you brought it here.",
      },
      {
        speaker: "driver",
        text: "Pick a reply.",
        options: [
          { label: "You've seen too much." },
          { label: "You've been through a lot." },
        ],
      },
      {
        speaker: "passenger",
        text: "We all have. Some of us just forget slower.",
      },
    ],
    passengerPreview: {
      position: [0, -0.8, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 16,
    },
  },
  {
    id: "night1-street-preacher",
    pickupPosition: [-33, 0, -22.4],
    passengerPosition: [-33, 0, -22.4],
    dropoffPosition: [25, -1, -53],
    dropoffHint: "the chapel ruin beyond Market Row",
    timeLimit: 40,
    reward: 250,
    pickupRadius: 3,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI / 2, 0],
    passengerScale: 0.5,
    passengerName: "The Street Preacher",
    passengerModel: "street-preacher",
    dialogue: [
      {
        speaker: "passenger",
        text: "You can't wash the blood with fuel. No, sir. It burns brighter that way. You ever smell sin ignite? Sweet, like perfume, right before it chokes you. You keep driving to escape, but it's been riding shotgun all along.",
      },
      {
        speaker: "driver",
        text: "How do you answer?",
        options: [
          { label: "You talk like you know me." },
          { label: "Do you know me?" },
        ],
      },
      {
        speaker: "passenger",
        text: "Everyone in this city knows you. They're just waiting for you to stop.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night1-child",
    pickupPosition: [-12.5, 0.1, -3.45],
    passengerPosition: [-12.5, 0.1, -3.45],
    dropoffPosition: [46.6, -1, -12],
    dropoffHint: "the empty playground by the station",
    timeLimit: 40,
    reward: 250,
    pickupRadius: 3,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.4,
    passengerName: "The Child",
    passengerModel: "child",
    dialogue: [
      {
        speaker: "passenger",
        text: "Mom says I shouldn't get in strange cars. But you're not strange, are you? You look familiar. Like that man from the news. Did you hear about him?",
      },
      {
        speaker: "driver",
        text: "Force the words out.",
        options: [{ label: "Stop talking." }],
      },
      {
        speaker: "passenger",
        text: "...",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.3,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night1-blind-woman",
    pickupPosition: [-7, 0, -24],
    passengerPosition: [-7, 0, -24],
    dropoffPosition: [-34, -1, -5],
    dropoffHint: "the sunken listening room on Bay Street",
    timeLimit: 40,
    reward: 250,
    pickupRadius: 4.5,
    dropoffRadius: 4.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Blind Woman",
    passengerModel: "blind-woman",
    dialogue: [
      {
        speaker: "passenger",
        text: "The city hums tonight. I can hear it in your tires. Every driver hums differently, but yours screams. What did you bury in the noise?",
      },
      {
        speaker: "driver",
        text: "Deflect her.",
        options: [{ label: "I just drive." }],
      },
      {
        speaker: "passenger",
        text: "No, you run.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night1-mirror-man",
    pickupPosition: [-31.644, 0, 5.543],
    passengerPosition: [-31.644, 0, 5.543],
    dropoffPosition: [77.82, 0, -21.603],
    dropoffHint: "the overpass mirror stand",
    reward: 450,
    timeLimit: 80,
    pickupRadius: 4,
    dropoffRadius: 4.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Mirror Man",
    passengerModel: "mirror-man",
    dialogue: [
      {
        speaker: "passenger",
        text: "Tired eyes. Same as mine. Look in the mirror, driver. Do you see me? Or are you me seeing you?",
      },
      {
        speaker: "internal",
        text: "I glance at the rearview. The reflection smiles before I do.",
      },
      {
        speaker: "passenger",
        text: "Don't worry. We'll trade soon. You'll get to rest.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
];

const city2Missions: MissionConfig[] = [
  {
    id: "night2-widow",
    pickupPosition: [108, 0.1, -152],
    passengerPosition: [108, 0.1, -152],
    dropoffPosition: [157.874, 0, -98.665],
    dropoffHint: "the riverside memorial turnout",
    reward: 200,
    timeLimit: 40,
    pickupRadius: 3.5,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI / 2, 0],
    passengerScale: 0.15,
    passengerName: "The Widow",
    passengerModel: "widow",
    dialogue: [
      {
        speaker: "passenger",
        text: "He used to sit right where you are, whispering to me as the road hummed beneath us. Said he'd never leave me. When the lights went red, the road kept going. Only I stopped.",
      },
      {
        speaker: "internal",
        text: "Her perfume hangs in the cab. Lilac and smoke, or maybe just static.",
      },
      {
        speaker: "driver",
        text: "Offer her something.",
        options: [
          { label: "I'm sorry for your loss." },
          { label: "Accidents happen." },
          { label: "What happened?." },
        ],
      },
      {
        speaker: "passenger",
        text: "You talk like you weren't there.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.25,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night2-clown",
    pickupPosition: [110.348, 0.1, -130.125],
    passengerPosition: [110.348, 0.1, -130.125],
    dropoffPosition: [151.937, 0, -175.748],
    dropoffHint: "the carnival ruins behind the static lights",
    reward: 350,
    timeLimit: 35,
    pickupRadius: 3.5,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.8,
    passengerName: "The Clown",
    passengerModel: "clown",
    dialogue: [
      {
        speaker: "passenger",
        text: "I used to make them laugh. Now I just make them scream. The trick's the same -- you just take off your mask and show what's underneath. Tell me, driver, when will you show yours?",
      },
      {
        speaker: "driver",
        text: "Your mask slips.",
        options: [
          { label: "Masks keep us safe." },
          { label: "You're scaring me." },
          { label: "I'm not hiding anything." },
        ],
      },
      {
        speaker: "passenger",
        text: "Everyone hides something. The best ones hide bodies.",
      },
    ],
    passengerPreview: {
      position: [0, -0.8, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 1,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 10,
    },
  },
  {
    id: "night2-coroner",
    pickupPosition: [88.198, 0, -113.495],
    passengerPosition: [88.198, 0.1, -113.495],
    dropoffPosition: [160.293, 0, -108.548],
    dropoffHint: "the morgue loading bay",
    reward: 200,
    timeLimit: 30,
    pickupRadius: 3.5,
    dropoffRadius: 3.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Coroner",
    passengerModel: "coroner",
    dialogue: [
      {
        speaker: "passenger",
        text: "Bodies talk, you know. They whisper when you unzip the bag. Guilt smells the same every time. Heavy. Wet. Gasoline-sweet.",
      },
      {
        speaker: "driver",
        text: "Shut him down.",
        options: [{ label: "You're talking nonsense." }],
      },
      {
        speaker: "passenger",
        text: "......",
      },
    ],
    passengerPreview: {
      position: [0, -0.9, 0],
      rotation: [0, Math.PI / 7, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 16,
    },
  },
  {
    id: "night2-radio-host",
    pickupPosition: [103.958, 0.1, -132.277],
    passengerPosition: [103.958, 0.6, -132.277],
    dropoffPosition: [121.417, 0.1, -148.17],
    dropoffHint: "the broadcast tower humming above the ring road",
    reward: 200,
    timeLimit: 30,
    pickupRadius: 4,
    dropoffRadius: 4,
    passengerRotation: [0, -Math.PI / 2, 0],
    passengerScale: 0.1,
    passengerName: "Radio Host",
    passengerModel: "radio-host",
    dialogue: [
      {
        speaker: "passenger",
        text: "And tonight, dear listeners, our special guest: a man who drives to forget. Say hello, Eli.",
      },
      {
        speaker: "driver",
        text: "The name claws at you.",
        options: [{ label: "How do you know my name?" }],
      },
      {
        speaker: "passenger",
        text: "We all know it. Stay tuned -- after the break, we'll revisit the incident.",
      },
    ],
    passengerPreview: {
      position: [0, -0.5, 0],
      rotation: [0, Math.PI * 1.6, 0],
      scale: 0.2,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 8,
    },
  },
  {
    id: "night2-nun",
    pickupPosition: [100.862, 0.1, -174.615],
    passengerPosition: [100.862, 0.3, -174.615],
    dropoffPosition: [83.546, 0.1, -108.37],
    dropoffHint: "the cloister on the hill",
    reward: 100,
    timeLimit: 27,
    pickupRadius: 4,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI / 2, 0],
    passengerScale: 0.5,
    passengerName: "The Nun",
    passengerModel: "nun",
    dialogue: [
      {
        speaker: "passenger",
        text: "I prayed for the lost. Then one day, one knocked on my door. He smelled like smoke and sin. Said he was a driver who took a wrong turn. Tell me, son -- do you ever dream of the road ending?",
      },
      {
        speaker: "driver",
        text: "You give the easy answer.",
        options: [{ label: "No." }],
      },
      {
        speaker: "passenger",
        text: "You will.",
      },
    ],
    passengerPreview: {
      rotation: [0, -Math.PI / 2, 0],
    },
  },
  {
    id: "night2-hooded-figure",
    pickupPosition: [96.872, 0.1, -156.985],
    passengerPosition: [96.872, 0.7, -156.985],
    dropoffPosition: [108.799, 0.1, -92.936],
    dropoffHint: "the shadowed thoroughfare beyond the loop",
    reward: 100,
    timeLimit: 26,
    pickupRadius: 4,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.52,
    passengerName: "The Hooded Figure",
    passengerModel: "hooded-figure",
    dialogue: [
      {
        speaker: "passenger",
        text: "The hood isn't to hide me. It's to protect you. You wouldn't want to see what's behind it. But soon, you will. The road always peels faces eventually.",
      },
      {
        speaker: "driver",
        text: "Say something anyway.",
        options: [{ label: "Who are you?" }],
      },
      {
        speaker: "passenger",
        text: "You'll remember when you stop pretending.",
      },
    ],
    passengerPreview: {
      position: [0, 0.1, 0],
      rotation: [0, Math.PI * 1.6, 0],
      scale: 1.1,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night2-officer",
    pickupPosition: [150.921, 0.1, -133.512],
    passengerPosition: [150.921, 0.1, -133.512],
    dropoffPosition: [94.914, 0.1, -85.816],
    dropoffHint: "the impound ramp by the river",
    reward: 900,
    timeLimit: 25,
    pickupRadius: 4,
    dropoffRadius: 4.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Officer",
    passengerModel: "officer",
    dialogue: [
      {
        speaker: "passenger",
        text: "We found your cab down by the river. Empty. Burned out. Funny thing though -- the driver's seat was clean. No blood. No body. Just your wallet, open to your license photo.",
      },
      {
        speaker: "driver",
        text: "Deny it.",
        options: [{ label: "That can't be me." }],
      },
      {
        speaker: "passenger",
        text: "Everyone says that, right before the paperwork closes.",
      },
      {
        speaker: "internal",
        text: "I can feel his flashlight through the mirror. The beam is too bright. It's burning through me.",
      },
    ],
    passengerPreview: {
      position: [0, -0.8, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 16,
    },
  },
  {
    id: "night2-doctor",
    pickupPosition: [100, 0.1, -200],
    passengerPosition: [100, 0.1, -200],
    dropoffPosition: [136.915, 0.1, -109.062],
    dropoffHint: "the emergency wing that never closes",
    reward: 200,
    timeLimit: 30,
    pickupRadius: 4,
    dropoffRadius: 4,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.08,
    passengerName: "The Doctor",
    passengerModel: "doctor",
    dialogue: [
      {
        speaker: "passenger",
        text: "Your pupils are dilated. Tremor in the hands. Insomnia. Guilt-induced psychosis. You're not driving, Eli. You're dreaming.",
      },
      {
        speaker: "driver",
        text: "",
        options: [{ label: "Shut up." }],
      },
      {
        speaker: "passenger",
        text: "I can't treat the dead.",
      },
    ],
    passengerPreview: {
      position: [0, -0.5, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.09,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
];

const city3Missions: MissionConfig[] = [
  {
    id: "night3-butcher",
    pickupPosition: [23.347, 0.1, -448.832],
    passengerPosition: [23.347, 0.1, -448.832],
    dropoffPosition: [22.578, 0.1, -527.606],
    dropoffHint: "the slaughter dock below the fog line",
    reward: 250,
    timeLimit: 30,
    pickupRadius: 4,
    dropoffRadius: 4.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 50,
    passengerName: "The Butcher",
    passengerModel: "butcher",
    dialogue: [
      {
        speaker: "passenger",
        text: "You ever notice the sound tires make on wet roads? Like slicing meat. All slick and tender. You made a stew out of time that night, everything boiling over in red.",
      },
      {
        speaker: "driver",
        text: "What spills out?",
        options: [
          { label: "What do you want from me?" },
          { label: "You're sick." },
          { label: "Get out of my car." },
        ],
      },
      {
        speaker: "passenger",
        text: "I already did. Long ago. You're the one who stayed in the wreck, seasoning yourself with guilt.",
      },
      {
        speaker: "internal",
        text: "The rearview mirror is dripping. I tell myself it's rain. I don't believe it.",
      },
    ],
    passengerPreview: {
      position: [0, -1, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 57,
      cameraPosition: [1, 1, 1],
      cameraFov: 16,
    },
  },
  {
    id: "night3-jester",
    pickupPosition: [33.248, 0.1, -436.526],
    passengerPosition: [33.248, 0.1, -436.526],
    dropoffPosition: [61.556, 0.1, -493.777],
    dropoffHint: "the collapsed carnival overpass",
    reward: 400,
    timeLimit: 27,
    pickupRadius: 4,
    dropoffRadius: 4,
    passengerRotation: [0, -Math.PI / 2, 0],
    passengerScale: 0.2,
    passengerName: "The Jester",
    passengerModel: "jester",
    dialogue: [
      {
        speaker: "passenger",
        text: "Hahaha! Denial, guilt, bargaining, anger, acceptance, five acts in the grand comedy of the damned! You're on act four, driver! Don't spoil the ending!",
      },
      {
        speaker: "driver",
        text: "You try to keep it flat.",
        options: [{ label: "You think this is funny?" }],
      },
      {
        speaker: "passenger",
        text: "It's tragedy, Eli. And tragedy is just comedy that ran out of breath.",
      },
      {
        speaker: "internal",
        text: "He leaves a balloon animal on the seat. It wheezes. It sounds like crying.",
      },
    ],
    passengerPreview: {
      position: [0, -0.7, 0],
      rotation: [0, -Math.PI / 2, 0],
      scale: 0.25,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 16,
    },
  },
  {
    id: "night3-priest",
    pickupPosition: [14, 0.1, -470],
    passengerPosition: [14, 0.3, -470],
    dropoffPosition: [52, 0.1, -522],
    dropoffHint: "the endless chapel loop",
    reward: 700,
    timeLimit: 25,
    pickupRadius: 4,
    dropoffRadius: 4.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.4,
    passengerName: "The Priest",
    passengerModel: "priest",
    dialogue: [
      {
        speaker: "passenger",
        text: "Forgiveness is the longest road of all. But you've been driving the wrong direction. You thought the meter would run out eventually, but guilt doesn't charge by the mile. It charges by the memory.",
      },
      {
        speaker: "driver",
        text: "Ask anyway.",
        options: [{ label: "Then what do I do?" }],
      },
      {
        speaker: "passenger",
        text: "Confess, son.",
      },
      {
        speaker: "driver",
        text: "The truth scrapes out.",
        options: [{ label: "I... I killed them." }],
      },
      {
        speaker: "passenger",
        text: "No, Eli. You killed yourself. The rest were passengers.",
      },
      {
        speaker: "internal",
        text: "For a second, daylight breaks through the windshield. Then it blinks out, swallowed by red taillights that never end.",
      },
    ],
    passengerPreview: {
      rotation: [0, -Math.PI / 2, 0],
    },
  },
  {
    id: "night3-reflection",
    pickupPosition: [47.299, 0.1, -465.311],
    passengerPosition: [47.299, 0.5, -465.311],
    dropoffPosition: [19.259, 0.1, -457.263],
    dropoffHint: "the cracked guardrail overlooking the fog",
    reward: 700,
    timeLimit: 25,
    pickupRadius: 4.5,
    dropoffRadius: 4.5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Reflection",
    passengerModel: "reflection",
    dialogue: [
      {
        speaker: "narration",
        text: "The passenger door opens by itself. The air turns thin.",
      },
      {
        speaker: "passenger",
        text: "I told you we'd trade places, remember? You keep driving because you think motion means progress. But you're only circling the scene. You think I'm the reflection, but maybe you're the memory.",
      },
      {
        speaker: "driver",
        text: "Name what you fear.",
        options: [
          { label: "Stop talking." },
          { label: "You're not real." },
          { label: "What are you?" },
        ],
      },
      {
        speaker: "passenger",
        text: "I'm rest. You're resistance.",
      },
      {
        speaker: "internal",
        text: "He leans forward and whispers something I can't hear. The steering wheel straightens itself. For a heartbeat, I feel peace... then the brakes screech again.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.7,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night3-child",
    pickupPosition: [56.883, 0.1, -437.528],
    passengerPosition: [56.883, 0.1, -437.528],
    dropoffPosition: [72.835, 0.1, -412.823],
    dropoffHint: "the overlook where the toy car still spins",
    reward: 1000,
    timeLimit: 20,
    pickupRadius: 4.5,
    dropoffRadius: 5,
    passengerRotation: [0, Math.PI / 4, 0],
    passengerScale: 0.3,
    passengerName: "Noah",
    passengerModel: "child",
    dialogue: [
      {
        speaker: "passenger",
        text: "Dad? You said I could stay up if I didn't fall asleep in the car. I did. When I woke up it was dark. Mom screamed. You held the wheel so tight your hands shook. That's when I wasn't scared anymore.",
      },
      {
        speaker: "driver",
        text: "Words fail.",
        options: [
          { label: "Noah... I'm sorry." },
          { label: "I didn't mean it." },
          { label: "Please..." },
        ],
      },
      {
        speaker: "passenger",
        text: "It's okay, Dad. Mom says we're almost home. You can stop driving now.",
      },
      {
        speaker: "internal",
        text: "I turn to look. Just a toy car on the seat. Its wheels still spin.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.3,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night3-widow",
    pickupPosition: [11.487, 0.1, -496.553],
    passengerPosition: [11.487, 0.1, -496.553],
    dropoffPosition: [-16.361, 0.1, -410],
    dropoffHint: "the pier where sirens never fade",
    reward: 1000,
    timeLimit: 20,
    pickupRadius: 4.5,
    dropoffRadius: 5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.15,
    passengerName: "Mara",
    passengerModel: "widow",
    dialogue: [
      {
        speaker: "passenger",
        text: "You still drive in your dreams. I see you sometimes, headlights down by the water, sirens above. They pulled me out. Not you. I remember a paramedic's hand, not yours. You looked peaceful. Like you'd already left.",
      },
      {
        speaker: "driver",
        text: "You reach for excuses.",
        options: [
          { label: "You survived?" },
          { label: "I tried to save you." },
          { label: "Please stop." },
        ],
      },
      {
        speaker: "passenger",
        text: "You didn't try, Eli. You slept. One blink too long, one turn too late. I lived. The house is quiet. Noah's toys are in boxes. Sometimes I leave the door open, hoping the cab will pull in.",
      },
      {
        speaker: "internal",
        text: "Her words weigh more than the wheel. She breathes air I'll never feel.",
      },
    ],
    passengerPreview: {
      position: [0, -0.6, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.25,
      cameraPosition: [0, 1.2, 2.8],
      cameraFov: 26,
    },
  },
  {
    id: "night3-reaper",
    pickupPosition: [4.735, 0.1, -450.002],
    passengerPosition: [4.735, 0.1, -450.002],
    dropoffPosition: [60, 0.1, -500],
    dropoffHint: "the last mile marker before the void",
    reward: 1500,
    timeLimit: 20,
    pickupRadius: 4.5,
    dropoffRadius: 5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.08,
    passengerName: "The Reaper",
    passengerModel: "reaper",
    dialogue: [
      {
        speaker: "passenger",
        text: "You've done well to make it this far, Eli. Three nights, three cities, ten faces. All roads end here. You've carried them long enough.",
      },
      {
        speaker: "driver",
        text: "You bargain anyway.",
        options: [
          { label: "Then let me go." },
          { label: "What about them?" },
          { label: "I can't stop driving." },
        ],
      },
      {
        speaker: "passenger",
        text: "No one stops. But some finally turn off the headlights.",
      },
      {
        speaker: "internal",
        text: "His presence isn't cold, it's hollow. Like standing where something once stood.",
      },
    ],
    passengerPreview: {
      position: [0, -0.8, 0],
      rotation: [0, Math.PI / 6, 0],
      scale: 0.08,
      cameraPosition: [0, 2, 2.8],
      cameraFov: 16,
    },
  },
  {
    id: "night3-voice",
    pickupPosition: [44, 0.1, -512],
    passengerPosition: [44, 0.1, -512],
    dropoffPosition: [16, 0.1, -552],
    dropoffHint: "the broken guardrail above the crash site",
    reward: 2500,
    timeLimit: 40,
    pickupRadius: 4.5,
    dropoffRadius: 5,
    passengerRotation: [0, Math.PI, 0],
    passengerScale: 0.5,
    passengerName: "The Voice",
    passengerModel: "none",
    dialogue: [
      {
        speaker: "passenger",
        speakerLabel: "Everyone",
        text: "There was never a road. Only the rhythm of your heart slowing. Every mile you drove was a memory replayed. You didn't survive the crash, Eli. You've been ferrying us, your ghosts, home.",
      },
      {
        speaker: "driver",
        text: "You whisper to the static.",
        options: [{ label: "Then where's home?" }],
      },
      {
        speaker: "passenger",
        speakerLabel: "Everyone",
        text: "Where you stop lying.",
      },
      {
        speaker: "narration",
        text: "The headlights dim. Fog parts around a fractured guardrail. It's the same curve from the night of the crash.",
      },
    ],
  },
];

export const MISSIONS_BY_CITY: Record<CityId, MissionConfig[]> = {
  city1: city1Missions,
  city2: city2Missions,
  city3: city3Missions,
};
