"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { LoginForm } from "./components/auth/LoginForm";
import { LoadingScreen } from "./components/auth/LoadingScreen";

export default function AdminLoginPage() {
  const router = useRouter();
  const { authState, loginData, setLoginData, handleLogin } = useAuth();

  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated) {
      router.replace("/admin/calendar");
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);

  if (authState.isLoading) return <LoadingScreen />;

  if (authState.isAuthenticated) return <LoadingScreen />;

  return (
    <LoginForm
      loginData={loginData}
      loading={false}
      onLoginDataChange={setLoginData}
      onLogin={async () => {
        const ok = await handleLogin();
        if (ok) router.replace("/admin/calendar");
      }}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          void handleLogin().then((ok) => {
            if (ok) router.replace("/admin/calendar");
          });
        }
      }}
    />
  );
}
