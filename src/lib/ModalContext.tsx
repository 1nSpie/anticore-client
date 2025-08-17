"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  openModals: Set<string>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  getModalZIndex: (id: string) => number;
  canOpenModal: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const openModal = (id: string) => {
    setOpenModals(prev => new Set(prev).add(id));
  };

  const closeModal = (id: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const isModalOpen = (id: string) => {
    return openModals.has(id);
  };

  const getModalZIndex = (id: string) => {
    // Base z-index + order of opening
    const modalsArray = Array.from(openModals);
    const index = modalsArray.indexOf(id);
    return 50 + index * 10; // z-50, z-60, z-70, etc.
  };

  const canOpenModal = (id: string) => {
    // Allow only one modal at a time on mobile
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return openModals.size === 0 || openModals.has(id);
    }
    // Allow multiple modals on desktop
    return true;
  };

  return (
    <ModalContext.Provider
      value={{
        openModals,
        openModal,
        closeModal,
        isModalOpen,
        getModalZIndex,
        canOpenModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
