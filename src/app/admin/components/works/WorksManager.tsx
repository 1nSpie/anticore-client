"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/card";
import { toast } from "sonner";
import { adminApi } from "../../_lib/api";
import { Plus, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { Work } from "../../_lib/types";

export default function WorksManager() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get("/works?published=false");
      setWorks(response.data);
    } catch (error) {
      toast.error("Ошибка загрузки работ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить эту работу?")) return;
    try {
      await adminApi.delete(`/works/${id}`);
      toast.success("Работа удалена");
      loadWorks();
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  return (
    <Card className="bg-slate-900/60 border border-white/10 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <CardTitle className="text-slate-50">Управление примерами работ</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                {works.length} {works.length === 1 ? "работа" : "работ"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить работу
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-slate-400">Загрузка...</p>
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Нет работ. Создайте первую!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {works.map((work) => (
              <div
                key={work.id}
                className="border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-slate-800/50 transition-all duration-200 group"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-50 mb-1 group-hover:text-emerald-300 transition-colors">
                    {work.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {work.carBrand} {work.carModel}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWork(work)}
                    className="border-white/20 text-slate-300 hover:bg-white/5 hover:text-emerald-300 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(work.id)}
                    className="border-white/20 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
