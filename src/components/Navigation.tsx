"use client";

import Image from "next/image";
import LightLogo from "public/trans_bg.svg";
import DarkLogo from "public/shapka_dark.svg";
import Link from "next/link";
import NavigationButton from "@/app/glav/components/ui/NavButton";
import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  function renderLogo() {
    if (pathname === "/") {
      return (
        <Link href="/" className="flex items-center">
          <Image
            src={LightLogo}
            alt="Avancor Services Logo"
            width={200}
            height={200}
            className="dark:block hidden"
          />
          <Image
            src={LightLogo}
            alt="Avancor Services Logo"
            width={200}
            height={200}
            className="dark:hidden block"
          />
        </Link>
      );
    } else {
      return (
        <Link href="/" className="flex items-center">
          <Image
            src={LightLogo}
            alt="Avancor Services Logo"
            width={200}
            height={200}
            className="dark:block hidden"
          />
          <Image
            src={DarkLogo}
            alt="Avancor Services Logo"
            width={200}
            height={200}
            className="dark:hidden block"
          />
        </Link>
      );
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-100 flex items-center justify-between pt-6 pl-6 pr-6 bg-transparent">
      {renderLogo()}
      <div className="flex items-center gap-6">
        <Link
          href="tel:+79932456882"
          className="hidden md:flex items-center gap-2 text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors duration-300"
        >
          <Phone className="w-5 h-5" />
          <span className="font-medium">+7 (993) 245-68-82</span>
        </Link>
        <NavigationButton />
      </div>
    </header>
  );
}
