"use client";

import React, { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BentoGrid } from "@/components/BentoGrid";
import { DossierModal } from "@/components/DossierModal";
import { EvidenceModal } from "@/components/EvidenceModal";
import { Toast, ToastData } from "@/components/Toast";

export default function Home() {
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [dossierOpen, setDossierOpen] = useState<boolean>(false);
  const [evidenceOpen, setEvidenceOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData>({
    title: "System Signal",
    message: "Operation executed.",
    visible: false,
  });

  // Check FastAPI backend connection on mount & periodic polling
  useEffect(() => {
    let mounted = true;

    async function pollHealth() {
      const status = await checkBackendHealth();
      if (mounted) {
        setApiOnline(status.online);
      }
    }

    pollHealth();
    const interval = setInterval(pollHealth, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const showToast = (title: string, message: string) => {
    setToast({ title, message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleSearch = (query: string) => {
    showToast(
      "AETHER Engine Active",
      `Scanning target: ${query.substring(0, 28)}... Probing Shodan and Tor SOCKS5.`
    );
  };

  return (
    <div className="w-full max-w-[1520px] flex flex-col md:flex-row gap-6 items-stretch">
      {/* LEFT SHARP DOCK */}
      <Sidebar onShowToast={showToast} />

      {/* RIGHT MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col gap-6">
        {/* TOP HEADER */}
        <Header
          apiOnline={apiOnline}
          onSearch={handleSearch}
          onShowToast={showToast}
        />

        {/* BENTO GRID */}
        <BentoGrid
          onOpenDossier={() => setDossierOpen(true)}
          onOpenEvidence={() => setEvidenceOpen(true)}
          onShowToast={showToast}
        />
      </main>

      {/* Interactive Modals & Notification Toast */}
      <DossierModal
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
        onShowToast={showToast}
      />

      <EvidenceModal
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        onShowToast={showToast}
      />

      <Toast
        toast={toast}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
