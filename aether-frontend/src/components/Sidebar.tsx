"use client";

import React from "react";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onScrollDiurnal: () => void;
  onOpenStylometry: () => void;
  onOpenDossier: () => void;
  onOpenConfig: () => void;
  onVerifyShield: () => void;
  onShowToast: (title: string, message: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onScrollDiurnal,
  onOpenStylometry,
  onOpenDossier,
  onOpenConfig,
  onVerifyShield,
  onShowToast,
}) => {
  const isOverview = activeTab === "overview";
  const isGraph = activeTab === "graph";
  const isCircadian = activeTab === "circadian";
  const isStylo = activeTab === "stylometry";
  const isSuspects = activeTab === "suspects";
  const isCustody = activeTab === "custody";
  const isConfig = activeTab === "config";
  const isShield = activeTab === "shield";

  return (
    <aside className="flex md:flex-col items-center justify-between bg-[#0d1017] py-4 px-3 md:py-6 md:px-3.5 border border-[#1e2533] shrink-0 self-center md:self-stretch z-20">
      {/* Logo & Primary Nav */}
      <div className="flex flex-col items-center gap-6">
        {/* Icon 1: Overview (Stage 01) */}
        <button
          onClick={() => {
            onSelectTab("overview");
            onShowToast(
              "Stage 01: Overview Active",
              "Viewing dark web recon telemetry & forensic indicators."
            );
          }}
          className={`w-11 h-11 flex items-center justify-center transition group relative ${
            isOverview
              ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
              : "bg-[#161d28] text-slate-400 hover:text-slate-200 border border-[#273447] hover:bg-[#1e2736]"
          }`}
          title="Stage 01: Overview"
        >
          <i className="fa-solid fa-shapes text-base"></i>
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2.5 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
            Overview (Stage 01)
          </span>
        </button>

        {/* Primary Nav Icons */}
        <nav className="flex md:flex-col items-center gap-3">
          {/* Icon 2: STIX 2.1 Graph (Stage 02) */}
          <button
            onClick={() => {
              onSelectTab("graph");
              onShowToast(
                "Stage 02: STIX 2.1 Graph",
                "Loading interactive entity knowledge graph..."
              );
            }}
            className={`w-10 h-10 flex items-center justify-center transition relative group ${
              isGraph
                ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
            }`}
            title="Stage 02: STIX 2.1 Graph"
          >
            <i className="fa-solid fa-diagram-project text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
              STIX 2.1 Graph (Stage 02)
            </span>
          </button>

          {/* Icon 3: Circadian Timezone Engine */}
          <button
            onClick={onScrollDiurnal}
            className={`w-10 h-10 flex items-center justify-center transition relative group ${
              isCircadian
                ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
            }`}
            title="Circadian Timezone Engine"
          >
            <i className="fa-solid fa-chart-simple text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
              Diurnal Circadian Engine
            </span>
          </button>

          {/* Icon 4: AI Stylometry Lab */}
          <button
            onClick={onOpenStylometry}
            className={`w-10 h-10 flex items-center justify-center transition relative group ${
              isStylo
                ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
            }`}
            title="AI Stylometry Lab"
          >
            <i className="fa-solid fa-fingerprint text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
              AI Stylometry Lab
            </span>
          </button>

          {/* Icon 5: Threat Actors Dossier */}
          <button
            onClick={onOpenDossier}
            className={`w-10 h-10 flex items-center justify-center transition relative group ${
              isSuspects
                ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
            }`}
            title="Target Suspect Dossier"
          >
            <i className="fa-solid fa-users-viewfinder text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
              Target Suspect Dossier
            </span>
          </button>

          {/* Icon 6: Chain of Custody Ledger (Stage 03) */}
          <button
            onClick={() => {
              onSelectTab("custody");
              onShowToast(
                "Stage 03: Custody Ledger",
                "Displaying tamper-evident SHA-256 custody chain."
              );
            }}
            className={`w-10 h-10 flex items-center justify-center transition relative group ${
              isCustody
                ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
            }`}
            title="Stage 03: Chain of Custody"
          >
            <i className="fa-regular fa-clock text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
              Custody Ledger (Stage 03)
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Settings & Profile */}
      <div className="flex md:flex-col items-center gap-3">
        {/* Icon 7: Engine Config */}
        <button
          onClick={onOpenConfig}
          className={`w-10 h-10 flex items-center justify-center transition relative group ${
            isConfig
              ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
          }`}
          title="Engine Configuration"
        >
          <i className="fa-solid fa-sliders text-sm"></i>
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
            Engine Config (Tor/FastAPI)
          </span>
        </button>

        {/* Icon 8: Security & Custody Verification */}
        <button
          onClick={onVerifyShield}
          className={`w-10 h-10 flex items-center justify-center transition relative group ${
            isShield
              ? "bg-[#1e2736] text-white border border-[#37455d] shadow-[0_0_12px_rgba(55,69,93,0.35)]"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447]"
          }`}
          title="Verify SHA-256 Ledger Integrity"
        >
          <i className="fa-solid fa-shield-halved text-sm"></i>
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
            Verify SHA-256 Ledger
          </span>
        </button>

        {/* Officer Avatar */}
        <button
          onClick={() =>
            onShowToast(
              "Officer Credentials",
              "Lead Cyber Forensics Officer (ID: NTRO-26151-INV01). Clearance: TOP SECRET."
            )
          }
          className="w-10 h-10 overflow-hidden border border-[#273447] hover:border-[#37455d] mt-2 bg-[#12161f] transition relative group"
          title="Lead Investigator Profile"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            alt="Lead Investigator"
            className="w-full h-full object-cover grayscale contrast-125"
          />
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 font-mono">
            Lead Investigator
          </span>
        </button>
      </div>
    </aside>
  );
};
