"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Play, RefreshCcw, XCircle, ShieldCheck, Database, Cpu } from "lucide-react";
import { Disruption, AgentState, EvidenceEntry, Recommendation } from "@/lib/types";

export default function SetReadyPage() {
  const [state, setState] = useState<AgentState>("IDLE");
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Disruption>({
    eventType: "EQUIPMENT_FAILURE",
    description: "Centrifuge 4 bearing failure detected. Expected downtime 8 hours.",
    estimatedImpactHours: 8,
    productionId: "PROD-BATCH99",
  });

  const handleRunAgent = async () => {
    setState("VALIDATING");
    setEvidence([]);
    setRecommendation(null);
    setError(null);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setEvidence(result.evidence || []);

      if (!response.ok) {
        throw new Error(result.error || "Failed to process disruption");
      }

      setRecommendation(result.recommendation);
      setState("RECOMMENDATION_READY");
    } catch (err: any) {
      setError(err.message);
      setState("STOPPED");
    }
  };

  const handleApprove = () => setState("APPROVED");
  const handleReject = () => setState("REJECTED");
  const handleRetry = () => {
    setState("IDLE");
    setRecommendation(null);
    setEvidence([]);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SetReady AI</h1>
        </div>
        <p className="text-slate-500">Google Cloud Agent Backend | Gemini 3.7 Flash</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Form & State */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              Report Disruption
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                <select 
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value as any})}
                  disabled={state !== "IDLE" && state !== "STOPPED"}
                >
                  <option value="WEATHER">Weather</option>
                  <option value="EQUIPMENT_FAILURE">Equipment Failure</option>
                  <option value="LOGISTICS_DELAY">Logistics Delay</option>
                  <option value="STRIKE">Strike</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Production ID</label>
                <input 
                  type="text"
                  placeholder="PROD-XXXX"
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.productionId}
                  onChange={(e) => setFormData({...formData, productionId: e.target.value})}
                  disabled={state !== "IDLE" && state !== "STOPPED"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Impact (Hours)</label>
                <input 
                  type="number"
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.estimatedImpactHours}
                  onChange={(e) => setFormData({...formData, estimatedImpactHours: parseInt(e.target.value)})}
                  disabled={state !== "IDLE" && state !== "STOPPED"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={state !== "IDLE" && state !== "STOPPED"}
                />
              </div>

              <button
                onClick={handleRunAgent}
                disabled={state !== "IDLE" && state !== "STOPPED"}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {state === "IDLE" || state === "STOPPED" ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Analyze with SetReady
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              Agent Status
            </h2>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">{state}</span>
              {state === "IDLE" && <ChevronRight className="w-4 h-4 text-slate-400" />}
              {state === "STOPPED" && <XCircle className="w-4 h-4 text-red-500" />}
              {state === "RECOMMENDATION_READY" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {state !== "IDLE" && state !== "STOPPED" && state !== "RECOMMENDATION_READY" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                <strong>Error:</strong> {error}
                <button onClick={handleRetry} className="block mt-2 font-semibold underline">Reset & Retry</button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Evidence & Recommendation */}
        <section className="space-y-6">
          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl shadow-xl border border-slate-800 font-mono text-xs overflow-hidden flex flex-col min-h-[300px]">
            <h2 className="text-slate-100 text-sm font-semibold mb-4 flex items-center gap-2 font-sans">
              <Database className="w-4 h-4 text-indigo-400" />
              Runtime Evidence Timeline
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {evidence.length === 0 ? (
                <div className="text-slate-600 italic">Awaiting agent activation...</div>
              ) : (
                evidence.map((entry, i) => (
                  <div key={i} className="border-l border-slate-700 pl-4 relative">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="text-indigo-400 mb-1">[{entry.timestamp.split('T')[1].split('.')[0]}] {entry.state}</div>
                    <div className="text-slate-200">{entry.message}</div>
                    {entry.details && (
                      <pre className="mt-2 p-2 bg-black/50 rounded overflow-x-auto text-[10px]">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {state === "RECOMMENDATION_READY" && recommendation && (
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-indigo-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recommendation</h2>
                <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                  {Math.round(recommendation.confidenceScore * 100)}% Confidence
                </div>
              </div>
              
              <p className="text-slate-700 mb-6 leading-relaxed">
                {recommendation.summary}
              </p>

              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Actionable Steps</h3>
                <ul className="space-y-2">
                  {recommendation.actionableSteps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600 italic">
                      <span className="text-indigo-500 font-bold">{i+1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Approve
                </button>
                <button 
                  onClick={handleReject}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {(state === "APPROVED" || state === "REJECTED") && (
            <div className={`p-6 rounded-xl text-center border-2 ${state === "APPROVED" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className={`text-2xl font-bold mb-4 ${state === "APPROVED" ? "text-green-700" : "text-red-700"}`}>
                Recommendation {state}
              </div>
              <button 
                onClick={handleRetry}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"
              >
                <RefreshCcw className="w-4 h-4" />
                Start New Analysis
              </button>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
