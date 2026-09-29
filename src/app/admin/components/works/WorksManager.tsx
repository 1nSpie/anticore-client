"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/card";
import { toast } from "sonner";
import { adminApi } from "../../_lib/api";
import { Work } from "../../_lib/types";
import ImageUpload, { apiError } from "../media/ImageUpload";

type GalleryImage = { url: string; alt?: string; order?: number };
type WorkDetails = Work & { images: GalleryImage[]; services: { name: string }[] };
type WorkForm = Omit<Work, "id"> & { images: GalleryImage[]; servicesText: string };
const emptyForm = (): WorkForm => ({
  title: "", description: "", slug: "", beforeImage: "", afterImage: "", duration: "",
  year: String(new Date().getFullYear()), carBrand: "", carModel: "", categoryId: 0,
  featured: false, published: false, images: [], servicesText: "",
});
const inputClass = "bg-slate-800 border-white/10 text-slate-50";

export default function WorksManager() {
  const [works, setWorks] = useState<WorkDetails[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<WorkForm | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [worksResponse, categoriesResponse] = await Promise.all([
        adminApi.get<WorkDetails[]>("/works/admin/all"), adminApi.get("/works/categories/all"),
      ]);
      setWorks(worksResponse.data); setCategories(categoriesResponse.data);
    } catch (error) { toast.error(apiError(error, "Ошибка загрузки работ")); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function edit(work: WorkDetails) {
    setEditingId(work.id);
    setForm({ title: work.title, description: work.description, slug: work.slug,
      beforeImage: work.beforeImage ?? "", afterImage: work.afterImage ?? "",
      duration: work.duration, year: work.year, carBrand: work.carBrand, carModel: work.carModel,
      categoryId: work.categoryId, featured: work.featured, published: work.published,
      images: work.images.map(image => ({ url: image.url, alt: image.alt ?? "", order: image.order })),
      servicesText: work.services.map(service => service.name).join("\n"),
    });
  }
  function field<K extends keyof WorkForm>(key: K, value: WorkForm[K]) {
    setForm(previous => previous ? { ...previous, [key]: value } : previous);
  }
  function gallery(index: number, changes: Partial<GalleryImage>) {
    setForm(previous => previous ? { ...previous, images: previous.images.map((image, i) => i === index ? { ...image, ...changes } : image) } : previous);
  }
  function move(index: number, direction: number) {
    if (!form) return;
    const images = [...form.images];
    [images[index], images[index + direction]] = [images[index + direction], images[index]];
    field("images", images);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form || saving || uploading) return;
    if (!form.categoryId) { toast.error("Выберите категорию"); return; }
    if (form.published && (!form.beforeImage || !form.afterImage)) { toast.error("Для публикации добавьте фото до и после обработки"); return; }
    if (!form.images.some(image => image.url)) { toast.error("Добавьте хотя бы одну фотографию в галерею"); return; }
    setSaving(true);
    const { servicesText, ...data } = form;
    const payload = { ...data, services: servicesText.split("\n").map(s => s.trim()).filter(Boolean),
      images: data.images.filter(image => image.url).map((image, order) => ({ ...image, order })),
    };
    try {
      if (editingId !== null) await adminApi.patch(`/works/${editingId}`, payload);
      else await adminApi.post("/works", payload);
      toast.success("Работа сохранена"); setForm(null); await load();
    } catch (error) { toast.error(apiError(error, "Не удалось сохранить работу")); }
    finally { setSaving(false); }
  }
  async function remove(id: number) {
    if (!confirm("Удалить работу с сайта?")) return;
    setDeletingId(id);
    try { await adminApi.delete(`/works/${id}`); toast.success("Работа удалена"); await load(); }
    catch (error) { toast.error(apiError(error, "Ошибка удаления")); }
    finally { setDeletingId(null); }
  }

  return <>
    <Card className="bg-slate-900/60 border-white/10 text-slate-50">
      <CardHeader className="flex flex-row justify-between items-center gap-3">
        <CardTitle>Примеры работ</CardTitle>
        <Button onClick={() => { setEditingId(null); setForm(emptyForm()); }}>Добавить работу</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p role="status">Загрузка…</p> : works.length === 0 ? <p>Пока нет работ. Добавьте первую.</p> : works.map(work =>
          <div key={work.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-4">
            <div><h3 className="font-semibold">{work.title}</h3><p className="text-sm text-slate-400">{work.carBrand} {work.carModel} · {work.published ? "Опубликовано" : "Черновик"}</p></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => edit(work)}>Редактировать</Button>
              <Button variant="outline" disabled={deletingId !== null} onClick={() => void remove(work.id)}>Удалить</Button></div>
          </div>)}
      </CardContent>
    </Card>
    {form && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="work-form-title" className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-50">
        <h2 id="work-form-title" className="mb-5 text-xl font-bold">{editingId !== null ? "Редактировать работу" : "Новая работа"}</h2>
        <form onSubmit={save}>
          <fieldset disabled={saving || uploading} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["title", "Название"], ["slug", "Адрес страницы (латиница и дефисы)"],
                ["carBrand", "Марка автомобиля"], ["carModel", "Модель"],
                ["year", "Год автомобиля"], ["duration", "Срок выполнения"],
              ] as const).map(([key, label]) => <label key={key} className="space-y-1 text-sm">{label} *
                <Input className={inputClass} required value={form[key]} pattern={key === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined}
                  placeholder={key === "slug" ? "honda-crv-antikor" : key === "duration" ? "2 дня" : ""}
                  onChange={event => field(key, event.target.value)} /></label>)}
              <label className="space-y-1 text-sm">Категория *
                <select className={`${inputClass} block w-full rounded-md border p-2`} required value={form.categoryId || ""} onChange={event => field("categoryId", Number(event.target.value))}>
                  <option value="">Выберите категорию</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
            </div>
            <label className="block space-y-1 text-sm">Описание *<Textarea className={inputClass} required rows={4} value={form.description} onChange={event => field("description", event.target.value)} /></label>
            <label className="block space-y-1 text-sm">Выполненные услуги — по одной на строку<Textarea className={inputClass} rows={3} value={form.servicesText} onChange={event => field("servicesText", event.target.value)} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload label="До обработки" folder="works" value={form.beforeImage ?? ""} onChange={value => field("beforeImage", value)} onBusyChange={setUploading} />
              <ImageUpload label="После обработки" folder="works" value={form.afterImage ?? ""} onChange={value => field("afterImage", value)} onBusyChange={setUploading} />
            </div>
            <section className="space-y-3"><h3 className="font-semibold">Галерея фотографий</h3>
              {form.images.map((image, index) => <div key={index} className="space-y-2 rounded-xl border border-white/10 p-3">
                <ImageUpload label={`Фото ${index + 1}`} folder="works" value={image.url} onChange={url => gallery(index, { url })} onBusyChange={setUploading} />
                <label className="block text-sm">Описание фотографии<Input className={inputClass} value={image.alt ?? ""} onChange={event => gallery(index, { alt: event.target.value })} /></label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={index === 0} onClick={() => move(index, -1)}>Выше</Button>
                  <Button type="button" variant="outline" disabled={index === form.images.length - 1} onClick={() => move(index, 1)}>Ниже</Button>
                  <Button type="button" variant="outline" onClick={() => field("images", form.images.filter((_, i) => i !== index))}>Убрать из галереи</Button>
                </div>
              </div>)}
              <Button type="button" variant="outline" disabled={form.images.length >= 20} onClick={() => field("images", [...form.images, { url: "", alt: "" }])}>Добавить фото в галерею</Button>
              <p className="text-xs text-slate-400">До 20 фотографий.</p>
            </section>
            <div className="flex gap-5">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={event => field("published", event.target.checked)} />Опубликовать</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={event => field("featured", event.target.checked)} />Избранное</label>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setForm(null)}>Отмена</Button><Button type="submit">{saving ? "Сохранение…" : "Сохранить работу"}</Button></div>
          </fieldset>
        </form>
      </div>
    </div>}
  </>;
}
