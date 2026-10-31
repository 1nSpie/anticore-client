"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { FilePlus2, FileText, FolderPlus, Loader2, Megaphone, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { cn } from "src/lib/utils";
import { adminApi } from "../../_lib/api";
import {
  fmtSize,
  openPdf,
  type RegArticleFull,
  type RegSectionNode,
  type RegState,
} from "../../_lib/regulationTypes";

const errText = (e: unknown, fb: string) => {
  const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
  return Array.isArray(m) ? m.join("; ") : typeof m === "string" ? m : fb;
};

function ArticleEditor({ id, onChanged, onDeleted }: { id: number; onChanged: () => void; onDeleted: () => void }) {
  const [article, setArticle] = useState<RegArticleFull | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await adminApi.get<RegArticleFull>(`/crm/regulation/articles/${id}`);
    setArticle(data);
    setTitle(data.title);
    setBody(data.body);
  }, [id]);

  useEffect(() => {
    setArticle(null);
    load().catch(() => toast.error("Не удалось открыть статью"));
  }, [load]);

  if (!article) return <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />;

  const dirty = title !== article.title || body !== article.body;

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.patch(`/crm/regulation/articles/${id}`, { title, body });
      toast.success("Сохранено");
      await load();
      onChanged();
    } catch (e) {
      toast.error(errText(e, "Не удалось сохранить"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Удалить статью «${article.title}» вместе с вложениями?`)) return;
    try {
      await adminApi.delete(`/crm/regulation/articles/${id}`);
      toast.success("Статья удалена");
      onDeleted();
    } catch (e) {
      toast.error(errText(e, "Не удалось удалить"));
    }
  };

  const upload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      await adminApi.post(`/crm/regulation/articles/${id}/attachments`, form);
      toast.success("PDF загружен");
      await load();
      onChanged();
    } catch (e) {
      toast.error(errText(e, "Не удалось загрузить PDF"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAttachment = async (attId: number, name: string) => {
    if (!window.confirm(`Удалить файл «${name}»?`)) return;
    try {
      await adminApi.delete(`/crm/regulation/attachments/${attId}`);
      await load();
      onChanged();
    } catch (e) {
      toast.error(errText(e, "Не удалось удалить файл"));
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-slate-500">Раздел: {article.section.title}</p>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} aria-label="Заголовок" className="text-base font-medium" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} maxLength={100000} aria-label="Текст статьи"
        className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm leading-relaxed" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save} disabled={!dirty || saving || !title.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
        </Button>
        <Button size="sm" variant="outline" className="text-red-400" onClick={remove}><Trash2 className="h-4 w-4" />Удалить статью</Button>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <p className="text-sm font-medium">PDF-вложения</p>
        {article.attachments.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-lg bg-slate-900/60 px-3 py-2 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-red-300" />
            <button type="button" className="min-w-0 flex-1 truncate text-left hover:underline"
              onClick={() => openPdf(async () => (await adminApi.get<Blob>(`/crm/regulation/attachments/${a.id}`, { responseType: "blob" })).data)
                .catch(() => toast.error("Не удалось открыть PDF"))}>
              {a.fileName}
            </button>
            <span className="shrink-0 text-xs text-slate-500">{fmtSize(a.size)}</span>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" aria-label="Удалить файл" onClick={() => removeAttachment(a.id, a.fileName)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Загрузить PDF (до 10 МБ)
        </Button>
      </div>
    </div>
  );
}

function SectionItem({
  section,
  depth,
  activeId,
  onOpen,
  onChanged,
}: {
  section: RegSectionNode;
  depth: number;
  activeId: number | null;
  onOpen: (id: number) => void;
  onChanged: () => void;
}) {
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      onChanged();
    } catch (e) {
      toast.error(errText(e, "Не удалось выполнить действие"));
    }
  };
  const ask = (label: string, initial = "") => window.prompt(label, initial)?.trim() || null;

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-white/10 pl-3")}>
      <div className="flex items-center gap-1 py-1">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{section.title}</p>
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Переименовать"
          onClick={() => { const t = ask("Название", section.title); if (t) void run(() => adminApi.patch(`/crm/regulation/sections/${section.id}`, { title: t }), "Переименовано"); }}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {depth === 0 && (
          <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Добавить подраздел"
            onClick={() => { const t = ask("Название подраздела"); if (t) void run(() => adminApi.post("/crm/regulation/sections", { title: t, parentId: section.id }), "Подраздел создан"); }}>
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Добавить статью"
          onClick={() => { const t = ask("Заголовок статьи"); if (t) void run(() => adminApi.post("/crm/regulation/articles", { sectionId: section.id, title: t }).then((r) => onOpen(r.data.id)), "Статья создана"); }}>
          <FilePlus2 className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" aria-label="Удалить раздел"
          onClick={() => window.confirm(`Удалить раздел «${section.title}»?`) && void run(() => adminApi.delete(`/crm/regulation/sections/${section.id}`), "Раздел удалён")}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ul className="space-y-0.5">
        {section.articles.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onOpen(a.id)}
              className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/5",
                activeId === a.id && "bg-emerald-400/10 text-emerald-300")}>
              <span className="min-w-0 flex-1 truncate">{a.title}</span>
              {a.attachments > 0 && <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
            </button>
          </li>
        ))}
      </ul>
      {section.children?.map((c) => (
        <SectionItem key={c.id} section={c} depth={depth + 1} activeId={activeId} onOpen={onOpen} onChanged={onChanged} />
      ))}
    </div>
  );
}

export default function RegulationEditor() {
  const [tree, setTree] = useState<RegSectionNode[] | null>(null);
  const [state, setState] = useState<RegState | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([
        adminApi.get<RegSectionNode[]>("/crm/regulation"),
        adminApi.get<RegState>("/crm/regulation/state"),
      ]);
      setTree(t.data);
      setState(s.data);
    } catch {
      toast.error("Не удалось загрузить регламент");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const publish = async () => {
    const note = window.prompt(
      "Опубликовать регламент? Все мастера должны будут ознакомиться заново, пока не подтвердят — работа в кабинете заблокирована.\n\nЧто изменилось (увидят мастера):",
      "",
    );
    if (note === null) return;
    try {
      await adminApi.post("/crm/regulation/publish", { note: note.trim() || undefined });
      toast.success("Опубликовано. Мастерам нужно ознакомиться");
      await load();
    } catch (e) {
      toast.error(errText(e, "Не удалось опубликовать"));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm">
          <p>
            Версия регламента: <b>{state?.version ?? "—"}</b>
            {state?.publishedAt && <span className="text-slate-400"> · опубликована {new Date(state.publishedAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</span>}
          </p>
          <p className={state?.dirty ? "text-amber-300" : "text-slate-500"}>
            {state?.dirty ? "Есть неопубликованные правки: мастера видят их, но ознакомление пока не требуется" : "Все правки опубликованы"}
          </p>
        </div>
        <Button onClick={publish} disabled={!state?.dirty && (state?.version ?? 0) > 0}>
          <Megaphone className="h-4 w-4" />Опубликовать и запросить ознакомление
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <Button size="sm" variant="outline" onClick={() => {
            const t = window.prompt("Название раздела")?.trim();
            if (t) void adminApi.post("/crm/regulation/sections", { title: t }).then(load).catch((e) => toast.error(errText(e, "Не удалось создать раздел")));
          }}>
            <Plus className="h-4 w-4" />Раздел
          </Button>
          {!tree ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          ) : tree.length ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              {tree.map((s) => (
                <SectionItem key={s.id} section={s} depth={0} activeId={activeId} onOpen={setActiveId} onChanged={load} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Регламент пуст. Создайте первый раздел.</p>
          )}
        </div>

        <div>
          {activeId ? (
            <ArticleEditor key={activeId} id={activeId} onChanged={load} onDeleted={() => { setActiveId(null); void load(); }} />
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
              Выберите статью слева или создайте новую значком «+» у раздела
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
