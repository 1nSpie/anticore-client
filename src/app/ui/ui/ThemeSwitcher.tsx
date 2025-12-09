// "use client";
// import { useEffect, useState } from "react";
// import {
//   MoonIcon,
//   SunIcon,
//   ComputerDesktopIcon,
// } from "@heroicons/react/24/outline";
// import { useTheme } from "next-themes";
// import { motion } from "framer-motion";

// export default function ThemeSwitcher() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   // Убедитесь, что компонент смонтирован перед использованием темы
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     return (
//       <div className="p-3 opacity-0">
//         <SunIcon className="h-5 w-5" />
//       </div>
//     );
//   }

//   // Логика переключения темы
//   const toggleTheme = () => {
//     if (theme === "light") {
//       setTheme("dark");
//     } else if (theme === "dark") {
//       setTheme("system");
//     } else {
//       setTheme("light");
//     }
//   };

//   return (
//     <motion.button
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={toggleTheme}
//       className="p-3 text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors duration-300 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full hover:bg-white/20 dark:hover:bg-white/5"
//     >
//       {theme === "light" && (
//         <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all" />
//       )}
//       {theme === "dark" && (
//         <MoonIcon className="h-5 w-5 rotate-0 scale-100 transition-all" />
//       )}
//       {theme === "system" && (
//         <ComputerDesktopIcon className="h-5 w-5 rotate-0 scale-100 transition-all" />
//       )}
//     </motion.button>
//   );
// }