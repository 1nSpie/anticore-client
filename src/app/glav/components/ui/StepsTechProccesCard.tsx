"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Step {
  icon: string; // URL или путь к иконке
  title: string;
  description: string;
}

interface StepCardProps {
  step: Step;
  index?: number;
}

export default function StepCard({ step, index = 0 }: StepCardProps) {
  return (
    <motion.div
      className="
    rounded-xl p-6 border h-full flex flex-col relative overflow-hidden
    backdrop-blur-[10px]
    shadow-lg
  "
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Step number */}
      <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-greenDefault to-greenDefaultHover rounded-full flex items-center justify-center shadow-lg z-10">
        <span className="text-white text-sm font-bold">{index + 1}</span>
      </div>

      {/* Image section */}
      <div className="p-8 pb-4 flex justify-center">
        <Image
          src={step.icon}
          alt={step.title}
          width={150}
          height={150}
          className="object-contain"
        />
      </div>

      {/* Content section */}
      <div className="p-6 pt-2 flex-1 flex flex-col text-center">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
          {step.description}
        </p>

        {/* Bottom accent line */}
        <div className="mt-4 h-1 bg-gradient-to-r from-greenDefault to-green-500 rounded-full w-16 mx-auto" />
      </div>
    </motion.div>
  );
}
