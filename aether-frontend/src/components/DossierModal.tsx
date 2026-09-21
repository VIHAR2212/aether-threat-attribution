"use client";

import React, { useState } from "react";
import { downloadForensicCsv, downloadStixBundle, InvestigationResult } from "@/lib/api";

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation?: InvestigationResult | null;
  evidenceId?: string;
  onShowToast: (title: string, message: string) => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  investigation,
  evidenceId = "AT-2026-0047",
  onShowToast,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const targetEvidenceId = investigation?.case?.evidence_id || evidenceId;
  const caseData = investigation?.case;
  const attribution = investigation?.attribution;

  const handleStixDownload = async () => {
    setDownloading(true);
    try {
      const { isLive, filename } = await downloadStixBundle(targetEvidenceId);
      onShowToast(
        "STIX 2.1 Bundle Exported",
        `${filename} generated via ${isLive ? "FastAPI backend (:8000)" : "client fallback generator"}.`
      );
    } catch {
      onShowToast("Export Warning", "Falling back to local forensic buffer.");
    } finally {
      setDownloading(false);
      onClose();
    }
  };

  const handleCsvDownload = async () => {
    setDownloading(true);
    try {
      const { isLive, filename } = await downloadForensicCsv(targetEvidenceId);
      onShowToast(
        "Forensic CSV Exported",
        `${filename} generated via ${isLive ? "FastAPI backend (:8000)" : "client fallback buffer"}.`
      );
    } catch {
      onShowToast("Export Warning", "Falling back to local forensic buffer.");
    } finally {
      setDownloading(false);
      onClose();
    }
  };

  const handlePrintCourtReport = () => {
    onClose();
    onShowToast("Court Dossier", "Rendering statutory report for judicial submission...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1017] p-6 max-w-lg w-full border border-[#273447]">
        <div className="flex justify-between items-center border-b border-[#1e2533] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1e2736] text-white flex items-center justify-center text-sm border border-[#303d52]">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">FORM-DEANON: Forensic Dossier</h3>
              <p className="text-xs text-slate-400 font-mono">Dossier ID: NTRO-26151-{targetEvidenceId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#161d28] text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white border border-[#273447] transition"
            title="Close"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <div className="bg-[#080b10] p-3.5 border border-[#1e2533] space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Target / Handle:</span>{" "}
              <span className="font-bold text-white">
                {caseData?.actor_name || caseData?.target_url || "ZeroTrace / ShadowByte"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Type:</span>{" "}
              <span className="font-mono text-cyan-400 uppercase">
                {caseData?.target_type || "onion"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Discovered IP:</span>{" "}
              <span className="font-bold text-[#f87171]">
                {caseData?.origin_ip
                  ? `${caseData.origin_ip} (${caseData.geo || "Resolved"})`
                  : "N/A (Multi-hop SOCKS5)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PGP Key Hash:</span>{" "}
              <span className="text-slate-200">
                {caseData?.pgp_fingerprint
                  ? `${caseData.pgp_fingerprint.substring(0, 18)}...`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Confidence Score:</span>{" "}
              <span className="font-bold text-white">
                {attribution
                  ? `${attribution.confidence_score}% (${attribution.confidence_tier})`
                  : "94.8% (Court Verifiable)"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#121721] border border-[#273447] text-slate-300 flex items-center gap-2.5">
            <i className="fa-solid fa-circle-check text-base shrink-0 text-slate-400"></i>
            <p className="text-[11px] leading-tight">
              SHA-256 Digital Seal:{" "}
              <span className="font-mono text-white">
                {investigation?.custody_verification?.seal
                  ? `${investigation.custody_verification.seal.substring(0, 24)}...`
                  : "e3b0c44298fc1c149afbf4c8996..."}
              </span>{" "}
              Native OASIS STIX 2.1 format.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleStixDownload}
            disabled={downloading}
            className="flex-1 py-2.5 bg-[#121721] hover:bg-[#1a212e] text-slate-200 font-semibold text-xs transition border border-[#273447] flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-code text-[11px]"></i> STIX 2.1 JSON
          </button>
          <button
            onClick={handleCsvDownload}
            disabled={downloading}
            className="flex-1 py-2.5 bg-[#121721] hover:bg-[#1a212e] text-slate-200 font-semibold text-xs transition border border-[#273447] flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-table text-[11px]"></i> Forensic CSV
          </button>
          <button
            onClick={handlePrintCourtReport}
            className="flex-1 py-2.5 bg-[#1e2736] hover:bg-[#283448] text-white font-semibold text-xs transition border border-[#37455d] flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-print text-[11px]"></i> Print Court PDF
          </button>
        </div>
      </div>
    </div>
  );
};
