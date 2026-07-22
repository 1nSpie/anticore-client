"use client";

import { useEffect } from "react";
import { usePrices } from "../../hooks/usePrices";
import { PriceManagement } from "../../components/prices/PriceManagement";

export default function AdminPricesPage() {
  const { prices, loading, editingPrices, loadPrices, handlePriceChange, savePrice } =
    usePrices();

  useEffect(() => {
    void loadPrices();
  }, [loadPrices]);

  return (
    <PriceManagement
      prices={prices}
      loading={loading}
      editingPrices={editingPrices}
      onPriceChange={handlePriceChange}
      onSavePrice={savePrice}
    />
  );
}
