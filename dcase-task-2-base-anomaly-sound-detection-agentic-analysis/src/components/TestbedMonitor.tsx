import React, { useState, useEffect } from "react";
import { TestbedNode } from "../types";
import { playSynthSound, stopSynthSound } from "../utils/audioSynth";
import {
  Wand2,
  Mic,
  Settings,
  Flame,
  Gauge,
  Cpu,
  Tv,
  Radio,
  FileHeart,
  ChevronRight,
  PlusCircle,
  FolderMinus,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface TestbedMonitorProps {
  initialNodes: TestbedNode[];
  onOpenAnalysisWithId: (id: string) => void;
}

export default function TestbedMonitor({ initialNodes, onOpenAnalysisWithId }: TestbedMonitorProps) {
  const [nodes, setNodes] = useState<TestbedNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("Fan Unit");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Acoustic Stream Type for the sound monitor
  const [soundMode, setSoundMode] = useState<"normal" | "anomaly">("anomaly");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  
  // Custom states for live gauges
  const [liveSpl, setLiveSpl] = useState<number>(72.4);
  const [liveGenreScore, setLiveGenreScore] = useState<number>(0.86);

  // Generated maintenance report
  const [coordinateReport, setCoordinateReport] = useState<string>("");
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState<boolean>(false);

  // Find active selected node
  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[6]; // default to Fan Unit

  // Handle active node updates
  useEffect(() => {
    if (activeNode) {
      const isNodeAnomaly = activeNode.status === "anomaly";
      setSoundMode(isNodeAnomaly ? "anomaly" : "normal");
      
      // Update metrics based on active node state
      if (isNodeAnomaly) {
        setLiveSpl(activeNode.splDb || 72.4);
        setLiveGenreScore(activeNode.genreScore || 0.86);
      } else {
        setLiveSpl(activeNode.splDb || 52.0);
        setLiveGenreScore(activeNode.genreScore || 0.08);
      }
      setCoordinateReport("");
    }
  }, [selectedNodeId, activeNode]);

  // Handle live metric updates on physical sound mode selection
  useEffect(() => {
    if (soundMode === "anomaly") {
      setLiveSpl(72.4);
      setLiveGenreScore(0.86);
    } else {
      setLiveSpl(52.8);
      setLiveGenreScore(0.12);
    }
    setCoordinateReport("");
    if (isPlayingAudio) {
      playSynthSound(soundMode);
    }
  }, [soundMode]);

  // Handle synthesizer plays
  const handleToggleAudioStream = () => {
    if (isPlayingAudio) {
      stopSynthSound();
      setIsPlayingAudio(false);
    } else {
      playSynthSound(soundMode);
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    return () => stopSynthSound();
  }, []);

  // Request a generated report about selected map coordinates
  const triggerCoordinateAnalysis = async () => {
    setIsGeneratingExplanation(true);
    try {
      const response = await fetch("/api/explain-testbed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: activeNode.id,
          nodeType: activeNode.type,
          anomalyState: activeNode.status === "anomaly" ? "Anomaly Candidate" : "Stable Operating",
          currentSpl: liveSpl,
          sensorDetails: {
            assignedMic: activeNode.type === "machine" ? "Mic C" : activeNode.id,
            vibrationalExcitation: soundMode === "anomaly" ? "Severe erratic high frequency friction" : "Uniform calibration hum"
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setCoordinateReport(data.explanation);
      }
    } catch (err) {
      console.error("Failed coordinates analysis call:", err);
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0b1326] p-4 gap-4 animate-fade-in">
      {/* COMPONENT COORDINATES PANEL (VISUAL TESTBED MAP) */}
      <div className="flex-[2] flex flex-col gap-2 min-w-[400px]">
        <div className="flex items-center justify-between px-2 pb-1 border-b border-[#3e484f] mb-1">
          <h2 className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1] font-mono">
            VISUAL TESTBED MAP
          </h2>

          {/* Mode Switchers */}
          <div className="flex bg-[#131b2e] rounded p-0.5 border border-[#3e484f]">
            <button
              onClick={() => setIsEditMode(false)}
              className={`px-3 py-1 text-[11px] font-mono leading-none rounded-sm transition-all cursor-pointer ${
                !isEditMode ? "bg-[#2d3449] text-white shadow-sm font-semibold" : "text-[#bdc8d1] hover:text-white"
              }`}
            >
              Monitor
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className={`px-3 py-1 text-[11px] font-mono leading-none rounded-sm transition-all cursor-pointer ${
                isEditMode ? "bg-[#2d3449] text-white shadow-sm font-semibold" : "text-[#bdc8d1] hover:text-white"
              }`}
            >
              Edit Layout
            </button>
          </div>
        </div>

        {/* Edit Layout Bar Toolbar */}
        {isEditMode && (
          <div className="flex items-center justify-between bg-[#131b2e] p-2 rounded border border-[#3e484f]/60 animate-fade-in select-none">
            <div className="flex gap-2">
              <button className="bg-[#0b1326] hover:bg-[#222a3d] border border-[#3e484f] text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 cursor-pointer">
                <PlusCircle className="w-3.5 h-3.5 text-[#8ed5ff]" />
                <span>Add Machine</span>
              </button>
              <button className="bg-[#0b1326] hover:bg-[#222a3d] border border-[#3e484f] text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 cursor-pointer">
                <Mic className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Add Microphone</span>
              </button>
            </div>
            <div className="flex gap-2 border-l border-[#3e484f]/60 pl-2">
              <button
                onClick={() => setIsEditMode(false)}
                className="bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-[10px] font-mono font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button className="bg-[#0b1326] hover:bg-[#222a3d] border border-[#ffb4ab]/30 text-[#ffb4ab] text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end px-2 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#8ed5ff]">LIVE TELEMETRY BUFFER</span>
          </div>
        </div>

        {/* Blueprint Layout Grid Representation */}
        <div className="flex-1 bg-[#171f33] rounded border border-[#3e484f] relative overflow-hidden grid-bg flex items-center justify-center">
          <div className="relative w-full h-full max-w-[600px] max-h-[420px] m-auto">
            
            {/* SVG Connections representing sensor assignment links */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
              {/* Connection Mic A to 3D-01 */}
              <line stroke="#3e484f" strokeDasharray="3 3" strokeWidth="1" x1="20%" y1="23%" x2="40%" y2="40%" />
              {/* Connection Mic B to 3D-02 */}
              <line stroke="#3e484f" strokeDasharray="3 3" strokeWidth="1" x1="80%" y1="23%" x2="65%" y2="40%" />
              
              {/* Connection Mic C to Fan Unit (Fault State Link highlighted in red) */}
              <line
                className={`${soundMode === "anomaly" ? "animate-pulse" : ""}`}
                stroke={soundMode === "anomaly" ? "#ffb4ab" : "#3e484f"}
                strokeWidth={soundMode === "anomaly" ? "2" : "1"}
                strokeDasharray={soundMode === "anomaly" ? "0" : "3 3"}
                x1="25%"
                y1="80%"
                x2="30%"
                y2="63%"
              />

              {/* Connection Mic D to Rig */}
              <line stroke="#3e484f" strokeDasharray="3 3" strokeWidth="1" x1="85%" y1="75%" x2="65%" y2="63%" />
            </svg>

            {/* Microphones Coordinates */}
            <button
              onClick={() => setSelectedNodeId("Mic A")}
              style={{ top: "20%", left: "15%" }}
              className={`absolute w-8 h-8 rounded-full border flex items-center justify-center z-30 shadow-md cursor-pointer transition-all ${
                selectedNodeId === "Mic A"
                  ? "bg-[#8ed5ff] text-[#00354a] border-white scale-110 font-bold"
                  : "bg-[#0b1326] border-[#3e484f] text-[#dae2fd] hover:border-[#8ed5ff]"
              }`}
            >
              <span className="text-[10px] font-mono">A</span>
            </button>

            <button
              onClick={() => setSelectedNodeId("Mic B")}
              style={{ top: "20%", left: "80%" }}
              className={`absolute w-8 h-8 rounded-full border flex items-center justify-center z-30 shadow-md cursor-pointer transition-all ${
                selectedNodeId === "Mic B"
                  ? "bg-[#8ed5ff] text-[#00354a] border-white scale-110 font-bold"
                  : "bg-[#0b1326] border-[#3e484f] text-[#dae2fd] hover:border-[#8ed5ff]"
              }`}
            >
              <span className="text-[10px] font-mono">B</span>
            </button>

            {/* Mic C (Active anomaly candidate) */}
            <button
              onClick={() => setSelectedNodeId("Mic C")}
              style={{ bottom: "20%", left: "20%" }}
              className={`absolute w-8 h-8 rounded-full border flex items-center justify-center z-30 shadow-md cursor-pointer transition-all ${
                selectedNodeId === "Mic C"
                  ? "bg-[#93000a] text-[#ffdad6] border-[#ffb4ab] scale-110 font-bold animate-pulse"
                  : "bg-[#0b1326] border-[#ffb4ab]/40 text-[#ffb4ab] hover:border-[#ffb4ab]"
              }`}
            >
              <span className="text-[10px] font-mono">C</span>
            </button>

            <button
              onClick={() => setSelectedNodeId("Mic D")}
              style={{ bottom: "25%", left: "85%" }}
              className={`absolute w-8 h-8 rounded-full border flex items-center justify-center z-30 shadow-md cursor-pointer transition-all ${
                selectedNodeId === "Mic D"
                  ? "bg-[#8ed5ff] text-[#00354a] border-white scale-110 font-bold"
                  : "bg-[#0b1326] border-[#3e484f] text-[#dae2fd] hover:border-[#8ed5ff]"
              }`}
            >
              <span className="text-[10px] font-mono">D</span>
            </button>

            {/* Machines Nodes */}
            <button
              onClick={() => setSelectedNodeId("3D-01")}
              style={{ top: "35%", left: "35%", width: "20%", height: "15%" }}
              className={`absolute border rounded flex items-center justify-center shadow-sm z-20 cursor-pointer transition-all ${
                selectedNodeId === "3D-01"
                  ? "bg-[#171f33] border-[#8ed5ff] text-white glow-ready scale-102"
                  : "bg-[#222a3d] border-[#3e484f] text-[#bdc8d1] hover:border-[#8ed5ff]"
              }`}
            >
              <span className="text-xs font-mono">3D-01</span>
            </button>

            <button
              onClick={() => setSelectedNodeId("3D-02")}
              style={{ top: "35%", left: "62%", width: "20%", height: "15%" }}
              className={`absolute border rounded flex items-center justify-center shadow-sm z-20 cursor-pointer transition-all ${
                selectedNodeId === "3D-02"
                  ? "bg-[#171f33] border-[#8ed5ff] text-white glow-ready scale-102"
                  : "bg-[#222a3d] border-[#3e484f] text-[#bdc8d1] hover:border-[#8ed5ff]"
              }`}
            >
              <span className="text-xs font-mono">3D-02</span>
            </button>

            {/* Fan Unit Node (Highlighted Anomaly Element pulsing red) */}
            <button
              onClick={() => setSelectedNodeId("Fan Unit")}
              style={{ bottom: "20%", left: "30%", width: "24%", height: "20%" }}
              className={`absolute border rounded flex flex-col items-center justify-center shadow-md z-20 cursor-pointer transition-all ${
                selectedNodeId === "Fan Unit"
                  ? "bg-[#93000a]/10 border-[#ffb4ab] text-white glow-error"
                  : "bg-[#222a3d] border-[#ffb4ab]/50 text-[#ffb4ab] hover:border-[#ffb4ab] animate-pulse"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wide">Fan Unit</span>
              <span className="text-[9px] font-mono tracking-wider text-[#ffb4ab] font-bold mt-1 uppercase">
                {soundMode === "anomaly" ? "ERR_FRICTION" : "STANDBY"}
              </span>
            </button>

            <button
              onClick={() => setSelectedNodeId("Rig")}
              style={{ bottom: "20%", left: "62%", width: "18%", height: "22%" }}
              className={`absolute border rounded flex items-center justify-center shadow-sm z-20 cursor-pointer transition-all ${
                selectedNodeId === "Rig"
                  ? "bg-[#171f33] border-[#8ed5ff] text-white glow-ready"
                  : "bg-[#222a3d] border-[#3e484f] text-[#bdc8d1] hover:border-[#8ed5ff]"
              }`}
            >
              <span className="text-xs font-mono">Rig Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* SELECTED SOUND MONITOR INSPECTOR PANEL (RIGHT COLUMN) */}
      <div className="flex-[1.4] flex flex-col gap-2 min-w-[340px] bg-[#131b2e] border border-[#3e484f] rounded overflow-hidden">
        <div className="p-3 border-b border-[#3e484f] bg-[#0d1527] flex justify-between items-center">
          <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1] font-mono">
            COORDINATE LIVE FEED
          </span>
          <span className="bg-[#171f33] border border-[#3e484f] text-[9px] font-mono text-[#8ed5ff] px-1.5 py-0.5 rounded">
            Channel Lock
          </span>
        </div>

        <div className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto scrollbar-hide">
          {/* Node metadata title details */}
          <div className="bg-[#0b1326] p-3 rounded border border-[#3e484f]/60 flex flex-col gap-1.5 scrollbar-hide">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{activeNode.id}</h3>
                <span className="text-[10px] text-[#bdc8d1]/60 font-mono block mt-0.5">
                  Type: {activeNode.type === "machine" ? "Primary machinery" : "Ambient sound recorder"}
                </span>
              </div>
              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  activeNode.status === "anomaly"
                    ? "bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30"
                    : "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30"
                }`}
              >
                {activeNode.status === "anomaly" ? "anomaly candidate" : "stable operations"}
              </span>
            </div>
            <div className="text-[11px] text-[#8ed5ff] font-mono font-medium lowercase">
              {activeNode.operationStatus}
            </div>
          </div>

          {/* Sound stream signal mode toggle selectors */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-[#bdc8d1] font-mono">SIGNAL SELECTOR</span>
              <button
                onClick={handleToggleAudioStream}
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isPlayingAudio ? "bg-[#ffb4ab] text-[#690005]" : "bg-[#8ed5ff] text-[#00354a]"
                }`}
              >
                {isPlayingAudio ? "STOP STEAM" : "LISTEN LIVE"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSoundMode("normal")}
                className={`text-[10px] font-bold font-mono py-1.5 rounded transition-colors cursor-pointer text-center ${
                  soundMode === "normal"
                    ? "bg-[#2d3449] border border-[#8ed5ff] text-white"
                    : "bg-[#0b1326] border border-[#3e484f]/60 text-[#bdc8d1] hover:bg-[#222a3d]"
                }`}
              >
                Normal print sound
              </button>
              <button
                onClick={() => setSoundMode("anomaly")}
                className={`text-[10px] font-bold font-mono py-1.5 rounded transition-colors cursor-pointer text-center ${
                  soundMode === "anomaly"
                    ? "bg-[#93000a]/20 border border-[#ffb4ab] text-[#ffb4ab]"
                    : "bg-[#0b1326] border border-[#3e484f]/60 text-[#bdc8d1] hover:bg-[#222a3d]"
                }`}
              >
                Fan noise candidate
              </button>
            </div>
          </div>

          {/* Miniature animated waveform visualizer node bars */}
          <div className="h-14 bg-[#0b1326] border border-[#3e484f]/60 rounded relative flex items-center px-4 overflow-hidden select-none">
            <div className="flex items-end gap-[1.5px] h-10 w-full opacity-80">
              {Array.from({ length: 32 }).map((_, i) => {
                const heightPercentage =
                  soundMode === "anomaly"
                    ? (Math.sin(i * 0.4) * 15 + Math.random() * 20 + 20)
                    : (Math.sin(i * 0.2) * 10 + Math.random() * 10 + 15);
                const isPulseZone = soundMode === "anomaly" && i > 12 && i < 22;

                return (
                  <div
                    key={i}
                    style={{ height: `${heightPercentage}%` }}
                    className={`w-full duration-150 transition-all ${
                      isPulseZone ? "bg-[#ffb4ab] animate-pulse" : "bg-[#38bdf8]"
                    }`}
                  />
                );
              })}
            </div>
            {/* Playhead line representation */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#f1a02b] shadow-[0_0_8px_#f1a02b] select-none" />
          </div>

          {/* Meter gauges section */}
          <div className="grid grid-cols-2 gap-2">
            {/* SPL Level meter progress */}
            <div className="bg-[#0b1326] border border-[#3e484f]/60 rounded p-2 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-[#bdc8d1]/80 font-mono block">SPL LEVEL (dB)</span>
              <span
                className={`text-base font-bold font-mono block my-1 ${
                  soundMode === "anomaly" ? "text-[#ffb4ab]" : "text-[#8ed5ff]"
                }`}
              >
                {liveSpl.toFixed(1)}
              </span>
              <div className="h-1.5 bg-[#171f33] rounded-full overflow-hidden mt-1">
                <div
                  style={{ width: `${(liveSpl / 100) * 100}%` }}
                  className={`h-full transition-all duration-300 ${
                    soundMode === "anomaly" ? "bg-[#ffb4ab]" : "bg-[#38bdf8]"
                  }`}
                />
              </div>
            </div>

            {/* GenRep score details */}
            <div className="bg-[#0b1326] border border-[#3e484f]/60 rounded p-2 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-[#bdc8d1]/80 font-mono block">GENREP SCORE</span>
              <span
                className={`text-base font-bold font-mono block my-1 ${
                  soundMode === "anomaly" ? "text-[#ffb4ab]" : "text-[#8ed5ff]"
                }`}
              >
                {liveGenreScore.toFixed(2)}
              </span>
              <div className="h-1.5 bg-[#171f33] rounded-full overflow-hidden mt-1 relative">
                <div className="absolute top-0 bottom-0 left-[72%] w-0.5 bg-yellow-600/60 z-10" title="Threshold pointer limit"></div>
                <div
                  style={{ width: `${liveGenreScore * 100}%` }}
                  className={`h-full transition-all duration-300 ${
                    soundMode === "anomaly" ? "bg-[#ffb4ab]" : "bg-[#38bdf8]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Coordinator diagnosis detail block */}
          <div className="bg-[#0b1326] border border-[#ffb4ab]/20 focus-within:border-primary transition-all p-3 rounded flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between border-b border-[#3e484f]/40 pb-1.5 leading-none">
              <div className="flex items-center gap-1.5 text-[#ffc176]">
                <Sparkles className="w-4 h-4 text-[#8ed5ff] animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
                  Coordinates Diagnosis Assistant
                </span>
              </div>
              <button
                onClick={triggerCoordinateAnalysis}
                disabled={isGeneratingExplanation}
                className="text-[9.5px] font-mono text-[#8ed5ff] hover:underline disabled:opacity-40 cursor-pointer"
              >
                {isGeneratingExplanation ? "Evaluating..." : "Generate Report"}
              </button>
            </div>

            <div className="text-[11px] text-white">
              <span className="font-bold text-[#ffb4ab]">Estimated Case:</span>{" "}
              {soundMode === "anomaly"
                ? "Fan and auxiliary airflow obstruction caused by rotor slip friction."
                : "Active baseline calibration (stable continuous operational resonance)."}
            </div>

            <div className="text-[10.5px] font-mono text-[#bdc8d1] bg-[#070d1a] border border-[#3e484f]/40 rounded p-2 truncate-3-lines leading-relaxed h-[85px] overflow-y-auto scrollbar-hide">
              {coordinateReport ? (
                <p className="whitespace-pre-line">{coordinateReport.replace(/###/g, "").replace(/####/g, "")}</p>
              ) : (
                "Continuous high frequency harmonic distortion detected near 4.2 kHz (Channel Mic C). Signal represents scraping metal friction. Click 'Generate Report' for diagnostic recommendations."
              )}
            </div>

            <button
              onClick={() => onOpenAnalysisWithId("Seg-0042")}
              className="w-full text-center bg-[#171f33] border border-[#3e484f] hover:border-[#8ed5ff] transition-all rounded py-1.5 text-[10px] font-mono font-bold tracking-wider text-[#8ed5ff] hover:text-white uppercase mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Cross-Reference inside Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
