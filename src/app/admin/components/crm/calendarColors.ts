const PALETTE = [
  { bg: "#1a73e8", border: "#1557b0", text: "#ffffff" },
  { bg: "#188038", border: "#137333", text: "#ffffff" },
  { bg: "#9334e6", border: "#7627bb", text: "#ffffff" },
  { bg: "#d93025", border: "#b31412", text: "#ffffff" },
  { bg: "#e37400", border: "#c26400", text: "#ffffff" },
  { bg: "#007b83", border: "#00666d", text: "#ffffff" },
  { bg: "#5f6368", border: "#4a4d51", text: "#ffffff" },
] as const;

export function getEventColor(key: number): (typeof PALETTE)[number] {
  const index = Math.abs(key) % PALETTE.length;
  return PALETTE[index]!;
}
