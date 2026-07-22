"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CABINET_TOKEN_KEY } from "./_lib/api";
import { PageSkeleton } from "./_components/PageSkeleton";

export default function CabinetIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const has = typeof window !== "undefined" && localStorage.getItem(CABINET_TOKEN_KEY);
    router.replace(has ? "/cabinet/profile" : "/cabinet/login");
  }, [router]);

  return <PageSkeleton />;
}
