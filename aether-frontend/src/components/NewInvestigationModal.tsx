"use client";

import React, { useState } from "react";
import { InvestigationRequest, InvestigationResult, startInvestigation } from "@/lib/api";

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvestigationComplete: (result: InvestigationResult) => void;
  onShowToast: (title: string, message: string) => void;
}

const PRESETS = [
  {
    name: "Dread Marketplace (.onion)",
    badge: "TOR V3 ONION",
    caseName: "Operation Chimera",
    target: "http://p4lx7e22kq6dreadmarket.onion",
    targetType: "onion",
    actorName: "UNC-3844 (ZeroTrace)",
    knownPgp: "4D9E 27BC 918A 4F02 C731 09AE 2C5B 88E1 40FA 7D3C",
    knownBtc: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    textSample: "We operate high volume ransom payment gateways on dread. Full escrow guaranteed with PGP.",
  },
  {
    name: "Unmasked Clearnet Origin (IPv4)",
    badge: "CLEARNET HOST",
    caseName: "Operation Ironclad",
    target: "185.220.101.42",
    targetType: "ip",
    actorName: "ShadowByte",
    knownPgp: "4D9E 27BC 918A 4F02 C731 09AE 2C5B 88E1 40FA 7D3C",
    knownBtc: "bc1qa5wkgaew2dkv56kfvj49j0av5nqvrl529w40b5",
    textSample: "We run high volume payment portals on exploit with fast escrow and PGP settlement.",
  },
  {
    name: "Darknet Portal (Domain)",
    badge: "REBRANDED DOMAIN",
    caseName: "Operation Parallax Prime",
    target: "darknet-market-portal.org",
    targetType: "domain",
    actorName: "VortexBroker",
    knownPgp: "4B8F 90A2 E83C 1204 D76A 58B9 2F10 CC49 E81A 9044",
    knownBtc: "1FvzCLoTPGANNjWoUo6jUGuAG3wg1w4YjR",
    textSample: "New mirrors live. All accounts migrated securely. Verify with our PGP signature.",
  },
];

const ANALYSIS_MODULES = [
  { name: "Favicon MurmurHash3 32-bit", desc: "Computing mmh3_32 and matching Shodan facet http.favicon.hash" },
  { name: "Stylometry NLP Cosine Engine", desc: "Vectorizing char 3-gram and word n-grams against threat actor corpus" },
  { name: "RFC 4880 PGP Fingerprint", desc: "Normalizing 40-char V4 key ID & checking cross-forum deterministic reuse" },
  { name: "Infrastructure Origin Discovery", desc: "Probing clearnet host IP, ASN, Geolocation, and /server-status leak" },
  { name: "JARM Active TLS Fingerprinting", desc: "Matching 62-char JARM fingerprint against known C2 and onion proxies" },
  { name: "Bitcoin Peel-Chain Clustering", desc: "Running multi-input co-spend heuristics across 14 transaction outputs" },
  { name: "Diurnal Circadian Sleep Trough", desc: "Evaluating 24h UTC posting distribution to calculate operational offset" },
  { name: "Public OSINT Ingestion", desc: "Querying Shodan/Censys with strict LIVE / DEMO / UNAVAILABLE provenance" },
  { name: "Perceptual Visual Logo dHash", desc: "Calculating 64-bit difference hash and Hamming distance for branding leads" },
  { name: "Cryptographic Custody Sealing", desc: "Generating SHA-256 tamper-evident ledger blocks from genesis hash" },
];

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onInvestigationComplete,
  onShowToast,
}) => {
  const [caseName, setCaseName] = useState("Operation Chimera");
  const [evidenceId, setEvidenceId] = useState(`AT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [actorName, setActorName] = useState("UNC-3844");
  const [target, setTarget] = useState("http://p4lx7e22kq6dreadmarket.onion");
  const [targetType, setTargetType] = useState("onion");
  const [knownPgp, setKnownPgp] = useState("4D9E 27BC 918A 4F02 C731 09AE 2C5B 88E1 40FA 7D3C");
  const [knownBtc, setKnownBtc] = useState("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
  const [textSample, setTextSample] = useState(
    "We operate high volume ransom payment gateways on dread. Full escrow guaranteed with PGP."
  );
  const [mode, setMode] = useState("auto");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Analysis running animation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  if (!isOpen) return null;

  const handleApplyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setCaseName(p.caseName);
    setTarget(p.target);
    setTargetType(p.targetType);
    setActorName(p.actorName);
    setKnownPgp(p.knownPgp);
    setKnownBtc(p.knownBtc);
    setTextSample(p.textSample);
    setEvidenceId(`AT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    onShowToast("Preset Loaded", `Configured investigation for ${p.name}.`);
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) {
      onShowToast("Target Required", "Please enter a target domain, IP, URL, or onion descriptor.");
      return;
    }

    setIsAnalyzing(true);
    setActiveModuleIndex(0);

    // Step-by-step progress simulation while calling backend
    const progressInterval = setInterval(() => {
      setActiveModuleIndex((prev) => {
        if (prev < ANALYSIS_MODULES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    try {
      const payload: InvestigationRequest = {
        case_name: caseName.trim() || "Operation AETHER",
        evidence_id: evidenceId.trim(),
        actor_name: actorName.trim() || "UNC-3844",
        target: target.trim(),
        target_type: targetType,
        known_pgp: knownPgp.trim() || undefined,
        known_btc: knownBtc.trim() || undefined,
        text_sample: textSample.trim() || undefined,
        mode,
      };

      const { data, isLive } = await startInvestigation(payload);

      // Finish progress animation
      clearInterval(progressInterval);
      setActiveModuleIndex(ANALYSIS_MODULES.length - 1);

      setTimeout(() => {
        setIsAnalyzing(false);
        onInvestigationComplete(data);
        onShowToast(
          isLive ? "Live Investigation Complete" : "Forensic Investigation Sealed",
          `Case ${data.case.evidence_id}: Attributed to ${data.case.actor_name} (${data.attribution.confidence_score}% Confidence).`
        );
        onClose();
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      onShowToast("Analysis Error", "Failed to complete investigation pipeline.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0d14] border border-[#273447] max-w-2xl w-full max-h-[92vh] overflow-y-auto text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2736] flex items-center justify-between bg-[#0e131d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#161d28] border border-[#2e3e57] text-white flex items-center justify-center text-base">
              <i className="fa-solid fa-crosshairs text-sky-400"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight font-mono">
                  NEW INVESTIGATION
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#141d2b] text-sky-300 border border-[#203652]">
                  NTRO FORENSIC PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                De-anonymize target infrastructure, run 9 forensic modules &amp; build custody chain.
              </p>
            </div>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#141b26] text-slate-400 hover:text-white border border-[#232f42] flex items-center justify-center transition"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
        </div>

        {isAnalyzing ? (
          /* Live Progress Inspection Mode */
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#102438] text-sky-300 border border-[#1e4670] text-xs font-mono font-bold animate-pulse">
                <span className="w-2 h-2 bg-sky-400"></span>
                RUNNING MULTI-VECTOR ATTRIBUTION ENGINE
              </div>
              <h3 className="text-lg font-bold text-white font-mono">{caseName}</h3>
              <p className="text-xs text-slate-400 font-mono">Target: {target}</p>
            </div>

            {/* Step Pipeline List */}
            <div className="space-y-2 font-mono text-xs bg-[#06080d] p-4 border border-[#1a2230]">
              {ANALYSIS_MODULES.map((mod, idx) => {
                const isCurrent = idx === activeModuleIndex;
                const isDone = idx < activeModuleIndex;
                return (
                  <div
                    key={mod.name}
                    className={`p-2.5 flex items-center justify-between border transition ${
                      isCurrent
                        ? "bg-[#102133] border-sky-500/70 text-white"
                        : isDone
                        ? "bg-[#0a1017] border-[#182637] text-slate-300"
                        : "bg-transparent border-transparent text-slate-600 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-[11px] text-slate-400">
                        {isDone ? (
                          <i className="fa-solid fa-check text-emerald-400"></i>
                        ) : isCurrent ? (
                          <i className="fa-solid fa-gear fa-spin text-sky-400"></i>
                        ) : (
                          `0${idx + 1}`
                        )}
                      </span>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{mod.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-sky-900/60 text-sky-300 border border-sky-700">
                              PROBING
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{mod.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {isDone ? "VERIFIED" : isCurrent ? "ACTIVE" : "QUEUED"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[11px] font-mono text-slate-400">
              Generating tamper-evident SHA-256 custody blocks and STIX 2.1 entities...
            </div>
          </div>
        ) : (
          /* Form Input Mode */
          <form onSubmit={handleStartAnalysis} className="p-6 space-y-5">
            {/* Presets Quick Chips */}
            <div>
              <label className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-2">
                Quick Preset Targets (Click to Populate):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(idx)}
                    className="p-2.5 text-left bg-[#0e131d] hover:bg-[#141b29] border border-[#202c3e] hover:border-[#354966] transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#172130] text-sky-400 border border-[#2a3c56]">
                        {p.badge}
                      </span>
                      <i className="fa-solid fa-arrow-right text-[10px] text-slate-500 group-hover:text-sky-400 transition"></i>
                    </div>
                    <div className="font-bold text-xs text-white mt-1.5 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                      {p.target}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Specification */}
            <div className="space-y-4 pt-2 border-t border-[#18202d]">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                  Investigation Target <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center bg-[#07090e] border border-[#273447] focus-within:border-sky-500">
                  <span className="px-3 py-2 text-slate-500 text-xs font-mono border-r border-[#202a3a]">
                    <i className="fa-solid fa-globe"></i>
                  </span>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Domain, IPv4, or .onion URL (e.g. http://p4lx7e22kq6dreadmarket.onion)"
                    className="w-full bg-transparent px-3 py-2 text-xs font-mono text-white outline-none placeholder-slate-600"
                    required
                  />
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="bg-[#121822] text-[11px] font-mono text-slate-300 px-3 py-2 border-l border-[#202a3a] outline-none cursor-pointer"
                  >
                    <option value="onion">Tor Onion (.onion)</option>
                    <option value="ip">IPv4 Host Address</option>
                    <option value="domain">Clearnet Domain</option>
                    <option value="btc">Bitcoin Root Address</option>
                    <option value="pgp">PGP Fingerprint</option>
                  </select>
                </div>
              </div>

              {/* Case Details Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Case Name / Reference
                  </label>
                  <input
                    type="text"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    className="w-full bg-[#07090e] border border-[#273447] px-3 py-2 text-xs font-mono text-white outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Evidence ID (Immutable)
                  </label>
                  <input
                    type="text"
                    value={evidenceId}
                    onChange={(e) => setEvidenceId(e.target.value)}
                    className="w-full bg-[#07090e] border border-[#273447] px-3 py-2 text-xs font-mono text-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    Suspect / Persona Lead
                  </label>
                  <input
                    type="text"
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    className="w-full bg-[#07090e] border border-[#273447] px-3 py-2 text-xs font-mono text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Analysis Mode & Provenance Guarantee */}
            <div className="p-3 bg-[#0d131d] border border-[#1e293a] space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-300">Execution Mode &amp; Provenance Tagging</span>
                <span className="text-[10px] text-sky-400">Strict Non-Deception Rule</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <label
                  className={`p-2 border cursor-pointer text-center transition ${
                    mode === "auto"
                      ? "bg-[#152335] border-sky-500 text-white font-bold"
                      : "bg-[#090d14] border-[#1d2737] text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="auto"
                    checked={mode === "auto"}
                    onChange={(e) => setMode(e.target.value)}
                    className="hidden"
                  />
                  Auto-Detect (Honest)
                </label>
                <label
                  className={`p-2 border cursor-pointer text-center transition ${
                    mode === "live"
                      ? "bg-[#152335] border-sky-500 text-white font-bold"
                      : "bg-[#090d14] border-[#1d2737] text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="live"
                    checked={mode === "live"}
                    onChange={(e) => setMode(e.target.value)}
                    className="hidden"
                  />
                  Live Source Only
                </label>
                <label
                  className={`p-2 border cursor-pointer text-center transition ${
                    mode === "demo"
                      ? "bg-[#152335] border-sky-500 text-white font-bold"
                      : "bg-[#090d14] border-[#1d2737] text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="demo"
                    checked={mode === "demo"}
                    onChange={(e) => setMode(e.target.value)}
                    className="hidden"
                  />
                  Demo Benchmark
                </label>
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                <i className="fa-solid fa-shield-halved text-sky-400 mr-1"></i>
                AETHER does not simulate live intelligence: Results are explicitly tagged{" "}
                <span className="text-emerald-400 font-bold">LIVE SOURCE</span>,{" "}
                <span className="text-amber-400 font-bold">DEMO DATA</span>, or{" "}
                <span className="text-slate-400 font-bold">SOURCE UNAVAILABLE</span>. No single
                indicator proves actor identity.
              </p>
            </div>

            {/* Optional Forensic Leads Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-mono font-bold text-slate-400 hover:text-slate-200 flex items-center gap-2 py-1 transition"
              >
                <i className={`fa-solid fa-chevron-${showAdvanced ? "down" : "right"} text-[10px]`}></i>
                {showAdvanced ? "Hide Advanced Forensic Leads" : "Provide Known Forensic Leads (PGP / BTC / Text Sample)"}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3.5 bg-[#070a10] border border-[#1e2736] space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Known PGP Fingerprint (40-char hex)
                    </label>
                    <input
                      type="text"
                      value={knownPgp}
                      onChange={(e) => setKnownPgp(e.target.value)}
                      placeholder="4D9E 27BC 918A 4F02 C731 09AE 2C5B 88E1 40FA 7D3C"
                      className="w-full bg-[#0d121b] border border-[#222f42] px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Known Bitcoin Root Address (P2PKH / Bech32)
                    </label>
                    <input
                      type="text"
                      value={knownBtc}
                      onChange={(e) => setKnownBtc(e.target.value)}
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa or bc1qa5wk..."
                      className="w-full bg-[#0d121b] border border-[#222f42] px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Suspect Writing Sample (for Stylometry NLP Cosine Engine)
                    </label>
                    <textarea
                      value={textSample}
                      onChange={(e) => setTextSample(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0d121b] border border-[#222f42] p-2 text-xs text-white outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#18202d]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#121721] hover:bg-[#18202d] text-slate-300 text-xs font-mono font-semibold transition border border-[#232f42]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-mono font-bold tracking-wider transition border border-sky-400/50 flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
              >
                <i className="fa-solid fa-play text-[10px]"></i>
                START ANALYSIS
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
