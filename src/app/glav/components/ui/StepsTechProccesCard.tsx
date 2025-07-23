"use client";
import React from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
interface Step {
  icon: string; // URL или путь к иконке
  title: string;
  description: string;
}

interface StepCardProps {
  step: Step;
}

export default function StepCard({ step }: StepCardProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg shadow-lg bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <Image
        src={step.icon}
        alt={step.title}
        width={isMobile ? 100 : 150}
        height={150}
        className="rounded-xl transform transition-transform duration-300 hover:scale-110"
      />

      {/* Содержимое карточки */}
      <div className="pl-5 h-full w-full border-r-2 border-orangeDefault pr-4">
        {/* Название */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center text-wrap">
          {step.title}
        </h3>

        {/* Описание */}
        <p className="text-gray-600 dark:text-gray-300 mt-1 align-middle text-sm break-words">
          {step.description}
        </p>
      </div>
    </div>
  );
}
