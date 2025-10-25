import type { CityId } from "../../constants/cities";

export type MissionConfig = {
  id: string;
  pickupPosition: [number, number, number];
  passengerPosition: [number, number, number];
  dropoffPosition: [number, number, number];
  dropoffHint: string;
  reward: number;
  pickupRadius?: number;
  dropoffRadius?: number;
  passengerDialog: string[];
  passengerRotation?: [number, number, number];
  passengerScale?: number;
  timeLimit?: number;
};

export const MISSIONS_BY_CITY: Record<CityId, MissionConfig[]> = {
  city1: [
    {
      id: "mission-tennis",
      pickupPosition: [-26, -1, -20],
      passengerPosition: [-26, 0, -20],
      dropoffPosition: [59, -1, -48],
      dropoffHint: "the tennis courts",
      reward: 350,
      pickupRadius: 3,
      dropoffRadius: 2,
      passengerRotation: [0, Math.PI, 0],
      passengerDialog: [
        "Thanks for stopping! I’m running late for my match.",
        "These roads get busier every day, don’t they?",
        "I heard the courts got resurfaced—can’t wait to see them.",
      ],
      timeLimit: 50,
    },
    {
      id: "mission-docks",
      pickupPosition: [59, 0.012, -58],
      passengerPosition: [59, 0, -58],
      dropoffPosition: [-18, -1, 11],
      dropoffHint: "the city docks",
      reward: 420,
      pickupRadius: 3.5,
      dropoffRadius: 4,
      passengerDialog: [
        "Appreciate the pickup. My boat leaves in a few minutes!",
        "Could you take the river road? It’s usually quicker.",
        "I hope the tide hasn’t held everyone up again.",
      ],
      timeLimit: 50,
    },
    {
      id: "mission-museum",
      pickupPosition: [-33, 0, -22.4],
      passengerPosition: [-33, 0, -22.4],
      dropoffPosition: [25, -1, -53],
      dropoffHint: "the museum plaza",
      reward: 380,
      pickupRadius: 3,
      dropoffRadius: 4,
      passengerDialog: [
        "I’ve got an exhibit opening—thank you for the rescue!",
        "Do you know any shortcuts through downtown?",
        "The plaza should be buzzing right about now.",
      ],
      timeLimit: 50,
    },
    {
      id: "mission-mall",
      pickupPosition: [-12.5, 0.1, -3.45],
      passengerPosition: [-12.5, 0, -3.45],
      dropoffPosition: [46.6, -1, -12],
      dropoffHint: "the shopping district",
      reward: 400,
      pickupRadius: 3,
      dropoffRadius: 4.2,
      passengerDialog: [
        "Perfect timing! The sales end in ten minutes.",
        "Let me know if you spot a faster lane ahead.",
        "I can’t believe how heavy these bags are!",
      ],
      timeLimit: 50,
    },
  ],
  city2: [
    {
      id: "mission-c2-tech-park",
      pickupPosition: [108, 0.1, -152],
      passengerPosition: [108, 0.1, -152],
      dropoffPosition: [94, 0.1, -188],
      dropoffHint: "the tech park plaza",
      reward: 500,
      pickupRadius: 3,
      dropoffRadius: 3.5,
      passengerDialog: [
        "The prototype demo starts in fifteen—no pressure, right?",
        "They say this district never sleeps; looks like it never parks either.",
        "If we hit the flyover before the lights change, we’re golden.",
      ],
      timeLimit: 60,
    },
    {
      id: "mission-c2-harbor",
      pickupPosition: [120, 0.1, -128],
      passengerPosition: [120, 0.1, -128],
      dropoffPosition: [76, 0.1, -142],
      dropoffHint: "the elevated harbor walk",
      reward: 520,
      pickupRadius: 3,
      dropoffRadius: 4,
      passengerDialog: [
        "City Two’s skyline is wild right now—have you seen the cranes?",
        "Keep to the outer lanes, the central strip’s jammed up this hour.",
        "I promised my crew I’d handle the permits. Can’t be late… again.",
      ],
      timeLimit: 60,
    },
    {
      id: "mission-c2-night-market",
      pickupPosition: [92, 0.1, -118],
      passengerPosition: [92, 0.1, -118],
      dropoffPosition: [110, 0.1, -170],
      dropoffHint: "the neon night market",
      reward: 540,
      pickupRadius: 3,
      dropoffRadius: 4,
      passengerDialog: [
        "Thanks for the lift—my pop-up stall opens at sundown.",
        "You feel that hum? They’re testing the new mag-rail nearby.",
        "The market lights up the entire block; can’t miss it.",
      ],
      timeLimit: 65,
    },
  ],
  city3: [
    {
      id: "mission-c3-skyport",
      pickupPosition: [24, 0.1, -448],
      passengerPosition: [24, 0.1, -448],
      dropoffPosition: [4, 0.1, -510],
      dropoffHint: "the skyport terminal",
      reward: 650,
      pickupRadius: 3,
      dropoffRadius: 4,
      passengerDialog: [
        "The shuttle can’t leave without the navigation chips I’m carrying.",
        "Watch the crosswinds along the ridge—they catch drivers off guard.",
        "City Three always feels like the future, doesn’t it?",
      ],
      timeLimit: 70,
    },
    {
      id: "mission-c3-research-dome",
      pickupPosition: [40, 0.1, -432],
      passengerPosition: [40, 0.1, -432],
      dropoffPosition: [68, 0.1, -470],
      dropoffHint: "the research dome entrance",
      reward: 670,
      pickupRadius: 3,
      dropoffRadius: 3.5,
      passengerDialog: [
        "They finally greenlit the terraforming study—can’t miss the kickoff.",
        "Keep an eye out for cargo drones; they’ve been rerouted to street level.",
        "It’s hard to believe this whole district floated here last year.",
      ],
      timeLimit: 70,
    },
    {
      id: "mission-c3-orbital-lift",
      pickupPosition: [14, 0.1, -470],
      passengerPosition: [14, 0.1, -470],
      dropoffPosition: [52, 0.1, -522],
      dropoffHint: "the orbital lift staging area",
      reward: 700,
      pickupRadius: 3,
      dropoffRadius: 4.5,
      passengerDialog: [
        "My ticket to the orbital lift says boarding closes in eight minutes!",
        "If we cut through the freight tunnel, we’ll beat the traffic.",
        "You can see the whole coastline from the lift platform. Worth the rush.",
      ],
      timeLimit: 75,
    },
  ],
};
