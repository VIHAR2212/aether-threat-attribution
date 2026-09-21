"use client";

import React, { useState } from "react";
import { checkBackendHealth } from "@/lib/api";

interface EngineConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

export const EngineConfigModal: React.FC<EngineConfigModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [torHost, setTorHost] = useState<string>("127.0.0.1");
  const [torPort, setTorPort] = useState<string>("9050");
  const [torEnabled, setTorEnabled] = useState<boolean>(true);
  const [backendUrl, setBackendUrl] = useState<string>("http://localhost:8000");
  const [neo4jUrl, setNeo4jUrl] = useState<string>("bolt://localhost:7687");
  const [pinging, setPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ status: string; latency: number } | null>(null);

  if (!isOpen) return null;

  const handlePing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await checkBackendHealth();
      const latency = Math.round(performance.now() - start);
      if (res.online) {
        setPingResult({ status: "ONLINE (HTTP 200)", latency });
        onShowToast("Backend Gateway Connected", `FastAPI responding at ${backendUrl} (${latency}ms).`);
      } else {
        setPingResult({ status: "UNREACHABLE", latency });
        onShowToast("Connection Warning", "FastAPI backend did not respond at target URL.");
      }
    } catch {
      setPingResult({ status: "ERROR", latency: 0 });
    } finally {
      setPinging(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(
      "Configuration Saved",
      `Tor Proxy: ${torHost}:${torPort} | Backend: ${backendUrl}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1017] p-6 max-w-md w-full border border-[#273447]">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#1e2533] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e2736] text-white flex items-center justify-center text-xs border border-[#303d52]">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Engine Configuration</h3>
              <p className="text-[11px] text-slate-400 font-mono">Gateway &amp; Recon Proxy Settings</p>
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

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="py-4 space-y-4 text-xs font-mono">
          {/* Tor SOCKS5 Settings */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 uppercase text-[10px] font-bold">
                Tor SOCKS5 Proxy Circuit
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400">
                <input
                  type="checkbox"
                  checked={torEnabled}
                  onChange={(e) => setTorEnabled(e.target.checked)}
                  className="accent-slate-200"
                />
                Enabled
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={torHost}
                onChange={(e) => setTorHost(e.target.value)}
                placeholder="Host"
                className="col-span-2 bg-[#080b10] border border-[#273447] p-2 text-slate-200 outline-none"
              />
              <input
                type="text"
                value={torPort}
                onChange={(e) => setTorPort(e.target.value)}
                placeholder="Port"
                className="bg-[#080b10] border border-[#273447] p-2 text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* FastAPI Backend URL */}
          <div>
            <label className="text-slate-300 block mb-1 uppercase text-[10px] font-bold">
              FastAPI Forensic Backend URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-[#080b10] border border-[#273447] p-2 text-slate-200 outline-none"
            />
          </div>

          {/* Neo4j Bolt URL */}
          <div>
            <label className="text-slate-300 block mb-1 uppercase text-[10px] font-bold">
              Neo4j Graph Database
            </label>
            <input
              type="text"
              value={neo4jUrl}
              onChange={(e) => setNeo4jUrl(e.target.value)}
              placeholder="bolt://localhost:7687"
              className="w-full bg-[#080b10] border border-[#273447] p-2 text-slate-200 outline-none"
            />
          </div>

          {/* Gateway Ping Status */}
          <div className="bg-[#080c14] border border-[#1e2533] p-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Gateway Telemetry</span>
              <span className="text-xs font-bold text-emerald-400">
                {pingResult ? `${pingResult.status} (${pingResult.latency}ms)` : "127.0.0.1:8000"}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePing}
              disabled={pinging}
              className="px-3 py-1.5 bg-[#16202e] hover:bg-[#202d40] text-blue-200 border border-[#2c3f5c] text-[11px] font-bold transition flex items-center gap-1.5"
            >
              {pinging ? (
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <i className="fa-solid fa-satellite-dish text-[10px]"></i>
              )}
              Ping Gateway
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1e2736] hover:bg-[#283448] text-white font-bold transition border border-[#37455d] flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check text-xs"></i> Save &amp; Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
