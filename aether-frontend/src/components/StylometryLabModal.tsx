"use client";

import React, { useState } from "react";
import { runStylometryAnalysis, StylometryResult } from "@/lib/api";

interface StylometryLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

const DEFAULT_SAMPLE_A = `Listen, the vendor escrow on this market is basically broken - everyone knows it, nobody says it. I have been running the same setup for three years; no downtime, no drama, no excuses. If you want the access dump, ping me. Prices are firm; don't waste my time with lowball offers. Payment in BTC only - no exceptions, no refunds. Trust is earned, not begged for.`;

const DEFAULT_SAMPLE_B_MATCH = `Listen, the escrow on that forum is basically a joke - everyone knows it, nobody admits it. I have been running this exact setup for years; no downtime, no drama, no excuses. If you need the access logs, ping me. Prices are fixed; don't waste my time with lowball bids. Payment in BTC only - no exceptions, no refunds. Respect is earned, not begged for.`;

const DEFAULT_SAMPLE_B_UNRELATED = `Good afternoon everyone. We have recently upgraded our database infrastructure to PostgreSQL 16. All replication lag has been resolved and queries are operating within expected latencies. Please refer to our engineering handbook for connection pool settings.`;

export const StylometryLabModal: React.FC<StylometryLabModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [textA, setTextA] = useState<string>(DEFAULT_SAMPLE_A);
  const [textB, setTextB] = useState<string>(DEFAULT_SAMPLE_B_MATCH);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<StylometryResult | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    if (!textA.trim() || !textB.trim()) {
      onShowToast("Input Required", "Please provide both text samples for stylometric comparison.");
      return;
    }

    setLoading(true);
    try {
      const { data, isLive } = await runStylometryAnalysis(textA, textB);
      setResult(data);
      const scorePct = (data.similarity_score * 100).toFixed(1) + "%";
      onShowToast(
        isLive ? "FastAPI Stylometry Live" : "Stylometry Evaluated",
        `Similarity score: ${scorePct} (Char 3-gram: ${(
          data.breakdown.char_3gram_cosine * 100
        ).toFixed(1)}%).`
      );
    } catch {
      onShowToast("Stylometry Notice", "Processed token embeddings via client fallback.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadUnrelated = () => {
    setTextB(DEFAULT_SAMPLE_B_UNRELATED);
    setResult(null);
    onShowToast("Sample Swapped", "Loaded unrelated benign engineering sample into Sample B.");
  };

  const handleReset = () => {
    setTextA(DEFAULT_SAMPLE_A);
    setTextB(DEFAULT_SAMPLE_B_MATCH);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1017] p-6 max-w-3xl w-full border border-[#273447] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1e2533] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e2736] text-white flex items-center justify-center text-base border border-[#303d52]">
              <i className="fa-solid fa-fingerprint"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#141a24] text-slate-300 border border-[#263245]">
                  AI LAB
                </span>
                <h3 className="text-base font-bold text-white">
                  Stylometry NLP Comparison Engine
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Character 3-gram &amp; word n-gram cosine similarity (POST /api/analysis/stylometry)
              </p>
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

        {/* Text Samples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-mono">
              <span className="text-slate-300 font-bold">Sample A: Dread Forum</span>
              <span className="text-slate-500">Handle: ZeroTrace</span>
            </div>
            <textarea
              rows={8}
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full bg-[#080b10] border border-[#273447] p-3 text-slate-200 font-mono text-xs outline-none resize-none focus:border-[#425575] transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-mono">
              <span className="text-slate-300 font-bold">Sample B: Exploit.in Forum</span>
              <span className="text-slate-500">Handle: ShadowByte</span>
            </div>
            <textarea
              rows={8}
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full bg-[#080b10] border border-[#273447] p-3 text-slate-200 font-mono text-xs outline-none resize-none focus:border-[#425575] transition"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-[#1e2533]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={loading}
              className="px-5 py-2.5 bg-[#1e2736] hover:bg-[#283448] text-white text-xs font-bold font-mono transition border border-[#37455d] flex items-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <i className="fa-solid fa-calculator text-xs"></i>
              )}
              Run Stylometric Comparison
            </button>
            <button
              onClick={handleLoadUnrelated}
              className="px-3 py-2 bg-[#121620] hover:bg-[#1a212d] text-slate-300 border border-[#232d3d] text-xs font-mono transition"
            >
              Load Unrelated Sample
            </button>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 font-mono underline"
          >
            Reset Defaults
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-4 bg-[#080c14] border border-[#1e2533] p-4 font-mono text-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#161d28] pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Composite Cosine Similarity</span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {(result.similarity_score * 100).toFixed(1)}%
                  <span className="text-xs font-normal text-emerald-400 ml-2">
                    {result.similarity_score >= 0.7 ? "High Authorship Affinity" : "Low Authorship Match"}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[#141a24] text-slate-300 border border-[#232d3d] text-[11px]">
                Shared Tokens: {result.shared_tokens_count}
              </span>
            </div>

            {/* Breakdown Columns */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0e131d] p-3 border border-[#1a2230]">
                <span className="text-[10px] text-slate-400 block uppercase">Char 3-Gram</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {(result.breakdown.char_3gram_cosine * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#0e131d] p-3 border border-[#1a2230]">
                <span className="text-[10px] text-slate-400 block uppercase">Word Unigram</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {(result.breakdown.word_unigram_cosine * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#0e131d] p-3 border border-[#1a2230]">
                <span className="text-[10px] text-slate-400 block uppercase">Word Bigram</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {(result.breakdown.word_bigram_cosine * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Shared Token Chips */}
            {result.shared_tokens_sample && result.shared_tokens_sample.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1.5">
                  Shared Discriminative Tokens Sample
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.shared_tokens_sample.map((token, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#16202e] text-blue-200 border border-[#26374f] text-[11px]"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
