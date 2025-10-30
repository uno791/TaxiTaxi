export type CityId = "city1" | "city2" | "city3";
export type CityStory = {
  title: string;
  lines: string[];
  continueLabel?: string;
};

export const CITY_SEQUENCE: CityId[] = ["city1", "city2", "city3"];

export const CITY_SPAWN_POINTS: Record<CityId, [number, number, number]> = {
  city1: [-30, 0.5, -25],
  city2: [102, 3, -150],
  city3: [60, 0.5, -448],
};

export const GAME_INTRO_STORY: CityStory = {
  title: "Prologue - Unpaid Fare",
  lines: [
    "I drove nights to keep Mara and Noah safe. One blink on the rain-slick highway and the guardrail swallowed the cab instead.",
    "Sirens pulled us apart. I woke to twisted steel and an empty back seat that still felt warm.",
    "Now the meter keeps running, dragging me through cities that shouldn't exist and passengers who know every secret I buried.",
    "Three nights. Three cities. If I finish the fares, maybe the road finally lets me rest.",
  ],
  continueLabel: "Drive into the night",
};

export const CITY_INTRO_DIALOGS: Record<CityId, CityStory> = {
  city1: {
    title: "Night 1 - City of Fog",
    lines: [
      "The city's quiet tonight. Feels heavier. The fog sits thicker than before, like it's waiting for something.",
      "My hands shake every time the meter dings. Three nights left on this shift. Or was it two?",
      "I can't remember the last time I slept... or the last time someone thanked me for the ride.",
    ],
    continueLabel: "Open the cab door",
  },
  city2: {
    title: "Night 2 - City of Static Lights",
    lines: [
      "New city. No lights. The buzz is gone now, like whispers under skin.",
      "The GPS swears I've been driving in circles for three hours. Maybe it's lying.",
      "Maybe I am.",
    ],
    continueLabel: "Pick up the next passenger",
  },
  city3: {
    title: "Night 3 - City of Echoes",
    lines: [
      "This isn't a city. It's a graveyard pretending to be one. Every light is an open eye staring back at me.",
      "I don't think I'm driving anymore. I think something's driving me.",
      "Ten fares tonight. Ten souls. Maybe if I finish this route, I'll finally wake up. Or finally rest.",
    ],
    continueLabel: "Face the final fares",
  },
};

export const CITY_STORY_DIALOGS: Record<CityId, CityStory> = {
  city1: {
    title: "Night 1 - Fog Settles",
    lines: [
      "They all knew me. Every single one.",
      "Maybe it's guilt making faces in the fog.",
      "Maybe I should just keep driving. The road's safer than stopping.",
    ],
    continueLabel: "Drive to City Two",
  },
  city2: {
    title: "Night 2 - Static Remains",
    lines: [
      "Can't feel my hands. The wheel's melting.",
      "The road's red now. I can hear breathing in the back seat even when it's empty.",
      "I think I've been driving forever.",
    ],
    continueLabel: "Depart for City Three",
  },
  city3: {
    title: "Night 3 - Paid in Full",
    lines: [
      "I see the turn now. The one I missed.",
      "Mara's hand on my shoulder. Noah's toy car in my lap. The meter flashes paid in full.",
      "The road ends in a blur of white light. I take my hands off the wheel. For the first time since the crash... I stop driving.",
    ],
    continueLabel: "Let the night fade",
  },
};
