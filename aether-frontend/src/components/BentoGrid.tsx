"use client";

import React, { useState } from "react";
import {
  runDiurnalAnalysis,
  runStylometryAnalysis,
} from "@/lib/api";

interface BentoGridProps {
  onOpenDossier: () => void;
  onOpenEvidence: () => void;
  onShowToast: (title: string, message: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  onOpenDossier,
  onOpenEvidence,
  onShowToast,
}) => {
  const [stylometryScore, setStylometryScore] = useState("93.4%");
  const [operationalOffset, setOperationalOffset] = useState("UTC +05:30");
  const [activeFilter, setActiveFilter] = useState<"monthly" | "circadian">("circadian");
  const [evaluatingStylo, setEvaluatingStylo] = useState(false);

  // Run live Stylometry Evaluation
  const handleStylometryEval = async () => {
    setEvaluatingStylo(true);
    try {
      const textA =
        "We operate high volume ransom payment gateways on dread. Full escrow guaranteed with PGP.";
      const textB =
        "We run high volume payment portals on exploit with fast escrow and PGP settlement.";
      const { data, isLive } = await runStylometryAnalysis(textA, textB);
      const scorePct = (data.similarity_score * 100).toFixed(1) + "%";
      setStylometryScore(scorePct);
      onShowToast(
        isLive ? "FastAPI Stylometry Live" : "Stylometry Evaluated (Offline Buffer)",
        `Cosine similarity: ${scorePct} (Char 3-gram: ${(data.breakdown.char_3gram_cosine * 100).toFixed(1)}%).`
      );
    } catch {
      onShowToast("Stylometry Buffer", "Processed token embeddings via client-side fallback.");
    } finally {
      setEvaluatingStylo(false);
    }
  };

  // Run live Diurnal Circadian analysis
  const handleDiurnalEval = async () => {
    setActiveFilter("circadian");
    try {
      const { data, isLive } = await runDiurnalAnalysis();
      const offset = data.estimated_timezone.formatted_offset;
      setOperationalOffset(offset);
      onShowToast(
        isLive ? "FastAPI Diurnal Engine" : "Circadian Model Active",
        `Sleep trough detected (22:00-04:00 UTC). Inferred offset: ${offset} (${data.estimated_timezone.candidate_regions[0]}).`
      );
    } catch {
      onShowToast("Diurnal Model", "UTC diurnal sleep curve active (03:00 - 09:00 sleep trough).");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* STAT CARD 1: SOCKS5 Active Crawlers */}
      <div className="matte-card p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Probes
          </p>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            14 <span className="text-xs font-normal text-slate-400 font-sans">Nodes</span>
          </h3>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-1">
            <i className="fa-solid fa-network-wired text-[10px] text-slate-400"></i> SOCKS5 Stem Online
          </span>
        </div>
        {/* Sharp Neutral Mini Bar Sparkline */}
        <div className="flex items-end gap-1.5 h-9 px-1">
          <div className="w-1.5 bg-[#1a212d] h-3"></div>
          <div className="w-1.5 bg-[#232c3c] h-5"></div>
          <div className="w-1.5 bg-[#2e3b4f] h-8"></div>
          <div className="w-1.5 bg-[#3c4c66] h-6"></div>
          <div className="w-1.5 bg-[#526685] h-9"></div>
        </div>
      </div>

      {/* STAT CARD 2: Resolved Threat Personas */}
      <div className="matte-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#161d28] border border-[#273447] text-slate-200 flex items-center justify-center text-base">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Attributed Entities
            </p>
            <h3 className="text-2xl font-bold text-white mt-0.5 font-mono">
              321 <span className="text-xs font-normal text-slate-400 font-sans">Actors</span>
            </h3>
          </div>
        </div>
        {/* Solid Clean Vector Line (Neutral Steel) */}
        <svg
          className="w-16 h-7 text-slate-400 stroke-current fill-none stroke-[2]"
          viewBox="0 0 60 25"
        >
          <path d="M2 18 Q 15 22 28 12 T 58 4" strokeLinecap="square" />
        </svg>
      </div>

      {/* STAT CARD 3: Cryptographic Anchors Harvested */}
      <div className="matte-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#161d28] border border-[#273447] text-slate-200 flex items-center justify-center text-base">
            <i className="fa-solid fa-key"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              PGP &amp; Wallet Keys
            </p>
            <h3 className="text-2xl font-bold text-white mt-0.5 font-mono">1,482</h3>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-[#141a24] border border-[#263245] text-slate-300 font-mono">
          +48 today
        </span>
      </div>

      {/* STAT CARD 4: Sharp Industrial Steel Slate Card */}
      <div className="bg-[#141a24] p-5 border border-[#263245] text-white flex items-center justify-between relative overflow-hidden">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Confidence Index
          </p>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            94.8% <span className="text-xs font-normal text-slate-400 font-sans">Score</span>
          </h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mt-1">
            <i className="fa-solid fa-check-double text-slate-400"></i> Subpoena Verified
          </span>
        </div>
        {/* Clean Solid Vector Curve */}
        <svg
          className="w-20 h-10 text-slate-400 stroke-current fill-none stroke-[2.5]"
          viewBox="0 0 80 35"
        >
          <path d="M2 20 Q 20 2 40 20 T 78 15" strokeLinecap="square" />
        </svg>
      </div>

      {/* MIDDLE ROW 1: Wide Temporal & Diurnal Timeline Chart */}
      <div className="matte-card p-6 lg:col-span-2 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              Diurnal Activity &amp; Circadian Timeline
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-[#141a24] text-slate-300 border border-[#263245] flex items-center gap-1.5 font-mono">
              Telemetry Stream
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                setActiveFilter("monthly");
                onShowToast(
                  "Monthly Filter",
                  "Displaying aggregated 30-day darknet activity clusters."
                );
              }}
              className={`px-3 py-1 transition border ${
                activeFilter === "monthly"
                  ? "bg-[#1e2736] font-semibold text-white border-[#303d52]"
                  : "bg-[#141a24] text-slate-300 hover:bg-[#1c2432] border-[#263245]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={handleDiurnalEval}
              className={`px-3 py-1 transition border ${
                activeFilter === "circadian"
                  ? "bg-[#1e2736] font-semibold text-white border-[#303d52]"
                  : "bg-[#141a24] text-slate-300 hover:bg-[#1c2432] border-[#263245]"
              }`}
            >
              UTC Circadian
            </button>
          </div>
        </div>

        {/* Mini Stats Over Chart */}
        <div className="flex flex-wrap gap-4 mb-3">
          <button
            onClick={handleStylometryEval}
            disabled={evaluatingStylo}
            className="bg-[#090b10] border border-[#1a212d] hover:border-[#2e3c50] p-3 flex-1 min-w-[140px] text-left transition group"
            title="Click to run live stylometry evaluation"
          >
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Stylometric Similarity</span>
              <i className="fa-solid fa-arrows-rotate text-[10px] text-slate-500 group-hover:text-slate-300 transition"></i>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-white font-mono">
                {evaluatingStylo ? "..." : stylometryScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">+4.2% match</span>
            </div>
          </button>

          <button
            onClick={handleDiurnalEval}
            className="bg-[#090b10] border border-[#1a212d] hover:border-[#2e3c50] p-3 flex-1 min-w-[140px] text-left transition group"
            title="Click to re-compute diurnal timezone"
          >
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Target Operational Offset</span>
              <i className="fa-solid fa-clock text-[10px] text-slate-500 group-hover:text-slate-300 transition"></i>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-white font-mono">{operationalOffset}</span>
              <span className="text-xs font-semibold text-[#f87171]">Sleep: 03:00-09:00</span>
            </div>
          </button>
        </div>

        {/* Diurnal Sleep Curve SVG */}
        <div className="relative h-36 w-full mt-2">
          <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
            {/* Dark Graph Base Fill */}
            <path
              d="M 0,90 Q 60,115 120,105 T 240,30 T 360,95 T 480,25 T 600,60 L 600,140 L 0,140 Z"
              fill="#0e141d"
            />
            {/* Solid Graph Line */}
            <path
              d="M 0,90 Q 60,115 120,105 T 240,30 T 360,95 T 480,25 T 600,60"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="square"
            />

            {/* Red Marker for Sleep Window */}
            <rect x="76" y="106" width="8" height="8" fill="#dc2626" stroke="#000000" strokeWidth="1.5" />
            <text
              x="60"
              y="130"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              fill="#f87171"
            >
              Sleep Window
            </text>

            {/* Green Marker & Peak Line */}
            <path
              d="M 420,35 Q 450,25 480,25 T 510,35"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="square"
            />
            <rect x="476" y="21" width="8" height="8" fill="#22c55e" stroke="#000000" strokeWidth="1.5" />
            <text
              x="430"
              y="15"
              fontSize="10"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
              fill="#22c55e"
            >
              Peak Activity
            </text>
          </svg>
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 px-1">
          <span>00:00 UTC</span>
          <span>06:00 UTC</span>
          <span>12:00 UTC</span>
          <span>18:00 UTC</span>
          <span>23:59 UTC</span>
        </div>
      </div>

      {/* MIDDLE ROW 2: Semi-Gauge Card */}
      <div className="matte-card p-6 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Attribution Confidence
          </span>
          <p className="text-xs text-slate-400 mt-0.5">Composite Engine Formula (C_attr)</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">94.8%</h3>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Proof: PGP Fingerprint + Origin IP
          </p>
        </div>

        {/* Gauge SVG (Green used ONLY on graph score arc) */}
        <div className="relative flex flex-col items-center justify-center my-2">
          <svg className="w-48 h-28" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1f2735"
              strokeWidth="15"
              strokeLinecap="square"
            />
            {/* Green Graph Arc (85% Fill) */}
            <path
              d="M 20 100 A 80 80 0 0 1 165 52"
              fill="none"
              stroke="#22c55e"
              strokeWidth="15"
              strokeLinecap="square"
            />
          </svg>
          <div className="absolute bottom-2 flex flex-col items-center">
            <span className="text-2xl font-black text-white font-mono">94.8%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verified Match
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-[#1e2533]">
          <span className="text-slate-400">Contradiction Penalty</span>
          <span className="font-mono text-slate-300">0.0% (No conflicts)</span>
        </div>
      </div>

      {/* MIDDLE ROW 3: Suspect Profile Card */}
      <div className="matte-card p-6 flex flex-col items-center text-center justify-between">
        <div className="flex flex-col items-center">
          {/* Suspect Avatar */}
          <div className="w-16 h-16 bg-[#12161f] p-2 mb-3 relative border border-[#273447]">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=ShadowByte"
              alt="Actor Avatar"
              className="w-12 h-12"
            />
          </div>
          <h3 className="text-lg font-bold text-white">ZeroTrace (APT-091)</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">zerotrace@dread.onion</p>

          <span className="inline-block mt-2 text-[11px] font-bold px-3 py-1 bg-[#2a1215] text-[#f87171] border border-[#4a1f24]">
            ALERT: Primary Ransomware Operator
          </span>
        </div>

        {/* 3 Column Metrics */}
        <div className="grid grid-cols-3 gap-2 w-full pt-4 mt-4 border-t border-[#1e2533]">
          <div>
            <p className="text-xs text-slate-400 font-medium">Aliases</p>
            <h4 className="text-base font-bold text-white font-mono mt-0.5">7</h4>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Wallets</p>
            <h4 className="text-base font-bold text-white font-mono mt-0.5">14</h4>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">PGP Keys</p>
            <h4 className="text-base font-bold text-white font-mono mt-0.5">2</h4>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW 1: 3D Stacked Cryptographic Anchors */}
      <div className="matte-card p-6 lg:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Cryptographic Anchor Chain</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Deterministic mathematical linkages extracted across darknet market databases.
            Cross-references 40-character PGP fingerprints directly to co-spent Bitcoin clusters
            and discovered clearnet origin IPs.
          </p>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <button
              onClick={onOpenEvidence}
              className="px-5 py-2.5 bg-[#1e2736] hover:bg-[#283448] text-white text-xs font-bold tracking-wide transition flex items-center gap-2 border border-[#37455d]"
            >
              <i className="fa-solid fa-plus text-[11px]"></i> Add Evidence Anchor
            </button>
            <button
              onClick={() =>
                onShowToast(
                  "Neo4j Node Inspector",
                  "Querying STIX 2.1 schema for Actor APT-091 via /api/analysis/graph..."
                )
              }
              className="px-4 py-2.5 bg-[#121721] hover:bg-[#18202d] text-slate-300 border border-[#232d3d] text-xs font-semibold transition"
            >
              Inspect Neo4j Node
            </button>
          </div>
        </div>

        {/* 3D Stacked Sharp Cards Mockup */}
        <div className="relative w-64 h-48 flex items-center justify-center shrink-0">
          {/* Card 3 (Bottom) */}
          <div className="absolute w-52 h-32 bg-[#12161f] text-white p-3.5 floating-card-3d border border-[#4a1f24] translate-y-6">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>FAVICON MURMURHASH3</span>
              <i className="fa-solid fa-triangle-exclamation text-[#f87171]"></i>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#f87171]">
              IP: 185.220.101.42
            </div>
            <div className="text-[9px] text-slate-400 mt-1 font-mono">
              Hash: -129482710 (Shodan Match)
            </div>
          </div>

          {/* Card 2 (Middle) */}
          <div className="absolute w-52 h-32 bg-[#161d28] text-white p-3.5 floating-card-3d border border-[#2c3749] translate-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono">
              <span>BITCOIN PEEL CHAIN</span>
              <i className="fa-brands fa-bitcoin text-slate-400"></i>
            </div>
            <div className="mt-4 font-mono text-[11px] font-bold text-slate-200">
              1A1zP1...Cluster (14 Addr)
            </div>
            <div className="text-[9px] text-slate-400 mt-1">Off-ramp: VASP Exchange Deposit</div>
          </div>

          {/* Card 1 (Top) */}
          <div className="absolute w-52 h-32 bg-[#1b2331] text-white p-3.5 floating-card-3d border border-[#394860] -translate-y-3">
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono">
              <span>PGP PUBLIC KEY (40-CHAR)</span>
              <i className="fa-solid fa-lock text-slate-400"></i>
            </div>
            <div className="mt-4 font-mono text-xs font-bold tracking-wider text-white">
              4D9E 27BC ... F980
            </div>
            <div className="flex justify-between items-end mt-2 text-[9px] text-slate-300 font-mono">
              <span>ZeroTrace ↔ ShadowByte</span>
              <span className="text-white font-bold">100% MATCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW 2: Recent Attribution Activity */}
      <div className="matte-card p-6 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-white">Recent Discoveries</h3>
          <span className="text-[11px] font-mono font-semibold text-slate-400">Live Tor Stream</span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Item 1 */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#1e2533]">
            <div>
              <p className="text-xs font-bold text-slate-200">Origin IP Unmasked</p>
              <p className="text-[10px] text-slate-400 font-mono">Apache /server-status leak</p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#2a1215] text-[#f87171] border border-[#4a1f24]">
              +185.220.x.x
            </span>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#1e2533]">
            <div>
              <p className="text-xs font-bold text-slate-200">Alias Rebrand Linked</p>
              <p className="text-[10px] text-slate-400 font-mono">Siamese RoBERTa (0.93 sim)</p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#161d28] text-slate-200 border border-[#273447]">
              ShadowByte
            </span>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between py-1.5">
            <div>
              <p className="text-xs font-bold text-slate-200">VASP Cash-out Tagged</p>
              <p className="text-[10px] text-slate-400 font-mono">Co-spent Bitcoin cluster</p>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#161d28] text-slate-200 border border-[#273447]">
              3.42 BTC
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            onShowToast(
              "Telemetry Logs",
              "Loaded all 48 background descriptors from Tor/SOCKS5 crawler."
            )
          }
          className="w-full mt-2 py-2 text-xs font-semibold text-slate-400 hover:text-white transition text-center border-t border-[#1e2533]"
        >
          View All 48 Telemetry Logs →
        </button>
      </div>

      {/* BOTTOM ROW 3: Subpoena & Forensic Export */}
      <div className="matte-card p-6 flex flex-col items-center text-center justify-between">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-[#161d28] border border-[#273447] text-slate-200 flex items-center justify-center text-2xl mb-2">
            <i className="fa-solid fa-fingerprint"></i>
          </div>
          <h3 className="text-base font-bold text-white">Courtroom Ready</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
            Export verified STIX 2.1 JSON and SHA-256 sealed PDF forensic dossiers for judicial
            submission.
          </p>
        </div>

        <button
          onClick={onOpenDossier}
          className="w-full mt-4 py-3 bg-[#1e2736] hover:bg-[#283448] text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 border border-[#37455d]"
        >
          <i className="fa-solid fa-file-shield text-sm"></i> Export Forensic Dossier
        </button>
      </div>
    </div>
  );
};
