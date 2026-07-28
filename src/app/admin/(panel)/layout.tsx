"use client";

import { useAuth } from "../hooks/useAuth";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { LoadingScreen } from "../components/auth/LoadingScreen";
import { AdminShell } from "../components/layout/AdminShell";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ready = useRequireAdmin();
  const { handleLogout } = useAuth();

  if (!ready) return <LoadingScreen />;

  return <AdminShell onLogout={() => void handleLogout()}>{children}</AdminShell>;
}
