export const flagshipRelease = "Flagship Model Lab";
export const flagshipSources = {
  astra: "https://developers.openai.com/api/docs/models/gpt-6-astra",
  fable: "https://platform.claude.com/docs/en/models/fable-5-2/overview",
  fableLaunch: "https://www.anthropic.com/claude-fable-and-mythos-5-2",
  argonApp: "https://blog.google/innovation-and-ai/products/gemini-app/gemini-4-argon-availability/",
  argonApi: "https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-4-argon/",
  carbon: "https://blog.google/innovation-and-ai/technology/ai/google-ai-updates-october-2026/",
} as const;
export const claudeFable = {
  name: "Claude Fable 5.2",
  shortName: "Fable 5.2",
  id: "claude-fable-5-2",
  source: flagshipSources.fable,
  price: "$8 input / $40 output per million tokens",
} as const;
