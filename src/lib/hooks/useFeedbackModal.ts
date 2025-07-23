"use client";

import { useState, useEffect } from "react";

// Типизация параметров
interface UseFeedbackModalOptions {
  delay?: number; // Задержка перед показом модалки (в мс)
  disabled?: boolean; // Отключить модалку полностью
  cooldownHours?: number; // Время "охлаждения" (в часах)
}

// Константы для хранения ключей
const FEEDBACK_MODAL_KEY = "feedbackModalLastShown";
const SESSION_KEY = "feedbackModalShownThisSession";

export const useFeedbackModal = (options: UseFeedbackModalOptions = {}) => {
  const { delay = 3000, disabled = false, cooldownHours = 24 } = options;

  const [showModal, setShowModal] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [canShow, setCanShow] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Убедиться, что это клиент
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Проверка, прошло ли время "охлаждения"
  const checkCooldown = (): boolean => {
    if (!isClient) return false;

    try {
      const lastShownStr = localStorage.getItem(FEEDBACK_MODAL_KEY);
      if (!lastShownStr) {
        console.log("FeedbackModal: Never shown before, can show");
        return true;
      }

      const lastShown = new Date(lastShownStr);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60);

      console.log(
        `FeedbackModal: Last shown ${hoursDiff.toFixed(
          2
        )} hours ago, cooldown is ${cooldownHours} hours`
      );
      return hoursDiff >= cooldownHours;
    } catch (error) {
      console.error("FeedbackModal: Error checking cooldown:", error);
      return true;
    }
  };

  // Сохранить текущее время показа
  const saveTimestamp = () => {
    if (!isClient) return;

    try {
      const now = new Date().toISOString();
      localStorage.setItem(FEEDBACK_MODAL_KEY, now);
      console.log("FeedbackModal: Timestamp saved", now);
    } catch (error) {
      console.error("FeedbackModal: Error saving timestamp:", error);
    }
  };

  // Показать модалку через заданный delay
  useEffect(() => {
    if (!isClient) return;
    if (disabled) {
      console.log("FeedbackModal: Disabled");
      return;
    }

    const canShowModal = checkCooldown();
    setCanShow(canShowModal);

    if (!canShowModal) {
      console.log("FeedbackModal: Cooldown not passed");
      return;
    }

    if (hasShown) {
      console.log("FeedbackModal: Already shown in this session");
      return;
    }

    const hasSeenThisSession = sessionStorage.getItem(SESSION_KEY);
    if (hasSeenThisSession) {
      console.log("FeedbackModal: Already shown in this session");
      setHasShown(true);
      return;
    }

    console.log(`FeedbackModal: Starting timer for ${delay}ms`);
    const timer = setTimeout(() => {
      setShowModal(true);
      setHasShown(true);
      sessionStorage.setItem(SESSION_KEY, "true");
      saveTimestamp();

      console.log("FeedbackModal: Modal shown and timestamp saved");
    }, delay);

    return () => {
      console.log("FeedbackModal: Clearing timer");
      clearTimeout(timer);
    };
  }, [
    delay,
    disabled,
    hasShown,
    cooldownHours,
    isClient,
    checkCooldown,
    saveTimestamp,
  ]);

  // Закрытие модалки
  const closeModal = () => {
    setShowModal(false);
  };

  // Сброс показа в текущей сессии
  const resetModal = () => {
    setHasShown(false);
    sessionStorage.removeItem(SESSION_KEY);
    console.log("FeedbackModal: Modal reset for this session");
  };

  // Полный сброс состояния
  const resetCooldownAndSession = () => {
    localStorage.removeItem(FEEDBACK_MODAL_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setHasShown(false);
    setCanShow(true);
    console.log("FeedbackModal: Cooldown and session reset");
  };

  // Получить оставшееся время до следующего показа
  const getTimeUntilNextShow = (): {
    hours: number;
    minutes: number;
  } | null => {
    try {
      const lastShownStr = localStorage.getItem(FEEDBACK_MODAL_KEY);
      if (!lastShownStr) return null;

      const lastShown = new Date(lastShownStr);
      const now = new Date();
      const timeDiff = now.getTime() - lastShown.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff >= cooldownHours) return null;

      const remainingMs = cooldownHours * 60 * 60 * 1000 - timeDiff;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor(
        (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      return { hours, minutes };
    } catch (error) {
      console.error(
        "FeedbackModal: Error calculating time until next show:",
        error
      );
      return null;
    }
  };

  return {
    showModal,
    setShowModal,
    closeModal,
    resetModal,
    resetCooldown: resetCooldownAndSession,
    hasShown,
    canShow,
    getTimeUntilNextShow,
  };
};
