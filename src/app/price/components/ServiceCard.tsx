"use client"

import Link from "next/link"
import { ArrowRightIcon, ShieldCheckIcon, CogIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline"

interface ServiceCardProps {
  service: {
    id: number
    title: string
  }
}

// Icon mapping for different services
const getServiceIcon = (id: number) => {
  switch (id) {
    case 1:
      return ShieldCheckIcon;
    case 2:
      return CogIcon;
    case 3:
      return WrenchScrewdriverIcon;
    default:
      return ShieldCheckIcon;
  }
};

// Color schemes for different services
const getColorScheme = (id: number) => {
  const schemes = [
    {
      bg: "from-[#007478]/10 to-[#007478]/20 dark:from-[#007478]/20 dark:to-[#007478]/10",
      border: "border-[#007478]/30 dark:border-[#007478]/20",
      icon: "bg-[#007478]/10 dark:bg-[#007478]/20",
      iconColor: "text-[#007478] dark:text-[#00a2a6]",
      hover: "hover:from-[#007478]/10 hover:to-[#007478]/20 dark:hover:from-[#007478]/20 dark:hover:to-[#007478]/10"
    },
    {
      bg: "from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10",
      border: "border-blue-200/50 dark:border-blue-700/30",
      icon: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      hover: "hover:from-blue-100 hover:to-blue-150 dark:hover:from-blue-900/30 dark:hover:to-blue-800/20"
    },
    {
      bg: "from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
      border: "border-emerald-200/50 dark:border-emerald-700/30",
      icon: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      hover: "hover:from-emerald-100 hover:to-emerald-150 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/20"
    }
  ];
  return schemes[(id - 1) % schemes.length];
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = getServiceIcon(service.id);
  const colorScheme = getColorScheme(service.id);

  return (
    <Link href={`/price/${service.id}`} className="block group">
      <div className={`relative overflow-hidden bg-gradient-to-br ${colorScheme.bg} ${colorScheme.hover} border ${colorScheme.border} rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#007478]/10 dark:hover:shadow-[#007478]/5 transform hover:-translate-y-2 cursor-pointer h-full`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent rounded-full -translate-y-12 translate-x-12" />
        
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 ${colorScheme.icon} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className={`w-8 h-8 ${colorScheme.iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="relative">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {service.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Узнайте подробности о наших услугах и получите персональное предложение
          </p>
          
          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#007478] dark:text-[#00a2a6]">
              Подробнее
            </span>
            <div className="flex items-center justify-center w-10 h-10 bg-white/80 dark:bg-gray-700/80 rounded-full group-hover:bg-[#007478] group-hover:text-white transition-all duration-300">
              <ArrowRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#007478]/0 via-[#007478]/0 to-[#007478]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      </div>
    </Link>
  )
}