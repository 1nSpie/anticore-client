"use client";

import { useState } from "react";
import { adminApi } from "../../_lib/api";
import { Button } from "@/shadcn/button";
import { Label } from "@/shadcn/label";
import { Textarea } from "@/shadcn/textarea";
import { Checkbox } from "@/shadcn/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";
import { toast } from "sonner";
import { Loader2, Megaphone } from "lucide-react";
import type { BroadcastResult } from "../../_lib/cabinetTypes";

type Props = {
  searchQuery: string;
  selectedIds: number[];
  onClearSelection: () => void;
};

export default function CabinetBroadcastPanel({
  searchQuery,
  selectedIds,
  onClearSelection,
}: Props) {
  const [message, setMessage] = useState("");
  const [respectOptOut, setRespectOptOut] = useState(true);
  const [onlyActive, setOnlyActive] = useState(true);
  const [sending, setSending] = useState(false);

  const send = async (mode: "selected" | "filtered") => {
    const text = message.trim();
    if (!text) {
      toast.error("Введите текст сообщения");
      return;
    }
    if (mode === "selected" && selectedIds.length === 0) {
      toast.error("Выберите получателей в таблице");
      return;
    }

    setSending(true);
    try {
      const { data } = await adminApi.post<BroadcastResult>(
        "/admin/users/broadcast",
        {
          message: text,
          userIds: mode === "selected" ? selectedIds : undefined,
          q: mode === "filtered" && searchQuery.trim() ? searchQuery : undefined,
          respectSmsOptOut: respectOptOut,
          onlyActive,
        },
      );
      const parts = [
        `отправлено: ${data.sent}`,
        data.skippedOptOut ? `пропущено (SMS выкл.): ${data.skippedOptOut}` : null,
        data.failed ? `ошибок: ${data.failed}` : null,
      ].filter(Boolean);
      toast.success(`Рассылка завершена (${parts.join(", ")})`);
      if (data.errors.length) {
        toast.error(data.errors.slice(0, 3).join("; "));
      }
      if (mode === "selected") onClearSelection();
    } catch {
      toast.error("Не удалось выполнить рассылку");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-slate-950/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-emerald-400" />
          Массовая SMS-рассылка
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Текст сообщения</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Текст SMS для клиентов личного кабинета"
            maxLength={500}
            rows={3}
            className="bg-slate-900 border-white/10 text-slate-100 resize-y"
          />
          <p className="text-xs text-slate-500">{message.length}/500</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={respectOptOut}
              onCheckedChange={(v) => setRespectOptOut(v === true)}
              className="border-white/20 data-[state=checked]:bg-emerald-600"
            />
            <span className="text-slate-300">Не отправлять с отключёнными SMS</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={onlyActive}
              onCheckedChange={(v) => setOnlyActive(v === true)}
              className="border-white/20 data-[state=checked]:bg-emerald-600"
            />
            <span className="text-slate-300">Только активные (не заблокированные)</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={sending || selectedIds.length === 0}
            onClick={() => void send("selected")}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Выбранным ({selectedIds.length})
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={sending}
            onClick={() => void send("filtered")}
          >
            {searchQuery.trim()
              ? "По текущему поиску"
              : "Всем активным клиентам"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
