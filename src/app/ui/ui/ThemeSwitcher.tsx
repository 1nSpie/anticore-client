"use client";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../shadcn/button";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Убедитесь, что компонент смонтирован перед использованием темы
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="opacity-0">
        {/* Заглушка для предотвращения сдвига */}
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  // Логика переключения темы
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {/* Иконка солнца */}
      {theme === "light" && (
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      )}
      {/* Иконка луны */}
      {theme === "dark" && (
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
      {/* Иконка системы */}
      {theme === "system" && (
        <ComputerDesktopIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
    </Button>
  );
}