export const CATEGORIES = [
  "Programming",
  "Information Technology",
  "AI",
  "UI/UX",
  "Design",
  "Agriculture",
  "Business",
  "Marketing",
  "Music",
  "Languages",
  "Academic",
  "Sports"
] as const;

export type Category = (typeof CATEGORIES)[number];
