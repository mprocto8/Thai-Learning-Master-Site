/**
 * Learning pathways — one guided pathway per pattern topic.
 * Progress stays keyed to topic IDs in State.topicStats.
 */
const PATHWAYS = [
  {
    id: "pronoun-name",
    tier: 1,
    tierLabel: "Tier 1 · Foundational",
    label: "Introduce Yourself",
    emoji: "🪪",
    description: "Say your name naturally with Thai pronouns.",
    estimatedDays: 1,
    topics: ["pronoun-name"],
    badge: { emoji: "🪪", label: "Self Introduction" }
  },
  {
    id: "simple-statement",
    tier: 1,
    tierLabel: "Tier 1 · Foundational",
    label: "Make Basic Statements",
    emoji: "📋",
    description: "Describe people, places, and things without a Thai verb for 'is'.",
    estimatedDays: 1,
    topics: ["simple-statement"],
    badge: { emoji: "📋", label: "Statement Builder" }
  },
  {
    id: "negation",
    tier: 1,
    tierLabel: "Tier 1 · Foundational",
    label: "Use Negation",
    emoji: "🚫",
    description: "Put ไม่ before verbs and adjectives to say what is not true.",
    estimatedDays: 1,
    topics: ["negation"],
    badge: { emoji: "🚫", label: "Negation Basics" }
  },
  {
    id: "yes-no-question",
    tier: 1,
    tierLabel: "Tier 1 · Foundational",
    label: "Ask Yes/No Questions",
    emoji: "❓",
    description: "Add ไหม at the end to turn statements into questions.",
    estimatedDays: 1,
    topics: ["yes-no-question"],
    badge: { emoji: "❓", label: "Question Starter" }
  },
  {
    id: "question-word-end",
    tier: 1,
    tierLabel: "Tier 1 · Foundational",
    label: "Place Question Words",
    emoji: "🔚",
    description: "Use Thai question words at the end of sentences.",
    estimatedDays: 1,
    topics: ["question-word-end"],
    badge: { emoji: "🔚", label: "Question Word Placement" }
  },
  {
    id: "ask-location",
    tier: 2,
    tierLabel: "Tier 2 · Survival",
    label: "Ask Where Things Are",
    emoji: "📍",
    description: "Ask for the location of places and everyday objects.",
    estimatedDays: 1,
    topics: ["ask-location"],
    badge: { emoji: "📍", label: "Location Finder" }
  },
  {
    id: "ask-for",
    tier: 2,
    tierLabel: "Tier 2 · Survival",
    label: "Ask For Things Politely",
    emoji: "🙏",
    description: "Request food, water, bags, bills, and help with ขอ.",
    estimatedDays: 1,
    topics: ["ask-for"],
    badge: { emoji: "🙏", label: "Polite Requester" }
  },
  {
    id: "can-you",
    tier: 2,
    tierLabel: "Tier 2 · Survival",
    label: "Ask 'Can You?'",
    emoji: "🤲",
    description: "Ask whether someone can do something for you.",
    estimatedDays: 1,
    topics: ["can-you"],
    badge: { emoji: "🤲", label: "Can You?" }
  },
  {
    id: "how-much",
    tier: 2,
    tierLabel: "Tier 2 · Survival",
    label: "Ask Prices",
    emoji: "💰",
    description: "Ask how much something costs or how much there is.",
    estimatedDays: 1,
    topics: ["how-much"],
    badge: { emoji: "💰", label: "Price Checker" }
  },
  {
    id: "want-to",
    tier: 2,
    tierLabel: "Tier 2 · Survival",
    label: "Express Wants",
    emoji: "🙋",
    description: "Say what you want to do with อยาก.",
    estimatedDays: 1,
    topics: ["want-to"],
    badge: { emoji: "🙋", label: "Wants" }
  },
  {
    id: "need",
    tier: 2,
    tierLabel: "Tier 2 · Survival",
    label: "Express Needs",
    emoji: "🆘",
    description: "Say what you need in practical situations.",
    estimatedDays: 1,
    topics: ["need"],
    badge: { emoji: "🆘", label: "Needs" }
  },
  {
    id: "like",
    tier: 3,
    tierLabel: "Tier 3 · Daily interaction",
    label: "Express Likes",
    emoji: "💚",
    description: "Talk about what you like with nouns and verbs.",
    estimatedDays: 1,
    topics: ["like"],
    badge: { emoji: "💚", label: "Likes" }
  },
  {
    id: "have",
    tier: 3,
    tierLabel: "Tier 3 · Daily interaction",
    label: "Talk About Possessions",
    emoji: "📦",
    description: "Use มี for possessions, availability, and abstract things.",
    estimatedDays: 1,
    topics: ["have"],
    badge: { emoji: "📦", label: "Have" }
  },
  {
    id: "go-to",
    tier: 3,
    tierLabel: "Tier 3 · Daily interaction",
    label: "Talk About Destinations",
    emoji: "🚶",
    description: "Say where you are going and what you are going to do.",
    estimatedDays: 1,
    topics: ["go-to"],
    badge: { emoji: "🚶", label: "Going Places" }
  },
  {
    id: "eat-drink",
    tier: 3,
    tierLabel: "Tier 3 · Daily interaction",
    label: "Order Food And Drink",
    emoji: "🍴",
    description: "Use กิน and ดื่ม for meals, drinks, and everyday ordering.",
    estimatedDays: 1,
    topics: ["eat-drink"],
    badge: { emoji: "🍴", label: "Eat And Drink" }
  },
  {
    id: "comparative",
    tier: 3,
    tierLabel: "Tier 3 · Daily interaction",
    label: "Compare Things",
    emoji: "⚖️",
    description: "Use กว่า to compare prices, distance, taste, and difficulty.",
    estimatedDays: 1,
    topics: ["comparative"],
    badge: { emoji: "⚖️", label: "Comparer" }
  },
  {
    id: "time-marker",
    tier: 3,
    tierLabel: "Tier 3 · Daily interaction",
    label: "Use Time Markers",
    emoji: "🕐",
    description: "Put today, tomorrow, and time phrases at the start.",
    estimatedDays: 1,
    topics: ["time-marker"],
    badge: { emoji: "🕐", label: "Time Marker" }
  },
  {
    id: "soften",
    tier: 4,
    tierLabel: "Tier 4 · Refinement",
    label: "Sound Polite",
    emoji: "🌸",
    description: "Soften requests and commands with หน่อย.",
    estimatedDays: 1,
    topics: ["soften"],
    badge: { emoji: "🌸", label: "Softener" }
  },
  {
    id: "already-done",
    tier: 4,
    tierLabel: "Tier 4 · Refinement",
    label: "Mark Completed Actions",
    emoji: "✅",
    description: "Use แล้ว for actions that are already done.",
    estimatedDays: 1,
    topics: ["already-done"],
    badge: { emoji: "✅", label: "Already Done" }
  },
  {
    id: "not-yet",
    tier: 4,
    tierLabel: "Tier 4 · Refinement",
    label: "Mark Unfinished Actions",
    emoji: "⏳",
    description: "Use ยังไม่ for things that have not happened yet.",
    estimatedDays: 1,
    topics: ["not-yet"],
    badge: { emoji: "⏳", label: "Not Yet" }
  },
  {
    id: "future",
    tier: 4,
    tierLabel: "Tier 4 · Refinement",
    label: "Use Future Tense",
    emoji: "🔮",
    description: "Signal future action with จะ.",
    estimatedDays: 1,
    topics: ["future"],
    badge: { emoji: "🔮", label: "Future" }
  },
  {
    id: "with-someone",
    tier: 4,
    tierLabel: "Tier 4 · Refinement",
    label: "Talk About Company",
    emoji: "👥",
    description: "Use กับ to say who you are with.",
    estimatedDays: 1,
    topics: ["with-someone"],
    badge: { emoji: "👥", label: "Together" }
  },
  {
    id: "tag-question",
    tier: 5,
    tierLabel: "Tier 5 · Natural Thai",
    label: "Ask For Confirmation",
    emoji: "🤔",
    description: "Use ใช่ไหม to ask 'right?' and invite confirmation.",
    estimatedDays: 1,
    topics: ["tag-question"],
    badge: { emoji: "🤔", label: "Confirmation" }
  },
  {
    id: "very-too",
    tier: 5,
    tierLabel: "Tier 5 · Natural Thai",
    label: "Use Intensifiers",
    emoji: "💥",
    description: "Distinguish very from too with มาก and เกินไป.",
    estimatedDays: 1,
    topics: ["very-too"],
    badge: { emoji: "💥", label: "Intensity" }
  },
  {
    id: "polite-request",
    tier: 5,
    tierLabel: "Tier 5 · Natural Thai",
    label: "Make Polite Requests",
    emoji: "🙇",
    description: "Ask for favors with ช่วย...ให้หน่อย.",
    estimatedDays: 1,
    topics: ["polite-request"],
    badge: { emoji: "🙇", label: "Polite Favors" }
  }
];
