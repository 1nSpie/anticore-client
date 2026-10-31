"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { Checkbox } from "@/shadcn/checkbox";
import { Input } from "@/shadcn/input";
import {
  fmtSize,
  openPdf,
  type RegArticleFull,
  type RegSearchHit,
  type RegSectionNode,
  type RegStatus,
} from "@/app/admin/_lib/regulationTypes";
import { Highlight } from "../../_lib/Highlight";
import { staffApi } from "../../_lib/staffSession";

function SectionBlock({ section, onOpen, depth = 0 }: { section: RegSectionNode; onOpen: (id: number) => void; depth?: number }) {
  return (
    <div className={depth ? "ml-3 border-l border-white/10 pl-3" : ""}>
      <p className="py-2 text-sm font-semibold text-slate-200">{section.title}</p>
      <ul className="space-y-1">
        {section.articles.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onOpen(a.id)}
              className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-white/5 px-3 text-left text-sm active:bg-white/10">
              <span>{a.title}</span>
              <span className="flex shrink-0 items-center gap-1 text-slate-500">
                {a.attachments > 0 && <FileText className="h-4 w-4" aria-label="Есть PDF" />}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {section.children?.map((c) => <SectionBlock key={c.id} section={c} onOpen={onOpen} depth={depth + 1} />)}
    </div>
  );
}

export default function StaffRegulationPage() {
  const [status, setStatus] = useState<RegStatus | null>(null);
  const [tree, setTree] = useState<RegSectionNode[] | null>(null);
  const [article, setArticle] = useState<RegArticleFull | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<RegSearchHit[] | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStatus = useCallback(async () => {
    setStatus((await staffApi.get<RegStatus>("/staff/regulation/status")).data);
  }, []);

  useEffect(() => {
    void Promise.all([
      loadStatus(),
      staffApi.get<RegSectionNode[]>("/staff/regulation").then((r) => setTree(r.data)),
    ]).catch(() => toast.error("Не удалось загрузить регламент"));
  }, [loadStatus]);

  // Поиск с задержкой: не дёргаем сервер на каждую букву
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setHits(null);
      return;
    }
    timer.current = setTimeout(() => {
      staffApi
        .get<RegSearchHit[]>("/staff/regulation/search", { params: { q: q.trim() } })
        .then((r) => setHits(r.data))
        .catch(() => toast.error("Поиск не удался"));
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  const open = async (id: number) => {
    try {
      setArticle((await staffApi.get<RegArticleFull>(`/staff/regulation/articles/${id}`)).data);
      window.scrollTo({ top: 0 });
    } catch {
      toast.error("Не удалось открыть статью");
    }
  };

  const openAttachment = (id: number) =>
    openPdf(async () => (await staffApi.get<Blob>(`/staff/regulation/attachments/${id}`, { responseType: "blob" })).data).catch(() =>
      toast.error("Не удалось открыть PDF"),
    );

  const acknowledge = async () => {
    if (!status) return;
    setBusy(true);
    try {
      await staffApi.post("/staff/regulation/ack", { version: status.version });
      toast.success("Спасибо, ознакомление зафиксировано");
      await loadStatus();
      window.location.replace("/admin/master");
    } catch {
      toast.error("Не удалось сохранить. Обновите страницу — возможно, регламент изменился");
      setBusy(false);
    }
  };

  if (article) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setArticle(null)} className="-ml-2 h-11 gap-1">
          <ArrowLeft className="h-4 w-4" />К оглавлению
        </Button>
        <p className="text-xs text-slate-500">{article.section.title}</p>
        <h1 className="text-xl font-semibold leading-snug"><Highlight text={article.title} q={q} /></h1>
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200"><Highlight text={article.body} q={q} /></div>
        {article.attachments.length > 0 && (
          <ul className="space-y-2">
            {article.attachments.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => openAttachment(a.id)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-left text-sm">
                  <FileText className="h-5 w-5 shrink-0 text-red-300" />
                  <span className="min-w-0 flex-1 truncate">{a.fileName}</span>
                  <span className="shrink-0 text-xs text-slate-500">{fmtSize(a.size)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Регламент</h1>

      {status?.ackRequired && (
        <section className="space-y-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <p className="font-medium text-amber-200">
            {status.ackedVersion === 0 ? "Ознакомьтесь с регламентом, чтобы приступить к работе" : "Регламент обновлён — подтвердите ознакомление"}
          </p>
          {status.changeNote && <p className="text-sm text-amber-100">Что изменилось: {status.changeNote}</p>}
          <p className="text-sm text-slate-300">Пока вы не подтвердите, остальные разделы кабинета закрыты.</p>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="h-5 w-5" />
            Согласен с условиями
          </label>
          <Button onClick={acknowledge} disabled={!agree || busy} className="h-12 w-full text-base">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Подтвердить"}
          </Button>
        </section>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по регламенту" className="h-12 pl-9 text-base" />
      </div>

      {hits ? (
        hits.length ? (
          <ul className="space-y-2">
            {hits.map((h) => (
              <li key={h.id}>
                <button type="button" onClick={() => open(h.id)} className="w-full rounded-xl bg-white/5 p-3 text-left active:bg-white/10">
                  <p className="text-xs text-slate-500">{h.sectionTitle}</p>
                  <p className="font-medium"><Highlight text={h.title} q={q} /></p>
                  {h.snippet && <p className="mt-1 text-sm text-slate-400"><Highlight text={h.snippet} q={q} /></p>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">Ничего не найдено</p>
        )
      ) : tree ? (
        tree.length ? (
          <div className="space-y-4">{tree.map((s) => <SectionBlock key={s.id} section={s} onOpen={open} />)}</div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">Регламент пока пуст</p>
        )
      ) : (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
      )}
    </div>
  );
}
