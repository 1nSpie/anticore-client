"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CABINET_TOKEN_KEY } from "./api";

/** Redirect authenticated users away from login/register/forgot-password. */
export function useCabinetGuestOnly(redirectTo = "/cabinet/profile") {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(CABINET_TOKEN_KEY)) {
      router.replace(redirectTo);
      return;
    }
    setAllowed(true);
  }, [router, redirectTo]);

  return allowed;
}
