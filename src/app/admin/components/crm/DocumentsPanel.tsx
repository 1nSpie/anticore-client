"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { adminApi } from "../../_lib/api";
import { withQuery, useQueryParams } from "../../_lib/useQueryParams";
import {
  DOC_STATUS_LABEL,
  DOCUMENT_LABEL,
  type DocState,
  type DocStatus,
  type DocumentKind,
  type DocumentSnapshot,
  type DocumentsView,
  type DocVersionRow,
} from "../../_lib/documentTypes";
import { ANCHOR_ID } from "./AcceptanceForm";
import { downloadRendered, openRendered, renderDocument } from "./documentRender";

const badge: Record<DocStatus, string> = {
  NOT_FORMED: "border-white/20 bg-slate-800 text-slate-300",
  INSUFFICIENT_DATA: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  READY: "border-sky-400/40 bg-sky-500/15 text-sky-100",
  SIGNED: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  VOID: "border-white/15 bg-slate-800 text-slate-400",
};

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
    : "—";

/**
 * Куда вести по пункту «Не заполнено»: вкладка страницы записи и (для приёмки) поле, к которому прокрутить.
 * Всё, что исправляется в приёмке или карточке, — на вкладку «Приёмка»; цена и перечень — на «Работы»; сроки — на «Запись».
 */
function missingTarget(m: { code: string; field: string }): { tab: string; focus?: string } | null {
  if (m.code.startsWith("inspection") || m.code.startsWith("client.") || m.code.startsWith("vehicle")) {
    return { tab: "acceptance", focus: ANCHOR_ID[m.field] };
  }
  if (m.code.startsWith("execution.")) return { tab: "execution" };
  if (m.code.startsWith("handover.")) return { tab: "handover" };
  if (m.code === "visit.price" || m.code === "visit.service") return { tab: "works" };
  if (m.code.startsWith("visit.")) return { tab: "details" };
  return null;
}

function errorText(e: unknown): string {
  const data = (e as { response?: { data?: { message?: unknown } } })?.response?.data;
  const m = data?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m)) return m.join(", ");
  return "Не удалось выполнить действие";
}

type Props = {
  appointmentId: number;
};

/** Договор и акты записи — вкладка страницы записи (`?tab=documents`). */
export function DocumentsPanel({ appointmentId }: Props) {
  const { params, pathname } = useQueryParams();
  const base = `/crm/appointments/${appointmentId}/documents`;
  const [view, setView] = useState<DocumentsView | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [history, setHistory] = useState<Set<DocumentKind>>(new Set());
  const [signing, setSigning] = useState<{ kind: DocumentKind; version: DocVersionRow } | null>(null);
  const [scan, setScan] = useState<File | null>(null);
  const scanInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.get<DocumentsView>(base);
      setView(data);
    } catch (e) {
      toast.error(errorText(e));
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const fetchVersion = async (versionId: number) => {
    const { data } = await adminApi.get<{ version: number; snapshot: DocumentSnapshot }>(
      `${base}/versions/${versionId}`,
    );
    return data;
  };

  const preview = (kind: DocumentKind) =>
    run(`${kind}:preview`, async () => {
      const { data } = await adminApi.get<DocumentSnapshot>(`${base}/${kind}/draft`);
      if (data.missing.length > 0) {
        toast.warning(`Черновик: не заполнено ${data.missing.length}`);
      }
      openRendered(await renderDocument(data));
    });

  const form = (kind: DocumentKind, correction: boolean) =>
    run(`${kind}:form`, async () => {
      const { data } = await adminApi.post<DocumentsView>(`${base}/${kind}`, { correction });
      setView(data);
      const doc = data.documents.find((d) => d.kind === kind);
      const v = doc?.versions.find((x) => x.id === doc.currentVersionId);
      toast.success(`${DOCUMENT_LABEL[kind]} сформирован: № ${data.number}, версия ${v?.version ?? 1}`);
    });

  const download = (versionId: number, print: boolean, format: "pdf" | "docx" = "pdf") =>
    run(`v${versionId}`, async () => {
      const { version, snapshot } = await fetchVersion(versionId);
      const doc = await renderDocument(snapshot, version, format);
      if (print) openRendered(doc, true);
      else downloadRendered(doc);
    });

  const openSigned = (v: DocVersionRow) =>
    run(`v${v.id}`, async () => {
      if (v.scanUrl) {
        window.open(v.scanUrl, "_blank", "noopener");
        return;
      }
      const { version, snapshot } = await fetchVersion(v.id);
      openRendered(await renderDocument(snapshot, version));
    });

  const confirmSign = () =>
    run("sign", async () => {
      if (!signing) return;
      const fd = new FormData();
      if (scan) fd.append("file", scan);
      const { data } = await adminApi.post<DocumentsView>(
        `${base}/versions/${signing.version.id}/sign`,
        fd,
      );
      setView(data);
      setSigning(null);
      setScan(null);
      toast.success("Подписание отмечено. Версия больше не меняется");
    });

  const voidVersion = (v: DocVersionRow) => {
    const reason = window.prompt("Причина аннулирования версии (не короче 3 символов):");
    if (!reason) return;
    void run(`v${v.id}`, async () => {
      const { data } = await adminApi.post<DocumentsView>(`${base}/versions/${v.id}/void`, {
        reason,
      });
      setView(data);
      toast.success("Версия аннулирована");
    });
  };

  const toggleHistory = (kind: DocumentKind) =>
    setHistory((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  const card = (doc: DocState) => {
    const current = doc.versions.find((v) => v.id === doc.currentVersionId) ?? null;
    const disabled = busy !== null;
    return (
      <div key={doc.kind} className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-white">{doc.label}</p>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${badge[doc.status]}`}>
            {DOC_STATUS_LABEL[doc.status]}
          </span>
        </div>

        {current ? (
          <p className="text-xs text-slate-400">
            № {view?.number} · версия {current.version} · сформирован {fmt(current.formedAt)} ({current.formedBy})
            {current.status === "SIGNED" ? ` · подписан ${fmt(current.signedAt)} (${current.signedBy})` : ""}
          </p>
        ) : null}

        {doc.missing.length > 0 && doc.status !== "SIGNED" ? (
          <div className="space-y-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-2">
            <p className="text-xs font-medium text-amber-100">Не заполнено ({doc.missing.length}):</p>
            <ul className="flex flex-wrap gap-1.5">
              {doc.missing.map((m) => (
                <li key={m.code}>
                  {missingTarget(m) ? (
                    <Link
                      href={withQuery(pathname, params, { ...missingTarget(m), item: null })}
                      scroll={false}
                      className="rounded-md border border-amber-400/30 bg-slate-900/60 px-2 py-0.5 text-xs text-amber-100 hover:border-amber-300"
                    >
                      {m.label}
                    </Link>
                  ) : (
                    <span className="rounded-md border border-amber-400/20 px-2 py-0.5 text-xs text-amber-100/90">
                      {m.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={disabled || doc.missing.length > 0}
            title={doc.missing.length > 0 ? "Сначала заполните недостающее" : undefined}
            onClick={() => {
              if (current?.status === "SIGNED") {
                if (!confirm("Документ подписан и не меняется. Создать исправленную версию? Подписанная останется в истории.")) return;
                void form(doc.kind, true);
              } else {
                void form(doc.kind, false);
              }
            }}
          >
            {!current ? "Сформировать" : current.status === "SIGNED" ? "Исправленная версия" : "Сформировать заново"}
          </Button>
          {!current || current.status === "READY" ? (
            <Button size="sm" variant="secondary" disabled={disabled} onClick={() => void preview(doc.kind)}>
              Предпросмотр черновика
            </Button>
          ) : null}
          {current ? (
            <>
              <Button size="sm" variant="secondary" disabled={disabled} onClick={() => void download(current.id, false)}>
                Скачать PDF
              </Button>
              {doc.kind === "CONTRACT" ? (
                <Button size="sm" variant="secondary" disabled={disabled} onClick={() => void download(current.id, false, "docx")}>
                  Скачать DOCX
                </Button>
              ) : null}
              <Button size="sm" variant="secondary" disabled={disabled} onClick={() => void download(current.id, true)}>
                Распечатать
              </Button>
              {current.status === "READY" ? (
                <>
                  <Button size="sm" variant="secondary" disabled={disabled} onClick={() => setSigning({ kind: doc.kind, version: current })}>
                    Отметить подписание
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-300" disabled={disabled} onClick={() => voidVersion(current)}>
                    Аннулировать
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="secondary" disabled={disabled} onClick={() => void openSigned(current)}>
                  Открыть подписанную версию
                </Button>
              )}
            </>
          ) : null}
          {doc.versions.length > 0 ? (
            <Button size="sm" variant="ghost" onClick={() => toggleHistory(doc.kind)}>
              История версий ({doc.versions.length})
            </Button>
          ) : null}
        </div>

        {signing?.kind === doc.kind ? (
          <div className="space-y-2 rounded-lg border border-sky-400/30 bg-sky-500/10 p-3">
            <p className="text-sm font-medium text-white">
              Отметить подписание: версия {signing.version.version}
            </p>
            <p className="text-xs text-slate-300">
              Приложите скан или фото подписанного документа (рекомендуется). После отметки эта версия не
              меняется — исправить её можно только новой версией.
            </p>
            <input
              ref={scanInput}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="text-sm text-slate-300"
              onChange={(e) => setScan(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={busy !== null} onClick={() => void confirmSign()}>
                {scan ? "Подписан, сохранить скан" : "Подписан, без скана"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => (setSigning(null), setScan(null))}>
                Отмена
              </Button>
            </div>
          </div>
        ) : null}

        {history.has(doc.kind) ? (
          <ul className="space-y-1.5 border-t border-white/10 pt-2">
            {doc.versions.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <span>
                  Версия {v.version} · {DOC_STATUS_LABEL[v.status]} · {fmt(v.formedAt)} ({v.formedBy})
                  {v.status === "SIGNED" ? ` · подписан ${fmt(v.signedAt)}` : ""}
                  {v.status === "VOID" && v.voidReason ? ` · ${v.voidReason}` : ""}
                </span>
                <span className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2" disabled={disabled} onClick={() => void download(v.id, false)}>
                    PDF
                  </Button>
                  {doc.kind === "CONTRACT" ? (
                    <Button size="sm" variant="ghost" className="h-7 px-2" disabled={disabled} onClick={() => void download(v.id, false, "docx")}>
                      DOCX
                    </Button>
                  ) : null}
                  {v.scanUrl ? (
                    <Button asChild size="sm" variant="ghost" className="h-7 px-2">
                      <a href={v.scanUrl} target="_blank" rel="noopener noreferrer">
                        Скан
                      </a>
                    </Button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">
          Документы{view?.number ? ` · № ${view.number}` : ""}
        </h3>
        <Button size="sm" asChild>
          <Link href={withQuery(pathname, params, { tab: "acceptance", focus: null })} scroll={false}>
            Приёмка автомобиля
          </Link>
        </Button>
      </div>

      {!view ? <p className="text-sm text-slate-400">Загрузка…</p> : view.documents.map(card)}

      <p className="text-xs text-slate-500">
        Документы строятся по сохранённым данным записи. Версия фиксирует данные на момент формирования
        и после подписания не меняется.
      </p>
    </div>
  );
}
