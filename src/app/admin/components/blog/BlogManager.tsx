"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/card";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { Label } from "@/shadcn/label";
import { Switch } from "@/shadcn/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";
import { toast } from "sonner";
import { adminApi } from "../../_lib/api";
import { API_BASE_URL } from "../../_lib/constants";
import {
  Plus,
  Edit,
  Trash2,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
} from "lucide-react";
import {
  BlogPost,
  BlogPostFormData,
  BlogCategory,
  ContentBlock,
} from "../../_lib/types";

const emptyFormData: BlogPostFormData = {
  title: "",
  excerpt: "",
  content: [{ subtitle: "", text: "" }],
  slug: "",
  readTime: "5 мин",
  categoryId: 0,
  image: "",
  author: "Эксперт Anticore",
  published: true,
  featured: false,
  tags: [],
};

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogPostFormData>(emptyFormData);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`${API_BASE_URL}/blog/posts`);
      setPosts(response.data.posts || response.data);
    } catch (error) {
      toast.error("Ошибка загрузки постов");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminApi.get(`${API_BASE_URL}/blog/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Ошибка загрузки категорий", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот пост?")) return;
    try {
      await adminApi.delete(`${API_BASE_URL}/blog/posts/${id}`);
      toast.success("Пост удален");
      loadPosts();
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content || [{ subtitle: "", text: "" }],
      slug: post.slug,
      readTime: post.readTime,
      categoryId: post.categoryId,
      image: post.image || "",
      author: post.author,
      published: post.published,
      featured: post.featured,
      tags: post.tags || [],
    });
    setTagsInput((post.tags || []).join(", "));
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData(emptyFormData);
    setTagsInput("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.excerpt || !formData.categoryId) {
      toast.error("Заполните обязательные поля");
      return;
    }

    const filteredContent = formData.content.filter(
      (block) => block.text.trim() !== ""
    );

    if (filteredContent.length === 0) {
      toast.error("Добавьте хотя бы один блок контента");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        content: filteredContent,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };

      if (editingPost) {
        await adminApi.patch(
          `${API_BASE_URL}/blog/posts/${editingPost.id}`,
          payload
        );
        toast.success("Пост обновлен");
      } else {
        await adminApi.post(`${API_BASE_URL}/blog/posts`, payload);
        toast.success("Пост создан");
      }

      setIsFormOpen(false);
      loadPosts();
    } catch (error) {
      toast.error("Ошибка сохранения");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          а: "a",
          б: "b",
          в: "v",
          г: "g",
          д: "d",
          е: "e",
          ё: "yo",
          ж: "zh",
          з: "z",
          и: "i",
          й: "y",
          к: "k",
          л: "l",
          м: "m",
          н: "n",
          о: "o",
          п: "p",
          р: "r",
          с: "s",
          т: "t",
          у: "u",
          ф: "f",
          х: "h",
          ц: "ts",
          ч: "ch",
          ш: "sh",
          щ: "sch",
          ъ: "",
          ы: "y",
          ь: "",
          э: "e",
          ю: "yu",
          я: "ya",
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const addContentBlock = () => {
    setFormData({
      ...formData,
      content: [...formData.content, { subtitle: "", text: "" }],
    });
  };

  const removeContentBlock = (index: number) => {
    if (formData.content.length <= 1) {
      toast.error("Нужен хотя бы один блок контента");
      return;
    }
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData({ ...formData, content: newContent });
  };

  const updateContentBlock = (
    index: number,
    field: "subtitle" | "text",
    value: string
  ) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData({ ...formData, content: newContent });
  };

  const moveContentBlock = (index: number, direction: "up" | "down") => {
    const newContent = [...formData.content];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newContent.length) return;
    [newContent[index], newContent[newIndex]] = [
      newContent[newIndex],
      newContent[index],
    ];
    setFormData({ ...formData, content: newContent });
  };

  return (
    <>
      <Card className="bg-slate-900/60 border border-white/10 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <CardTitle className="text-slate-50">Управление блогом</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {posts.length} {posts.length === 1 ? "пост" : "постов"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить пост
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-400">Загрузка...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Нет постов. Создайте первый!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-50 group-hover:text-emerald-300 transition-colors">
                        {post.title}
                      </h3>
                      {post.featured && (
                        <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                          Избранное
                        </span>
                      )}
                      {!post.published && (
                        <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-600/30">
                          Черновик
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{post.category?.name}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="border-white/20 text-slate-300 hover:bg-white/5 hover:text-emerald-300 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
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

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-50">
                {editingPost ? "Редактировать пост" : "Новый пост"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto flex-1"
            >
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Заголовок *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Заголовок статьи"
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="excerpt" className="text-slate-300">
                    Краткое описание *
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Краткое описание для превью"
                    rows={2}
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-slate-300">
                    Категория *
                  </Label>
                  <Select
                    value={formData.categoryId.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        categoryId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-slate-50 mt-1">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id.toString()}
                          className="text-slate-50"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="readTime" className="text-slate-300">
                    Время чтения
                  </Label>
                  <Input
                    id="readTime"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: e.target.value })
                    }
                    placeholder="5 мин"
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-slate-300">
                    URL (slug)
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="url-statyi"
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="text-slate-300">
                    Изображение (путь)
                  </Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="blog/image.jpg"
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="author" className="text-slate-300">
                    Автор
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Имя автора"
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="text-slate-300">
                    Теги (через запятую)
                  </Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="антикоррозия, защита, советы"
                    className="bg-slate-800/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                  />
                </div>

                <div className="flex items-center space-x-4 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, published: checked })
                      }
                    />
                    <Label htmlFor="published" className="text-slate-300">
                      Опубликовано
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, featured: checked })
                      }
                    />
                    <Label htmlFor="featured" className="text-slate-300">
                      Избранное
                    </Label>
                  </div>
                </div>
              </div>

              {/* Content Blocks */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold text-slate-50">
                    Контент статьи
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContentBlock}
                    className="border-white/20 text-slate-300 hover:bg-white/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить блок
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.content.map((block, index) => (
                    <div
                      key={index}
                      className="border border-white/10 rounded-xl p-4 bg-slate-800/30"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-400">
                            Блок {index + 1}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveContentBlock(index, "up")}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveContentBlock(index, "down")}
                            disabled={index === formData.content.length - 1}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContentBlock(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor={`subtitle-${index}`}
                            className="text-sm text-slate-300"
                          >
                            Подзаголовок (необязательно)
                          </Label>
                          <Input
                            id={`subtitle-${index}`}
                            value={block.subtitle || ""}
                            onChange={(e) =>
                              updateContentBlock(index, "subtitle", e.target.value)
                            }
                            placeholder="Подзаголовок раздела"
                            className="bg-slate-900/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`text-${index}`}
                            className="text-sm text-slate-300"
                          >
                            Текст *
                          </Label>
                          <Textarea
                            id={`text-${index}`}
                            value={block.text}
                            onChange={(e) =>
                              updateContentBlock(index, "text", e.target.value)
                            }
                            placeholder="Текст раздела..."
                            rows={6}
                            className="bg-slate-900/50 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="border-white/20 text-slate-300 hover:bg-white/5"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 hover:scale-105"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Сохранение...
                    </span>
                  ) : editingPost ? (
                    "Сохранить"
                  ) : (
                    "Создать"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
