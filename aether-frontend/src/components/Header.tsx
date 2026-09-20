"use client";

import React, { useState } from "react";

interface HeaderProps {
  apiOnline: boolean;
  onSearch: (query: string) => void;
  onShowToast: (title: string, message: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiOnline,
  onSearch,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      onShowToast(
        "Target Required",
        "Please enter a .onion URL, PGP fingerprint, or Bitcoin wallet."
      );
      return;
    }
    onSearch(searchQuery.trim());
  };

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div className="flex items-center gap-4">
        {/* Geometric Sunburst Logo (Sharp Square, Steel Tone) */}
        <div className="w-12 h-12 flex items-center justify-center text-slate-200 bg-[#121721] border border-[#273447]">
          <svg
            className="w-8 h-8"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="square"
          >
            <line x1="50" y1="12" x2="50" y2="28" />
            <line x1="50" y1="72" x2="50" y2="88" />
            <line x1="12" y1="50" x2="28" y2="50" />
            <line x1="72" y1="50" x2="88" y2="50" />
            <line x1="23" y1="23" x2="35" y2="35" />
            <line x1="65" y1="65" x2="77" y2="77" />
            <line x1="23" y1="77" x2="35" y2="65" />
            <line x1="65" y1="35" x2="77" y2="23" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 flex-wrap">
            Hello, Lead Investigator!
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#161d28] text-slate-300 border border-[#273447] font-mono">
              PARALLAX_V
            </span>
            {/* Live Backend Connection Badge */}
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 border flex items-center gap-1.5 transition ${
                apiOnline
                  ? "bg-[#102a1b] text-[#22c55e] border-[#1f5735]"
                  : "bg-[#161d28] text-slate-400 border-[#273447]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 ${
                  apiOnline ? "bg-[#22c55e] animate-pulse" : "bg-slate-500"
                }`}
              ></span>
              {apiOnline ? "API ONLINE :8000" : "STANDALONE / SIM"}
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-0.5">
            Dark web threat actor de-anonymization &amp; forensic intelligence for NTRO PS-26151
          </p>
        </div>
      </div>

      {/* Search Bar & Utility Buttons (Sharp Edges) */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-[#0d1017] pl-4 pr-1.5 py-1.5 border border-[#1e2533] w-full lg:w-96 focus-within:border-[#3b495f] transition"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search .onion, PGP fingerprint, BTC wallet..."
            className="bg-transparent text-sm w-full outline-none text-slate-100 placeholder-slate-500 font-medium font-mono"
          />
          <button
            type="submit"
            className="w-8 h-8 bg-[#1e2736] hover:bg-[#283448] text-white flex items-center justify-center transition shrink-0 border border-[#303d52]"
            title="Execute Recon Probe"
          >
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            onShowToast(
              "Secure Channels",
              "Zero unread operational dispatches on encrypted onion bridge."
            )
          }
          className="w-10 h-10 bg-[#0d1017] border border-[#1e2533] flex items-center justify-center text-slate-400 hover:text-white transition"
          title="Secure Channels"
        >
          <i className="fa-regular fa-comment-dots text-sm"></i>
        </button>

        <button
          type="button"
          onClick={() =>
            onShowToast(
              "System Alerts",
              "Origin discovery probe #14 completed: Apache /server-status verified."
            )
          }
          className="w-10 h-10 bg-[#0d1017] border border-[#1e2533] flex items-center justify-center text-slate-400 hover:text-white transition"
          title="System Alerts"
        >
          <i className="fa-regular fa-bell text-sm"></i>
        </button>
      </div>
    </header>
  );
};
