"use client";

import React, { useEffect } from 'react';
import { useFeedbackModal } from './hooks/useFeedbackModal';
import FeedbackModal from '../components/FeedbackModal';

interface FeedbackModalProviderProps {
  children: React.ReactNode;
  delay?: number;
  disabled?: boolean;
  cooldownHours?: number;
}

export const FeedbackModalProvider: React.FC<FeedbackModalProviderProps> = ({ 
  children, 
  delay = 30000, // production-ready
  disabled = false,
  cooldownHours = 24 
}) => {
  const { 
    showModal, 
    setShowModal, 
    canShow,

  } = useFeedbackModal({ delay, disabled, cooldownHours });

  // Логируем изменения состояния
  useEffect(() => {
    console.log('[FeedbackModalProvider] showModal:', showModal);
  }, [showModal]);

  useEffect(() => {
    console.log('[FeedbackModalProvider] canShow:', canShow);
  }, [canShow]);

  return (
    <>
      {children}
      {canShow && (
        <FeedbackModal 
          showModal={showModal} 
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};