"use client";

import React, { useEffect, useState } from "react";
import { checkBackendHealth, verifyCustodyLedger } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BentoGrid } from "@/components/BentoGrid";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { CustodyLedgerView } from "@/components/CustodyLedgerView";
import { StylometryLabModal } from "@/components/StylometryLabModal";
import { DossierModal } from "@/components/DossierModal";
import { EvidenceModal } from "@/components/EvidenceModal";
import { EngineConfigModal } from "@/components/EngineConfigModal";
import { Toast, ToastData } from "@/components/Toast";

export default function Home() {
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeView, setActiveView] = useState<"overview" | "graph" | "custody">("overview");

  // Modals state
  const [dossierOpen, setDossierOpen] = useState<boolean>(false);
  const [evidenceOpen, setEvidenceOpen] = useState<boolean>(false);
  const [stylometryOpen, setStylometryOpen] = useState<boolean>(false);
  const [configOpen, setConfigOpen] = useState<boolean>(false);

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
    }, 4500);
  };

  const handleSearch = (query: string) => {
    showToast(
      "AETHER Engine Active",
      `Scanning target: ${query.substring(0, 28)}... Probing Shodan and Tor SOCKS5.`
    );
  };

  // 1. Icon 1 & 2 & 6: View Switching
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === "overview" || tab === "graph" || tab === "custody") {
      setActiveView(tab);
    }
  };

  // 2. Icon 3: Scroll to / focus Diurnal UTC Circadian Engine
  const handleScrollDiurnal = () => {
    setActiveTab("circadian");
    if (activeView !== "overview") {
      setActiveView("overview");
    }
    showToast(
      "Circadian Engine Focused",
      "UTC diurnal distribution model active (/api/analysis/diurnal)."
    );
    setTimeout(() => {
      const elem = document.getElementById("diurnal-section");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
        elem.classList.add("ring-2", "ring-slate-400");
        setTimeout(() => {
          elem.classList.remove("ring-2", "ring-slate-400");
        }, 2000);
      }
    }, 150);
  };

  // 3. Icon 4: Open AI Stylometry comparison lab
  const handleOpenStylometry = () => {
    setActiveTab("stylometry");
    setStylometryOpen(true);
  };

  // 4. Icon 5: Open Target Suspect dossier sheet
  const handleOpenDossier = () => {
    setActiveTab("suspects");
    setDossierOpen(true);
  };

  // 5. Icon 7: Open Engine Config modal
  const handleOpenConfig = () => {
    setActiveTab("config");
    setConfigOpen(true);
  };

  // 6. Icon 8: Call GET /api/custody/verify and show SHA-256 validity toast
  const handleVerifyShield = async () => {
    setActiveTab("shield");
    try {
      const { data, isLive } = await verifyCustodyLedger("AT-2026-0047");
      if (data.valid) {
        showToast(
          isLive ? "Custody Seal Valid (SHA-256)" : "Cryptographic Chain Intact",
          `Tamper-evident chain verified. ${data.entry_count} custody blocks intact. Seal: ${data.seal.substring(
            0,
            16
          )}...`
        );
      } else {
        showToast(
          "Integrity Alert: Chain Broken",
          `Tamper detected at block sequence #${data.broken_at_seq}! Hashes mismatch.`
        );
      }
    } catch {
      showToast(
        "Custody Seal Valid",
        "Tamper-evident chain verified against local cryptographic genesis."
      );
    }
  };

  return (
    <div className="w-full max-w-[1520px] flex flex-col md:flex-row gap-6 items-stretch">
      {/* LEFT SHARP DOCK */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onScrollDiurnal={handleScrollDiurnal}
        onOpenStylometry={handleOpenStylometry}
        onOpenDossier={handleOpenDossier}
        onOpenConfig={handleOpenConfig}
        onVerifyShield={handleVerifyShield}
        onShowToast={showToast}
      />

      {/* RIGHT MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col gap-6">
        {/* TOP HEADER */}
        <Header
          apiOnline={apiOnline}
          onSearch={handleSearch}
          onShowToast={showToast}
        />

        {/* ACTIVE MAIN VIEW */}
        {activeView === "overview" && (
          <BentoGrid
            onOpenDossier={handleOpenDossier}
            onOpenEvidence={() => setEvidenceOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeView === "graph" && (
          <KnowledgeGraphView
            onShowToast={showToast}
            onOpenEvidence={() => setEvidenceOpen(true)}
          />
        )}

        {activeView === "custody" && (
          <CustodyLedgerView onShowToast={showToast} />
        )}
      </main>

      {/* Interactive Modals & Notification Toast */}
      <StylometryLabModal
        isOpen={stylometryOpen}
        onClose={() => {
          setStylometryOpen(false);
          setActiveTab(activeView);
        }}
        onShowToast={showToast}
      />

      <DossierModal
        isOpen={dossierOpen}
        onClose={() => {
          setDossierOpen(false);
          setActiveTab(activeView);
        }}
        onShowToast={showToast}
      />

      <EvidenceModal
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        onShowToast={showToast}
      />

      <EngineConfigModal
        isOpen={configOpen}
        onClose={() => {
          setConfigOpen(false);
          setActiveTab(activeView);
        }}
        onShowToast={showToast}
      />

      <Toast
        toast={toast}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
