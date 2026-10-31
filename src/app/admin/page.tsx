"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { LoginForm } from "./components/auth/LoginForm";
import { LoadingScreen } from "./components/auth/LoadingScreen";
import { homeFor } from "./_lib/session";

/** Единый вход: после авторизации роль решает, куда вести — админа в админку, мастера в его кабинет. */
export default function AdminLoginPage() {
  const router = useRouter();
  const { authState, loginData, setLoginData, handleLogin } = useAuth();

  useEffect(() => {
    if (!authState.isLoading && authState.role) router.replace(homeFor(authState.role));
  }, [authState.isLoading, authState.role, router]);

  if (authState.isLoading || authState.isAuthenticated) return <LoadingScreen />;

  return (
    <LoginForm
      loginData={loginData}
      loading={false}
      onLoginDataChange={setLoginData}
      onLogin={async () => {
        const role = await handleLogin();
        if (role) router.replace(homeFor(role));
      }}
    />
  );
}
