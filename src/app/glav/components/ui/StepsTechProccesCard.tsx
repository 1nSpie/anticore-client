"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shadcn/dialog";
import { ScrollArea } from "@/shadcn/scroll-area";
import { Button } from "@/shadcn/button";
import { useRouter } from "next/navigation";


interface Step {
  icon: string;
  title: string;
  description: string;
}

interface StepCardProps {
  step: Step;
  index?: number;
}

const stepIdMap: Record<string, string> = {
  "Диагностика": "diagnostika",
  "Разборка": "razborka",
  "Мойка": "moyka",
  "Сушка": "sushka",
  "Маскировка": "maskirovka",
  "Зачистка": "zachistka",
  "Обработка": "obrabotka",
  "Контроль качества": "kontrol-kachestva",
  "Гарантийный талон": "garantijnyj-talon",
};

// Шестиугольник (flat top/bottom) для clip-path
const hexagonClipPath =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";



export default function StepCard({ step, index = 0 }: StepCardProps) {
  const router = useRouter();
  const handleCardClick = () => {
    const stepId = stepIdMap[step.title];
    if (stepId) {
      router.push(`/process#${stepId}`);
    } 
  };


  return (
      <motion.div
        className="
          rounded-xl p-6 h-full flex flex-col relative overflow-hidden
          shadow-lg
          hover:shadow-xl transition-shadow duration-300
          cursor-pointer
        "
        style={{
          background: "linear-gradient(90deg, #EF9147 0%, #FF6B35 100%)",
        }}
        onClick={handleCardClick}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Step number */}
        <div
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10"
          style={{ background: "#FFFFFF" }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "#EF9147" }}
          >
            {index + 1}
          </span>
        </div>

        {/* Image section */}
        <div className="p-8 pb-4 flex justify-center">
          <Image
            src={step.icon}
            alt={step.title}
            width={150}
            height={150}
            className="object-contain opacity-90"
          />
        </div>

        {/* Content section */}
        <div className="p-6 pt-2 flex-1 flex flex-col text-center">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3">
            {step.title}
          </h3>

          {/* Description preview */}
          <p className="text-sm text-white/90 leading-relaxed flex-1 line-clamp-3">
            {step.description}
          </p>

          {/* "Read more" indicator */}
          <div className="mt-4 flex items-center justify-center">
            <span className="text-sm font-medium text-white hover:text-white/90 transition-colors">
              Подробнее →
            </span>
          </div>

          {/* Bottom accent line */}
          <div className="mt-4 h-0.5 bg-white/40 rounded-full w-full mx-auto" />
        </div>
      </motion.div>
  );
}