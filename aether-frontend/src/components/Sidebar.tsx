"use client";

import React from "react";

interface SidebarProps {
  onShowToast: (title: string, message: string) => void;
  onOpenStylometry?: () => void;
  onOpenDiurnal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onShowToast,
  onOpenStylometry,
  onOpenDiurnal,
}) => {
  return (
    <aside className="flex md:flex-col items-center justify-between bg-[#0d1017] py-4 px-3 md:py-6 md:px-3.5 border border-[#1e2533] shrink-0 self-center md:self-stretch z-20">
      {/* Logo & Primary Nav */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() =>
            onShowToast(
              "System Overview",
              "Telemetry nodes synchronizing at 127.0.0.1:9050 (Tor Stem)."
            )
          }
          className="w-11 h-11 bg-[#161d28] text-slate-200 border border-[#273447] flex items-center justify-center hover:bg-[#1e2736] transition group relative"
          title="Overview"
        >
          <i className="fa-solid fa-shapes text-base"></i>
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2.5 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Overview
          </span>
        </button>

        {/* Primary Nav Icons (Neutral Steel Tones) */}
        <nav className="flex md:flex-col items-center gap-3">
          <button
            onClick={() =>
              onShowToast(
                "STIX 2.1 Graph Canvas",
                "Loading threat actor entities in Neo4j schema (/api/analysis/graph)..."
              )
            }
            className="w-10 h-10 bg-[#1e2736] text-white border border-[#37455d] flex items-center justify-center relative group"
            title="STIX 2.1 Graph"
          >
            <i className="fa-solid fa-diagram-project text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              STIX 2.1 Graph
            </span>
          </button>

          <button
            onClick={() => {
              if (onOpenDiurnal) onOpenDiurnal();
              else
                onShowToast(
                  "Circadian Timezone Engine",
                  "UTC diurnal distribution model active (/api/analysis/diurnal)."
                );
            }}
            className="w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447] flex items-center justify-center transition relative group"
            title="Circadian Timezone"
          >
            <i className="fa-solid fa-chart-simple text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              Circadian Timezone
            </span>
          </button>

          <button
            onClick={() => {
              if (onOpenStylometry) onOpenStylometry();
              else
                onShowToast(
                  "AI Stylometry Lab",
                  "Character n-gram & cosine similarity active (/api/analysis/stylometry)."
                );
            }}
            className="w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447] flex items-center justify-center transition relative group"
            title="AI Stylometry"
          >
            <i className="fa-solid fa-fingerprint text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              AI Stylometry
            </span>
          </button>

          <button
            onClick={() =>
              onShowToast(
                "Threat Actor Registry",
                "Filtering active darknet syndicate records: ZeroTrace (APT-091)."
              )
            }
            className="w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447] flex items-center justify-center transition relative group"
            title="Threat Actors"
          >
            <i className="fa-solid fa-users-viewfinder text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              Threat Actors
            </span>
          </button>

          <button
            onClick={() =>
              onShowToast(
                "Audit Log Timeline",
                "Temporal event records verified: SHA-256 custody chain intact."
              )
            }
            className="w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447] flex items-center justify-center transition relative group"
            title="Audit Timeline"
          >
            <i className="fa-regular fa-clock text-sm"></i>
            <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              Audit Timeline
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Settings & Profile */}
      <div className="flex md:flex-col items-center gap-3">
        <button
          onClick={() =>
            onShowToast(
              "Engine Settings",
              "SOCKS5 circuit: 127.0.0.1:9050 | FastAPI: http://localhost:8000"
            )
          }
          className="w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447] flex items-center justify-center transition relative group"
          title="Engine Config"
        >
          <i className="fa-solid fa-sliders text-sm"></i>
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Engine Config
          </span>
        </button>

        <button
          onClick={() =>
            onShowToast(
              "Session Protected",
              "Statutory audit ledger locked with SHA-256 seal."
            )
          }
          className="w-10 h-10 text-slate-400 hover:text-slate-200 hover:bg-[#161d28] border border-transparent hover:border-[#273447] flex items-center justify-center transition relative group"
          title="Security Lock"
        >
          <i className="fa-solid fa-shield-halved text-sm"></i>
          <span className="absolute left-16 bg-[#12161f] text-slate-200 border border-[#232c3d] text-xs px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
            Security Lock
          </span>
        </button>

        {/* Officer Avatar */}
        <div className="w-10 h-10 overflow-hidden border border-[#273447] mt-2 bg-[#12161f]">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            alt="Lead Investigator"
            className="w-full h-full object-cover grayscale contrast-125"
          />
        </div>
      </div>
    </aside>
  );
};
