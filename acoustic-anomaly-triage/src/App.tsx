import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Analysis from "./components/Analysis";
import TestbedMonitor from "./components/TestbedMonitor";
import {
  INITIAL_ALERTS,
  INITIAL_SEGMENTS,
  INITIAL_SESSIONS,
  INITIAL_TESTBED_NODES
} from "./data";
import { Segment, Session, GlobalAlert } from "./types";
import {
  AlertTriangle,
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Hourglass,
  CheckCircle,
  FileCheck,
  Search,
  BookOpen
} from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>("Seg-0042");
  
  // Interactive persistent arrays of logs
  const [alerts, setAlerts] = useState<GlobalAlert[]>(INITIAL_ALERTS);
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
  const [isAlertBannerVisible, setIsAlertBannerVisible] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handler for clicking recent sessions / logs
  const handleSelectSessionInOverview = (sessionId: string) => {
    // Locate segment or pre-load
    if (sessionId === "printer_session_015") {
      setSelectedSegmentId("Seg-0042");
    } else {
      setSelectedSegmentId("Seg-0041");
    }
    setCurrentTab("analysis");
  };

  // Handler to view an alert candidate inside active analyzer workspace
  const handleReviewAlert = (alert: GlobalAlert) => {
    if (alert.machineId && alert.machineId.includes("Fan")) {
      setSelectedSegmentId("Seg-0042");
    } else {
      setSelectedSegmentId("Seg-0041");
    }
    setCurrentTab("analysis");
  };

  // Silencing alert actions
  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alt) => alt.id !== alertId));
  };

  const handleActionNewSession = () => {
    const newSessionId = `custom_session_${Math.floor(Math.random() * 800 + 100)}`;
    const newSession: Session = {
      id: newSessionId,
      timestamp: new Date().toUTCString(),
      candidatesCount: 0,
      status: "stable",
      duration: "00:00:00",
      device: "Mic B"
    };

    setSessions((prev) => [newSession, ...prev]);
    alert(`[SYSTEM INITIATED] Successfully launched real-time testbed feed on channel Mic B. Session reference: ${newSessionId}.`);
  };

  // Searching / filtering logic
  const filteredSessions = sessions.filter((s) =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.device.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] h-screen overflow-hidden flex flex-col antialiased select-none">
      {/* 1. Global Navigation Area & Warning Banner Bar */}
      <div className="flex-none flex flex-col z-50">
        
        {/* Top Header Controls bar */}
        <Header
          onSearch={(q) => setSearchQuery(q)}
          activeAlertCount={alerts.length}
          onOpenAlerts={() => setCurrentTab("analysis")}
        />

        {/* Global Warning Banner - Screen 3 design */}
        {isAlertBannerVisible && alerts.length > 0 && (
          <div className="bg-[#93000a] border-b border-[#ffb4ab] text-[#ffdad6] px-6 py-2 flex items-center justify-between text-xs z-40 relative select-none animate-slide-down">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
              <span className="bg-[#ffb4ab] text-[#690005] font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                anomaly candidate
              </span>
              <span className="font-mono font-bold">14:22:05 UTC</span>
              <span className="opacity-95">
                Critical high-frequency sound spike exceeding 72 dB detected on Mic C (Fan Unit).
              </span>
            </div>
            
            <div className="flex items-center gap-3 font-mono">
              <button
                onClick={() => setIsAlertBannerVisible(false)}
                className="bg-transparent border border-[#ffb4ab]/40 hover:bg-[#ffdad6]/15 hover:border-white text-white px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
              >
                Silence Alert Banner
              </button>
              <button
                onClick={() => {
                  setSelectedSegmentId("Seg-0042");
                  setCurrentTab("analysis");
                }}
                className="bg-[#ffb4ab] text-[#690005] hover:bg-white hover:text-[#93000a] px-3 py-1 rounded text-[10px] text-center font-bold transition-all cursor-pointer"
              >
                Open in Analysis
              </button>
              <button
                onClick={() => setIsAlertBannerVisible(false)}
                className="text-[#ffb4ab] hover:bg-[#ffdad6]/10 p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Workspace layout splits */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar Menu */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          onNewSession={handleActionNewSession}
        />

        {/* Center Canvas display */}
        <main className="ml-64 flex-1 flex flex-col overflow-hidden bg-[#0b1326]">
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentTab === "overview" && (
              <Overview
                sessions={filteredSessions}
                onSelectSession={handleSelectSessionInOverview}
                onFilterClick={() => alert("Telemetry filter criteria applied. Active sessions listed.")}
                onExportClick={() => alert("Initiated download of triage logs (acoustic_anomaly_analysis_report.csv)")}
              />
            )}

            {currentTab === "analysis" && (
              <Analysis
                initialSegments={segments}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={(id) => setSelectedSegmentId(id)}
              />
            )}

            {currentTab === "testbed" && (
              <TestbedMonitor
                initialNodes={INITIAL_TESTBED_NODES}
                onOpenAnalysisWithId={(id) => {
                  setSelectedSegmentId(id);
                  setCurrentTab("analysis");
                }}
              />
            )}

            {/* Pristine placeholder tabs for non-destructive design completion */}
            {currentTab === "reports" && (
              <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                    Calibration Reports Center
                  </h1>
                  <p className="text-xs text-[#bdc8d1] mt-1 font-mono">
                    Review and generate automated mechanical audit profiles for industrial compliance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 space-y-3">
                    <span className="text-[10px] font-bold text-[#8ed5ff] uppercase tracking-wider font-mono">
                      Continuous Audits Completed
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <FileCheck className="w-8 h-8 text-[#10b981]" />
                      <div>
                        <div className="text-lg font-bold">148 Normal Baselines</div>
                        <div className="text-[10px] text-[#bdc8d1] font-mono">ISO-9001 Structural Calibrated</div>
                      </div>
                    </div>
                    <button className="text-[10.5px] text-[#8ed5ff] hover:underline font-mono">
                      Export full diagnostic certificate pdf
                    </button>
                  </div>

                  <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 space-y-3">
                    <span className="text-[10px] font-bold text-[#f1a02b] uppercase tracking-wider font-mono">
                      Active Compliance Triage logs
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Download className="w-8 h-8 text-[#ffb4ab]" />
                      <div>
                        <div className="text-lg font-bold">12 Anomalies Logged</div>
                        <div className="text-[10px] text-[#bdc8d1] font-mono">Pending final safety signature</div>
                      </div>
                    </div>
                    <button className="text-[10.5px] text-[#8ed5ff] hover:underline font-mono">
                      View previous 30 days history overview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTab === "archives" && (
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                    Sensor Archive Vault
                  </h1>
                  <p className="text-xs text-[#bdc8d1] mt-1 font-mono">
                    Access older log buffers and micro-calibration database partitions.
                  </p>
                </div>

                <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 space-y-3">
                  <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1] font-mono">
                    Search historical repository
                  </span>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-[#bdc8d1] w-4 h-4" />
                    <input
                      type="text"
                      className="w-full bg-[#0b1326] border border-[#3e484f] rounded text-xs pl-9 pr-3 py-2.5 outline-none focus:border-[#8ed5ff] font-mono"
                      placeholder="Input session date, machine model (e.g. printer_2023_10)..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentTab === "status" && (
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <h1 className="text-lg font-mono font-bold">Acoustic Signal Processing Status</h1>
                <div className="bg-[#171f33] border border-[#3e484f] p-4 rounded text-xs space-y-2 font-mono">
                  <div>• Main Core Buffer: <span className="text-green-500">Online</span></div>
                  <div>• Audio Pipeline (Web Audio): <span className="text-green-500">Live Synthesis Ready</span></div>
                  <div>• Server Triage (Express API): <span className="text-green-500">Connected</span></div>
                  <div>• Diagnostic Report Service: <span className="text-blue-400">Local report generation ready</span></div>
                </div>
              </div>
            )}

            {currentTab === "docs" && (
              <div className="p-6 flex-1 overflow-y-auto space-y-4 font-mono select-text">
                <h1 className="text-lg font-bold text-white border-b border-[#3e484f] pb-2 uppercase">Acoustic Triage Technical Documentation</h1>
                <p className="text-xs text-[#bdc8d1]">
                  This cockpit provides real-time digital triage capabilities.
                </p>
                <div className="text-xs space-y-3 leading-relaxed text-[#bdc8d1]">
                  <strong className="text-white block mt-4 select-none">1. Web Audio synthesis model</strong>
                  <p>Technicians can activate the audio feed within the "Analysis Workspace" or the "Testbed Monitor". Normal printing represents low periodic noise. Anomalies generate scraping sounds corresponding to metal rubbing at 4,200 Hertz.</p>
                  <strong className="text-white block mt-4 select-none">2. Diagnostics Engine</strong>
                  <p>Clicking "Generate Report" evaluates bearing friction or mechanical misalignment profiles and provides troubleshooting checklists.</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Bottom Drawer: Global Alert Queue - Screen 3 design */}
          <div className="flex-none h-44 border-t border-[#3e484f] bg-[#131b2e] flex flex-col z-10 font-mono">
            <div className="px-4 py-2 border-b border-[#3e484f] flex justify-between items-center bg-[#0d1527]">
              <h2 className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1]">
                GLOBAL ALERT QUEUE
              </h2>
              <span className="text-[10px] text-[#ffb4ab] font-bold">
                {alerts.length} Active System Alerts
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 scrollbar-hide select-none">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#bdc8d1]/30">
                  Buffer zeroed. No active acoustics alerts reported on manufacturing grid.
                </div>
              ) : (
                alerts.map((alertItem) => (
                  <div
                    key={alertItem.id}
                    className={`flex items-center gap-4 bg-[#0b1326] border border-[#3e484f] hover:border-[#8ed5ff] rounded p-2 text-xs transition-colors`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse shrink-0" />
                    <div className="text-[10px] text-[#bdc8d1] w-24 shrink-0">
                      {alertItem.timestamp}
                    </div>
                    <div className="shrink-0 w-16">
                      <span className="bg-[#93000a] text-[#ffdad6] text-[8.5px] px-1.5 py-0.5 rounded-sm uppercase font-bold border border-[#ffb4ab]/20">
                        {alertItem.type}
                      </span>
                    </div>
                    <div className="font-bold text-white w-20 shrink-0">{alertItem.micId}</div>
                    <div className="text-[#bdc8d1] flex-1 truncate text-xs select-text">
                      {alertItem.description}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewAlert(alertItem)}
                        className="text-[#8ed5ff] hover:underline font-bold text-[11px] px-2 cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleDismissAlert(alertItem.id)}
                        className="text-[#bdc8d1]/60 hover:text-white text-[11px] px-2 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
