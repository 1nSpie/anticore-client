"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../_lib/constants";
import type { Brand, Car } from "../../_lib/types";

export function useCarCatalog(brand: string) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  const loadBrands = useCallback(async () => {
    try {
      const { data } = await axios.get<Brand[]>(`${API_BASE_URL}/cars/brands`);
      setBrands(data);
    } catch {
      setBrands([]);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    if (!brand) {
      setCars([]);
      return;
    }
    const b = brands.find((x) => x.name === brand);
    if (!b?.id) {
      setCars([]);
      return;
    }
    axios
      .get<Car[]>(`${API_BASE_URL}/brands/${b.id}`)
      .then((r) => setCars(r.data))
      .catch(() => setCars([]));
  }, [brand, brands]);

  const resolveCarId = useCallback(
    (model: string): number | null => {
      const found = cars.find((c) => c.model === model);
      return found?.id ?? null;
    },
    [cars],
  );

  const resolveCarSegment = useCallback(
    (model: string): number | null => {
      const found = cars.find((c) => c.model === model);
      return found?.segment ?? null;
    },
    [cars],
  );

  return { brands, cars, resolveCarId, resolveCarSegment, reloadBrands: loadBrands };
}
