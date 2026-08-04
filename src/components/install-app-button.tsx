"use client";

import { useEffect, useState } from "react";
import { IconDownload } from "@/components/admin-icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalada(true);
      setPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (instalada || !prompt) return null;

  async function instalar() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (compact) {
    return (
      <button
        onClick={instalar}
        aria-label="Instalar app"
        className="rounded-md p-2 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
      >
        <IconDownload className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={instalar}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
    >
      <IconDownload className="h-5 w-5" />
      Instalar app
    </button>
  );
}
