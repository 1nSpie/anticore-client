"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/tabs";
import { DollarSign, Car as CarIcon, UserCircle2, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shadcn/button";
import { AdminHeader } from "./AdminHeader";
import { PriceManagement } from "../prices/PriceManagement";
import { PriceData } from "../../_lib/types";
import CarsManager from "../cars/CarsManager";
import CabinetUsersManager from "../cabinet/CabinetUsersManager";

interface AdminDashboardProps {
  prices: PriceData[];
  loading: boolean;
  editingPrices: Record<number, Partial<PriceData>>;
  onLogout: () => void;
  onRefresh: () => void;
  onPriceChange: (
    segment: number,
    field: keyof PriceData,
    value: string
  ) => void;
  onSavePrice: (segment: number) => void;
}

export function AdminDashboard({
  prices,
  loading,
  editingPrices,
  onLogout,
  onRefresh,
  onPriceChange,
  onSavePrice,
}: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-admin relative overflow-hidden pt-30">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 lg:p-10 relative z-10">
          <AdminHeader
            onRefresh={onRefresh}
            onLogout={onLogout}
            loading={loading}
          />

          <div className="mb-6">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Link href="/admin/crm">
                <Calendar className="w-4 h-4 mr-2" />
                CRM — календарь записей
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="prices" className="space-y-6">
            <TabsList className="bg-slate-900/60 border border-white/10 p-1 flex flex-wrap h-auto gap-1">
              <TabsTrigger
                value="prices"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 transition-all"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Цены
              </TabsTrigger>
              <TabsTrigger
                value="cars"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 transition-all"
              >
                <CarIcon className="w-4 h-4 mr-2" />
                Автомобили
              </TabsTrigger>
              <TabsTrigger
                value="cabinet"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 transition-all"
              >
                <UserCircle2 className="w-4 h-4 mr-2" />
                Клиенты ЛК
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prices" className="mt-6">
              <PriceManagement
                prices={prices}
                loading={loading}
                editingPrices={editingPrices}
                onPriceChange={onPriceChange}
                onSavePrice={onSavePrice}
              />
            </TabsContent>

            <TabsContent value="cars" className="mt-6">
              <CarsManager />
            </TabsContent>

            <TabsContent value="cabinet" className="mt-6">
              <CabinetUsersManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
