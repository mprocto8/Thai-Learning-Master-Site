/**
 * Learning pathways — guided topic sequences with milestones and badges.
 */
const PATHWAYS = [
  {
    id: "survival",
    label: "Bangkok Survival",
    emoji: "🏙️",
    description: "Everything you need for your first week in Bangkok — food, transport, numbers, basic conversation.",
    estimatedDays: 7,
    topics: ["greetings-phrases", "pronouns-questions", "numbers-extended", "getting-around", "ordering-food", "shopping-money"],
    milestone: {
      label: "Order a meal, take a taxi, and buy something — all in Thai",
      challenge: "sentence-builder"
    },
    badge: { emoji: "🏙️", label: "Bangkok Survivor" }
  },
  {
    id: "conversational",
    label: "Real Conversations",
    emoji: "💬",
    description: "Hold a real back-and-forth conversation. Ask questions, understand answers, express how you feel.",
    estimatedDays: 21,
    topics: ["pronouns-questions", "connectors-particles", "greetings-phrases", "feelings", "essential-verbs", "adjectives"],
    milestone: {
      label: "Introduce yourself, ask someone about their day, and respond to their answer",
      challenge: "sentence-builder"
    },
    badge: { emoji: "💬", label: "Conversationalist" }
  },
  {
    id: "food-master",
    label: "Food & Market Master",
    emoji: "🍜",
    description: "Navigate any restaurant, market, or 7-Eleven. Know your ingredients, negotiate prices, order like a local.",
    estimatedDays: 14,
    topics: ["food-eating", "ordering-food", "ingredients", "fruits", "meats-proteins", "kitchenware", "shopping-money", "seven-eleven"],
    milestone: {
      label: "Order a full meal with modifications, ask the price, and pay",
      challenge: "sentence-builder"
    },
    badge: { emoji: "🍜", label: "Food Explorer" }
  },
  {
    id: "time-master",
    label: "Time & Calendar",
    emoji: "🕐",
    description: "Tell the time, discuss dates, make plans. Master both formal 24-hour and colloquial Thai time.",
    estimatedDays: 10,
    topics: ["time-of-day", "days", "time-expressions", "months-1-6", "months-7-12", "numbers-extended"],
    milestone: {
      label: "Tell someone what time it is, what day today is, and make a plan for next week",
      challenge: "time-game"
    },
    badge: { emoji: "🕐", label: "Timekeeper" }
  },
  {
    id: "script-reader",
    label: "Read Thai Script",
    emoji: "ก",
    description: "Learn all Thai consonants, vowels, and tone marks. Start sounding out real Thai words.",
    estimatedDays: 30,
    topics: [],
    usesAlphabet: true,
    milestone: {
      label: "Sound out 20 Thai words from script without hints",
      challenge: "alphabet-quiz"
    },
    badge: { emoji: "ก", label: "Script Reader" }
  }
];
