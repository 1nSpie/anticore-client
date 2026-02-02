"use client";

import { useAuth } from "./hooks/useAuth";
import { usePrices } from "./hooks/usePrices";
import { LoginForm } from "./components/auth/LoginForm";
import { LoadingScreen } from "./components/auth/LoadingScreen";
import { AdminDashboard } from "./components/layout/AdminDashboard";
import { useEffect } from "react";

export default function AdminPage() {
  const {
    authState,
    loginData,
    setLoginData,
    handleLogin,
    handleLogout,
  } = useAuth();

  const {
    prices,
    loading,
    editingPrices,
    loadPrices,
    handlePriceChange,
    savePrice,
  } = usePrices();

  // Загружаем цены после успешной авторизации
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isLoading) {
      loadPrices();
    }
  }, [authState.isAuthenticated, authState.isLoading, loadPrices]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // Показываем загрузку при проверке авторизации
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Форма авторизации
  if (!authState.isAuthenticated) {
    return (
      <LoginForm
        loginData={loginData}
        loading={false}
        onLoginDataChange={setLoginData}
        onLogin={async () => {
          const success = await handleLogin();
          if (success) {
            await loadPrices();
          }
        }}
        onKeyPress={handleKeyPress}
      />
    );
  }

  // Основной интерфейс админ-панели
  return (
    <AdminDashboard
      prices={prices}
      loading={loading}
      editingPrices={editingPrices}
      onLogout={handleLogout}
      onRefresh={loadPrices}
      onPriceChange={handlePriceChange}
      onSavePrice={savePrice}
    />
  );
}
