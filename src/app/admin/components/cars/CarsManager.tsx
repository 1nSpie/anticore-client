"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";
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
  Car as CarIcon,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Building2,
  Loader2,
} from "lucide-react";
import { Brand, Car, SEGMENT_COLORS } from "../../_lib/types";
import axios from "axios";

export default function CarsManager() {
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCar, setCurrentCar] = useState<
    Partial<Car> & { brandName?: string }
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBrands, setExpandedBrands] = useState<Set<number>>(new Set());
  const [createNewBrand, setCreateNewBrand] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [carsRes, brandsRes] = await Promise.all([
        adminApi.get("/cars"),
        axios.get<Brand[]>(`${API_BASE_URL}/cars/brands`),
      ]);
      setCars(carsRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Группировка машин по маркам с фильтрацией
  const groupedCars = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? cars.filter(
          (car) =>
            car.model.toLowerCase().includes(query) ||
            car.brand?.name.toLowerCase().includes(query)
        )
      : cars;

    const groups: Record<number, { brand: Brand; cars: Car[] }> = {};

    filtered.forEach((car) => {
      if (!car.brand) return;
      if (!groups[car.brand.id]) {
        groups[car.brand.id] = { brand: car.brand, cars: [] };
      }
      groups[car.brand.id].cars.push(car);
    });

    // Сортировка внутри групп
    Object.values(groups).forEach((group) => {
      group.cars.sort((a, b) => a.model.localeCompare(b.model));
    });

    return Object.values(groups).sort((a, b) =>
      a.brand.name.localeCompare(b.brand.name)
    );
  }, [cars, searchQuery]);

  const resetForm = useCallback(() => {
    setCurrentCar({});
    setIsEditing(false);
    setCreateNewBrand(false);
  }, []);

  const handleEdit = useCallback((car: Car) => {
    setCurrentCar({
      id: car.id,
      model: car.model,
      segment: car.segment,
      brandId: car.brandId ?? car.brand?.id,
    });
    setIsEditing(true);
    setCreateNewBrand(false);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Удалить этот автомобиль?")) return;
      try {
        await adminApi.delete(`/cars/${id}`);
        toast.success("Автомобиль удалён");
        loadData();
      } catch (error) {
        console.error(error);
        toast.error("Ошибка удаления");
      }
    },
    [loadData]
  );

  const handleDeleteBrand = useCallback(
    async (brandId: number, brandName: string) => {
      const carsCount = cars.filter((c) => c.brandId === brandId).length;
      if (
        !confirm(
          `Удалить марку "${brandName}" и все её автомобили (${carsCount} шт.)?`
        )
      )
        return;
      try {
        await adminApi.delete(`/cars/brands/${brandId}`);
        toast.success(`Марка "${brandName}" удалена`);
        loadData();
      } catch (error) {
        console.error(error);
        toast.error("Ошибка удаления марки");
      }
    },
    [cars, loadData]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentCar.model?.trim()) {
        toast.error("Укажите модель");
        return;
      }

      if (
        !currentCar.segment ||
        currentCar.segment < 1 ||
        currentCar.segment > 6
      ) {
        toast.error("Сегмент должен быть от 1 до 6");
        return;
      }

      if (createNewBrand) {
        if (!currentCar.brandName?.trim()) {
          toast.error("Укажите название новой марки");
          return;
        }
      } else if (!currentCar.brandId) {
        toast.error("Выберите марку или создайте новую");
        return;
      }

      try {
        setLoading(true);
        const payload: any = {
          model: currentCar.model.trim(),
          segment: Number(currentCar.segment),
        };

        if (createNewBrand && currentCar.brandName) {
          payload.brandName = currentCar.brandName.trim();
        } else {
          payload.brandId = Number(currentCar.brandId);
        }

        if (currentCar.id) {
          await adminApi.patch(`/cars/${currentCar.id}`, {
            model: payload.model,
            segment: payload.segment,
            brandId: payload.brandId,
          });
          toast.success("Автомобиль обновлён");
        } else {
          await adminApi.post("/cars", payload);
          toast.success(
            createNewBrand
              ? `Создана марка "${currentCar.brandName}" и добавлен автомобиль`
              : "Автомобиль добавлен"
          );
        }

        resetForm();
        loadData();
      } catch (error) {
        console.error(error);
        toast.error("Ошибка сохранения");
      } finally {
        setLoading(false);
      }
    },
    [currentCar, createNewBrand, resetForm, loadData]
  );

  const toggleBrand = useCallback((brandId: number) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) {
        next.delete(brandId);
      } else {
        next.add(brandId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedBrands(new Set(groupedCars.map((g) => g.brand.id)));
  }, [groupedCars]);

  const collapseAll = useCallback(() => {
    setExpandedBrands(new Set());
  }, []);

  const totalCars = cars.length;
  const totalBrands = brands.length;

  return (
    <Card className="bg-slate-900/60 border border-white/10 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          {/* Заголовок и статистика */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30">
                <CarIcon className="w-5 h-5" />
              </span>
              <div>
                <CardTitle className="text-slate-50">Автомобили</CardTitle>
                <p className="text-sm text-slate-400">
                  {totalBrands} марок • {totalCars} моделей
                </p>
              </div>
            </div>
            <Button
              onClick={() => (isEditing ? resetForm() : setIsEditing(true))}
              className={
                isEditing
                  ? "border-white/20 text-slate-100 bg-transparent hover:bg-white/5"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 hover:scale-105"
              }
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Отменить
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </>
              )}
            </Button>
          </div>

          {/* Форма добавления/редактирования */}
          {isEditing && (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-800/50 border border-white/10 rounded-xl p-4 space-y-4 animate-in slide-in-from-top-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Марка */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-medium">
                    Марка
                  </label>
                  {!currentCar.id && (
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={!createNewBrand ? "default" : "outline"}
                        onClick={() => setCreateNewBrand(false)}
                        className={
                          !createNewBrand
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "border-white/20 text-slate-300"
                        }
                      >
                        Существующая
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={createNewBrand ? "default" : "outline"}
                        onClick={() => setCreateNewBrand(true)}
                        className={
                          createNewBrand
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "border-white/20 text-slate-300"
                        }
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Новая
                      </Button>
                    </div>
                  )}
                  {createNewBrand && !currentCar.id ? (
                    <Input
                      value={currentCar.brandName ?? ""}
                      onChange={(e) =>
                        setCurrentCar((prev) => ({
                          ...prev,
                          brandName: e.target.value,
                        }))
                      }
                      className="bg-slate-900/80 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Название новой марки"
                    />
                  ) : (
                    <Select
                      value={currentCar.brandId?.toString() ?? ""}
                      onValueChange={(value) =>
                        setCurrentCar((prev) => ({
                          ...prev,
                          brandId: Number(value),
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900/80 border-white/10 text-slate-50">
                        <SelectValue placeholder="Выберите марку" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 max-h-60">
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                            className="text-slate-50"
                          >
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Модель */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-medium">
                    Модель
                  </label>
                  <Input
                    value={currentCar.model ?? ""}
                    onChange={(e) =>
                      setCurrentCar((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="bg-slate-900/80 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Например, Camry"
                  />
                </div>

                {/* Сегмент */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-medium">
                    Сегмент
                  </label>
                  <Select
                    value={currentCar.segment?.toString() ?? ""}
                    onValueChange={(value) =>
                      setCurrentCar((prev) => ({
                        ...prev,
                        segment: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className="bg-slate-900/80 border-white/10 text-slate-50">
                      <SelectValue placeholder="1-6" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      {[1, 2, 3, 4, 5, 6].map((seg) => (
                        <SelectItem
                          key={seg}
                          value={seg.toString()}
                          className="text-slate-50"
                        >
                          Сегмент {seg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Кнопка */}
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 hover:scale-105"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : currentCar.id ? (
                      "Сохранить"
                    ) : (
                      "Добавить"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Поиск и управление */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900/80 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Поиск по марке или модели..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="border-white/20 text-slate-300 hover:bg-white/5 transition-all"
              >
                Развернуть все
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="border-white/20 text-slate-300 hover:bg-white/5 transition-all"
              >
                Свернуть все
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && !cars.length ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
            <p className="text-slate-400">Загрузка...</p>
          </div>
        ) : groupedCars.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {searchQuery ? "Ничего не найдено" : "Нет автомобилей"}
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {groupedCars.map(({ brand, cars: brandCars }) => {
              const isExpanded = expandedBrands.has(brand.id);
              return (
                <div
                  key={brand.id}
                  className="border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
                >
                  {/* Заголовок марки */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
                    onClick={() => toggleBrand(brand.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform" />
                      )}
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-slate-100">
                        {brand.name}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                        {brandCars.length}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrand(brand.id, brand.name);
                      }}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 p-0 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Список моделей */}
                  {isExpanded && (
                    <div className="divide-y divide-white/5 animate-in slide-in-from-top-2">
                      {brandCars.map((car) => (
                        <div
                          key={car.id}
                          className="flex items-center justify-between px-4 py-2.5 pl-11 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-200">
                              {car.model}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                SEGMENT_COLORS[car.segment] ||
                                "bg-slate-500/20 text-slate-300"
                              }`}
                            >
                              {car.segment}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(car)}
                              className="text-slate-400 hover:text-slate-200 hover:bg-white/5 h-7 w-7 p-0 transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(car.id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 p-0 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
