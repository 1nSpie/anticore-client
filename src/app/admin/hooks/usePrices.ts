// Хук для управления ценами

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { adminApi } from "../_lib/api";
import { PriceData } from "../_lib/types";

export const usePrices = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPrices, setEditingPrices] = useState<
    Record<number, Partial<PriceData>>
  >({});

  // Загрузка цен
  const loadPrices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.get<PriceData[]>("/segment");
      setPrices(response.data);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("admin_session_expired"));
      } else {
        toast.error("Ошибка загрузки цен");
        console.error("Ошибка загрузки цен:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Изменение цены
  const handlePriceChange = useCallback(
    (segment: number, field: keyof PriceData, value: string) => {
      setEditingPrices((prev) => ({
        ...prev,
        [segment]: {
          ...prev[segment],
          [field]: value === "" ? null : parseInt(value, 10),
        },
      }));
    },
    []
  );

  // Сохранение цены
  const savePrice = useCallback(
    async (segment: number) => {
      const priceData = prices.find((p) => p.segment === segment);
      const editedData = editingPrices[segment];

      if (!priceData) {
        toast.error("Данные сегмента не найдены");
        return;
      }

      try {
        setLoading(true);

        const updateData = {
          standartML: editedData?.standartML ?? priceData.standartML,
          standartMLBody:
            editedData?.standartMLBody ?? priceData.standartMLBody,
          complexML: editedData?.complexML ?? priceData.complexML,
          complexMLBody:
            editedData?.complexMLBody ?? priceData.complexMLBody,
        };

        await adminApi.put(`/segment/by-segment/${segment}`, updateData);

        toast.success(`Цены для сегмента ${segment} обновлены`);

        setEditingPrices((prev) => {
          const newState = { ...prev };
          delete newState[segment];
          return newState;
        });

        await loadPrices();
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          window.dispatchEvent(new CustomEvent("admin_session_expired"));
        } else {
          toast.error("Ошибка сохранения");
          console.error("Failed to save price:", error);
        }
      } finally {
        setLoading(false);
      }
    },
    [prices, editingPrices, loadPrices]
  );

  return {
    prices,
    loading,
    editingPrices,
    loadPrices,
    handlePriceChange,
    savePrice,
  };
};
