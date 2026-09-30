const PALETTE = [
  { bg: "#183147", border: "#60a5fa", text: "#dbeafe" },
  { bg: "#15392f", border: "#34d399", text: "#d1fae5" },
  { bg: "#302744", border: "#a78bfa", text: "#ede9fe" },
  { bg: "#412832", border: "#fb7185", text: "#ffe4e6" },
  { bg: "#3d3221", border: "#fbbf24", text: "#fef3c7" },
  { bg: "#19383e", border: "#22d3ee", text: "#cffafe" },
  { bg: "#2a3444", border: "#94a3b8", text: "#e2e8f0" },
] as const;

export function getEventColor(key: number): (typeof PALETTE)[number] {
  const index = Math.abs(key) % PALETTE.length;
  return PALETTE[index]!;
}

/** Закрытая запись (работы выполнены) — приглушённая, чтобы не путать с активными. */
export const COMPLETED_EVENT_COLOR = {
  bg: "#334155",
  border: "#14b8a6",
  text: "#cbd5e1",
} as const;
