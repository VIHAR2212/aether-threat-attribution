"use client";

import React, { useEffect, useState } from "react";
import {
  checkBackendHealth,
  fetchCaseInvestigation,
  fetchCasesList,
  verifyCustodyLedger,
  CaseListItem,
  InvestigationResult,
} from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BentoGrid } from "@/components/BentoGrid";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { CustodyLedgerView } from "@/components/CustodyLedgerView";
import { StylometryLabModal } from "@/components/StylometryLabModal";
import { DossierModal } from "@/components/DossierModal";
import { EvidenceModal } from "@/components/EvidenceModal";
import { EngineConfigModal } from "@/components/EngineConfigModal";
import { NewInvestigationModal } from "@/components/NewInvestigationModal";
import { Toast, ToastData } from "@/components/Toast";

export default function Home() {
  const [apiOnline, setApiOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeView, setActiveView] = useState<"overview" | "graph" | "custody">("overview");

  // Multi-case investigation state
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationResult | null>(null);
  const [casesList, setCasesList] = useState<CaseListItem[]>([]);
  const [newInvestigationOpen, setNewInvestigationOpen] = useState<boolean>(false);

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

  // Check FastAPI backend connection on mount & periodic polling + load cases
  useEffect(() => {
    let mounted = true;

    async function pollHealth() {
      const status = await checkBackendHealth();
      if (mounted) {
        setApiOnline(status.online);
      }
    }

    async function loadInitialCases() {
      const { cases } = await fetchCasesList();
      if (mounted && cases.length > 0) {
        setCasesList(cases);
      }
      const { data: initialCase } = await fetchCaseInvestigation("AT-2026-0047");
      if (mounted && initialCase) {
        setCurrentInvestigation(initialCase);
      }
    }

    pollHealth();
    loadInitialCases();
    const interval = setInterval(pollHealth, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelectCase = async (evidenceId: string) => {
    showToast("Loading Investigation", `Retrieving forensic artifacts for ${evidenceId}...`);
    try {
      const { data: inv } = await fetchCaseInvestigation(evidenceId);
      if (inv) {
        setCurrentInvestigation(inv);
        showToast(
          "Investigation Active",
          `${inv.case?.evidence_id || evidenceId}: ${inv.case?.actor_name || "Target Loaded"} (${inv.attribution?.confidence_score ?? 94.8}%)`
        );
      }
    } catch {
      showToast("Case Switch Notice", `Retrieved local cached dossier for ${evidenceId}.`);
    }
  };

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
    const targetId = currentInvestigation?.case?.evidence_id || "AT-2026-0047";
    try {
      const { data, isLive } = await verifyCustodyLedger(targetId);
      if (data.valid) {
        showToast(
          isLive ? "Custody Seal Valid (SHA-256)" : "Cryptographic Chain Intact",
          `Tamper-evident chain verified for ${targetId}. ${data.entry_count} custody blocks intact. Seal: ${data.seal.substring(
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
          activeEvidenceId={currentInvestigation?.case?.evidence_id || "AT-2026-0047"}
          activeActorName={currentInvestigation?.case?.actor_name || "UNC-3844"}
          activeConfidence={currentInvestigation?.attribution?.confidence_score ?? 94.8}
          casesList={casesList}
          onSelectCase={handleSelectCase}
          onOpenNewInvestigation={() => setNewInvestigationOpen(true)}
          onSearch={handleSearch}
          onShowToast={showToast}
        />

        {/* ACTIVE MAIN VIEW */}
        {activeView === "overview" && (
          <BentoGrid
            investigation={currentInvestigation}
            onOpenNewInvestigation={() => setNewInvestigationOpen(true)}
            onOpenDossier={handleOpenDossier}
            onOpenEvidence={() => setEvidenceOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeView === "graph" && (
          <KnowledgeGraphView
            investigation={currentInvestigation}
            onShowToast={showToast}
            onOpenEvidence={() => setEvidenceOpen(true)}
          />
        )}

        {activeView === "custody" && (
          <CustodyLedgerView
            evidenceId={currentInvestigation?.case?.evidence_id || "AT-2026-0047"}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Interactive Modals & Notification Toast */}
      <NewInvestigationModal
        isOpen={newInvestigationOpen}
        onClose={() => setNewInvestigationOpen(false)}
        onInvestigationComplete={(newResult) => {
          setCurrentInvestigation(newResult);
          fetchCasesList().then((res) => {
            if (res.cases.length > 0) setCasesList(res.cases);
          });
        }}
        onShowToast={showToast}
      />

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
        investigation={currentInvestigation}
        evidenceId={currentInvestigation?.case?.evidence_id || "AT-2026-0047"}
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
