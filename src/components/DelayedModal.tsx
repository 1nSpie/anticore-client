// components/DelayedModal.tsx
"use client";

import { CallbackModal } from "@/app/ui/ui/CallbackModal";
import { useEffect } from "react";
import { useModal } from "@/lib/ModalContext";

const MODAL_SEEN_KEY = "lastModalSeenTime";
const MODAL_ID = "delayed-modal";

export function DelayedModal() {
  const { openModal, closeModal, isModalOpen, canOpenModal } = useModal();

  useEffect(() => {
    const lastSeen = localStorage.getItem(MODAL_SEEN_KEY);
    const now = Date.now();

    if (!lastSeen || now - Number(lastSeen) > 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        if (canOpenModal(MODAL_ID)) {
          openModal(MODAL_ID);
          localStorage.setItem(MODAL_SEEN_KEY, String(now));
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [canOpenModal, openModal]);

  return (
    <CallbackModal
      setView={(isOpen) => (isOpen ? openModal(MODAL_ID) : closeModal(MODAL_ID))}
      hasOpen={isModalOpen(MODAL_ID)}
    />
  );
}
