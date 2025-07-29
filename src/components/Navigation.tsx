"use client";

import Image from "next/image";
import MobileSidebarNavigation from "../app/glav/components/ui/MobileSidebarNavigation";
import NavbarCallButton from "../app/ui/ui/NavbarCallButton";
import { navigationLinks } from "src/lib/contants";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "src/lib/hooks/useMediaQuery";
import LightLogo from "public/trans_bg.svg";
import DarkLogo from "public/shapka_dark.svg";
import ThemeSwitcher from "src/app/ui/ui/ThemeSwitcher";
import Link from "next/link";

export default function Navigation() {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 1279px)");

  // Скрываем navbar на главной
  if (pathname === "/" && !isMobile) return null;
  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 left-0 w-full z-50 block lg:hidden">
        <nav className="max-w-[85rem] mx-auto px-4 py-2 lg:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 ">
            <div className="block dark:hidden">
              <Image
                src={DarkLogo}
                alt="Тёмный логотип"
                width={200}
                height={50}
              />
            </div>
            <div className="hidden dark:block">
              <Image
                src={LightLogo}
                alt="Светлый логотип"
                width={200}
                height={50}
              />
            </div>
          </Link>
          <div className="flex items-center space-x-3 mr-2">
            <NavbarCallButton className="md:hidden block" />
            <MobileSidebarNavigation />
          </div>
        </nav>
      </header>

      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 left-0 w-full z-50 hidden lg:block">
        <nav className="max-w-[85rem] mx-auto  py-2 px-6 flex items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            <div className="block dark:hidden">
              <Image
                src={DarkLogo}
                alt="Тёмный логотип"
                width={200}
                height={50}
              />
            </div>
            <div className="hidden dark:block">
              <Image
                src={LightLogo}
                alt="Светлый логотип"
                width={200}
                height={50}
              />
            </div>
          </Link>

          {/* Десктопное меню */}
          <div className="flex w-full justify-around">
            {navigationLinks.map((el, i) => (
              <Link
                key={i}
                href={el.link}
                className="text-lg text-gray-900 dark:text-gray-300 hover:underline hover:decoration-2 hover:underline-offset-2 pl-4"
              >
                {el.label}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex">
            <ThemeSwitcher />
          </div>
        </nav>
      </header>
    </>
  );
}
