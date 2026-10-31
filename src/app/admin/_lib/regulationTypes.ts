export interface RegArticleLite {
  id: number;
  title: string;
  sortOrder: number;
  attachments: number;
}

export interface RegSectionNode {
  id: number;
  title: string;
  sortOrder: number;
  articles: RegArticleLite[];
  children?: RegSectionNode[];
}

export interface RegAttachmentMeta {
  id: number;
  fileName: string;
  size: number;
  createdAt: string;
}

export interface RegArticleFull {
  id: number;
  sectionId: number;
  title: string;
  body: string;
  sortOrder: number;
  updatedAt: string;
  section: { title: string };
  attachments: RegAttachmentMeta[];
}

export interface RegSearchHit {
  id: number;
  title: string;
  sectionTitle: string;
  snippet: string | null;
  inTitle: boolean;
}

export interface RegStatus {
  version: number;
  ackedVersion: number;
  ackRequired: boolean;
  changeNote: string | null;
  publishedAt: string | null;
}

export interface RegState {
  version: number;
  changeNote: string | null;
  publishedAt: string | null;
  dirty: boolean;
}

export const fmtSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} МБ` : `${Math.max(1, Math.round(bytes / 1024))} КБ`;

/** Открыть PDF с авторизацией: окно открываем сразу (иначе его блокирует браузер), содержимое подставляем после загрузки. */
export async function openPdf(fetchBlob: () => Promise<Blob>) {
  const win = window.open("", "_blank");
  try {
    const blob = await fetchBlob();
    const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    if (win) win.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  } catch (e) {
    win?.close();
    throw e;
  }
}
