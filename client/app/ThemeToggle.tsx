"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  if (!mounted) return null;

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="ml-4 p-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-zinc-900 transition flex items-center justify-center"
    >
      {dark ? <Sun className="w-5 h-5 text-blue-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
    </button>
  );
}
