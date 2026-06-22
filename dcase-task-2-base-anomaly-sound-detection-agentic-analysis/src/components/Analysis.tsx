import React, { useState, useEffect, useRef } from "react";
import { Segment } from "../types";
import { playSynthSound, stopSynthSound } from "../utils/audioSynth";
import {
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  BrainCircuit,
  Maximize2,
  Trash2,
  Wand2,
  FileText,
  Clock,
  VolumeX,
  Gauge
} from "lucide-react";

interface AnalysisProps {
  initialSegments: Segment[];
  selectedSegmentId: string | null;
  onSelectSegment: (id: string | null) => void;
}

export default function Analysis({
  initialSegments,
  selectedSegmentId,
  onSelectSegment
}: AnalysisProps) {
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [sortBy, setSortBy] = useState<"score-desc" | "score-asc" | "time-desc">("score-desc");
  const [activeSegId, setActiveSegId] = useState<string>(selectedSegmentId || "Seg-0042");

  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>("1.0x");
  const [volume, setVolume] = useState<number>(80);
  const [noteText, setNoteText] = useState<string>("");
  const [diagnosticReport, setDiagnosticReport] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // Spectrogram & Waveform drawing Refs
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Find active segment
  const activeSegment = segments.find((s) => s.id === activeSegId) || segments[0];

  // Synchronize active segment ID from parent components
  useEffect(() => {
    if (selectedSegmentId) {
      setActiveSegId(selectedSegmentId);
    }
  }, [selectedSegmentId]);

  // Synchronize operator comments when segment changes
  useEffect(() => {
    if (activeSegment) {
      setNoteText(activeSegment.operatorNotes || "");
      setDiagnosticReport(activeSegment.diagnosticExplanation || "");
    }
  }, [activeSegId]);

  // Handle Play/Pause
  const togglePlayback = () => {
    if (isPlaying) {
      stopSynthSound();
      setIsPlaying(false);
    } else {
      playSynthSound(activeSegment.waveformType);
      setIsPlaying(true);
    }
  };

  // Keep playback timer running when playing sound
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackTime((p) => {
          if (p >= 3) {
            // loop after 3s
            return 0;
          }
          return p + 0.1;
        });
      }, 100);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Stop sound if segment is switched or component is unmounted
  useEffect(() => {
    stopSynthSound();
    setIsPlaying(false);
    setPlaybackTime(0);
    return () => stopSynthSound();
  }, [activeSegId]);

  // Render a dynamic waterfall spectrogram on play
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isAnomaly = activeSegment.waveformType === "anomaly";

      // Draw beautiful log-mel frequency layers
      const rows = 40;
      const cols = 50;
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // base signal
          let val = Math.sin((c + offset) * 0.15) * Math.cos(r * 0.1);
          
          if (isAnomaly) {
            // Peak spikes representing loose scraping faults at index 4200Hz
            if (r > 12 && r < 18) {
              val += Math.random() * 2.5 + 1.2;
            }
          }
          
          if (isPlaying) {
            val += Math.random() * 0.6;
          }

          // Compute heatmap colors: deep blue/purple (quiescent) to bright orange/yellow (peak)
          const norm = Math.min(Math.max((val + 1) / 2, 0), 1);
          let rColor, gColor, bColor;

          if (norm < 0.3) {
            rColor = Math.floor(norm * 40);
            gColor = Math.floor(norm * 10);
            bColor = Math.floor(40 + norm * 200);
          } else if (norm < 0.75) {
            const ratio = (norm - 0.3) / 0.45;
            rColor = Math.floor(40 + ratio * 200);
            gColor = Math.floor(10 + ratio * 100);
            bColor = Math.floor(240 - ratio * 200);
          } else {
            const ratio = (norm - 0.75) / 0.25;
            rColor = 255;
            gColor = Math.floor(110 + ratio * 145);
            bColor = Math.floor(40 - ratio * 40);
          }

          ctx.fillStyle = `rgb(${rColor}, ${gColor}, ${bColor})`;
          ctx.fillRect(c * cellWidth, canvas.height - (r * cellHeight), cellWidth, cellHeight);
        }
      }

      // Draw playable time scan-line
      if (isPlaying) {
        offset += playbackSpeed === "1.5x" ? 1.5 : playbackSpeed === "2.0x" ? 2.0 : 1;
        const progressX = (playbackTime / 3) * canvas.width;
        ctx.strokeStyle = "#f1a02b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, canvas.height);
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [activeSegId, isPlaying, playbackTime, playbackSpeed, activeSegment]);

  // Request high-fidelity anomaly analysis from the server report endpoint
  const requestDiagnosticReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/diagnose-anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentId: activeSegment.id,
          anomalyScore: activeSegment.anomalyScore,
          predictedStatus: activeSegment.status,
          possibleCause: activeSegment.possibleCause,
          evidence: {
            for: activeSegment.evidenceFor,
            against: activeSegment.evidenceAgainst
          },
          userNotes: noteText
        })
      });

      const data = await response.json();
      if (data.success) {
        setDiagnosticReport(data.explanation);
        // Persist explanation in state
        setSegments((prev) =>
          prev.map((s) => (s.id === activeSegId ? { ...s, diagnosticExplanation: data.explanation } : s))
        );
      }
    } catch (error) {
      console.error("Diagnostic report request failed:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Sort and Filter Logic
  const sortedSegments = [...segments].sort((a, b) => {
    if (sortBy === "score-desc") return b.anomalyScore - a.anomalyScore;
    if (sortBy === "score-asc") return a.anomalyScore - b.anomalyScore;
    return b.timestamp.localeCompare(a.timestamp);
  });

  // Verification button handlers
  const handleVerify = (triageStatus: "confirmed" | "dismissed" | "reviewed") => {
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id === activeSegId) {
          return {
            ...s,
            isConfirmed: triageStatus === "confirmed",
            isDismissed: triageStatus === "dismissed",
            isReviewed: triageStatus === "reviewed",
            operatorNotes: noteText
          };
        }
        return s;
      })
    );
  };

  // Convert rich markdown segments to basic JSX structure safely
  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-2 mt-1">
        {lines.map((line, idx) => {
          if (line.startsWith("### ")) {
            return (
              <h4 key={idx} className="text-xs font-semibold text-[#8ed5ff] tracking-wide mt-3 mb-1 uppercase font-mono">
                {line.replace("### ", "")}
              </h4>
            );
          }
          if (line.startsWith("#### ")) {
            return (
              <h5 key={idx} className="text-[11px] font-bold text-[#b9c8de] mt-2 font-mono">
                {line.replace("#### ", "")}
              </h5>
            );
          }
          if (line.startsWith("- **")) {
            return (
              <p key={idx} className="text-[11px] text-[#bdc8d1] pl-2 font-mono">
                • {line.replace("- **", "").replace("**", "")}
              </p>
            );
          }
          if (line.startsWith("- [ ]")) {
            return (
              <div key={idx} className="flex items-center gap-2 pl-2 text-[11.5px] font-mono text-[#dae2fd]">
                <input type="checkbox" className="rounded-sm bg-[#0b1326] border-[#3e484f] text-[#8ed5ff] checked:bg-[#8ed5ff]" readOnly checked={false} />
                <span>{line.replace("- [ ] ", "")}</span>
              </div>
            );
          }
          if (line.startsWith("- [x]")) {
            return (
              <div key={idx} className="flex items-center gap-2 pl-2 text-[11.5px] font-mono text-[#dae2fd]">
                <input type="checkbox" className="rounded-sm bg-[#0b1326] border-[#3e484f] text-[#8ed5ff]" readOnly checked />
                <span>{line.replace("- [x] ", "")}</span>
              </div>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <p key={idx} className="text-[11px] text-[#bdc8d1] pl-2">
                • {line.replace("- ", "")}
              </p>
            );
          }
          return <p key={idx} className="text-[11.5px] text-[#bdc8d1] leading-relaxed">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0b1326] p-4 gap-4 animate-fade-in">
      {/* LEFT COLUMN: Segments List */}
      <div className="w-80 flex flex-col bg-[#131b2e] border border-[#3e484f] rounded overflow-hidden">
        <div className="p-3 border-b border-[#3e484f] flex justify-between items-center bg-[#0d1527]">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#bdc8d1]">
              Acoustic Segments
            </h2>
            <div className="text-[10px] text-[#bdc8d1]/60 font-mono mt-0.5">
              {segments.length} total segments recorded
            </div>
          </div>
          <span className="bg-[#171f33] border border-[#3e484f] text-[10px] font-mono text-[#8ed5ff] px-2 py-0.5 rounded">
            Active Block
          </span>
        </div>

        {/* Filter / Sort dropdown */}
        <div className="p-2 border-b border-[#3e484f]/60 bg-[#0d1527]/50 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-[#bdc8d1]/70 font-mono">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#0b1326] border border-[#3e484f] rounded text-[11px] text-[#dae2fd] p-1 pr-4 focus:outline-none focus:border-[#8ed5ff] font-mono"
          >
            <option value="score-desc">Score (Highest)</option>
            <option value="score-asc">Score (Lowest)</option>
            <option value="time-desc">Time Recorded</option>
          </select>
        </div>

        {/* Segment Item Elements */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#3e484f]/40 scrollbar-hide">
          {sortedSegments.map((seg) => {
            const isSelected = seg.id === activeSegId;
            return (
              <button
                key={seg.id}
                onClick={() => {
                  setActiveSegId(seg.id);
                  onSelectSegment(seg.id);
                }}
                className={`w-full text-left p-3 transition-all cursor-pointer relative ${
                  isSelected ? "bg-[#171f33] border-l-2 border-[#8ed5ff]" : "hover:bg-[#171f33]/45"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block group-hover:text-[#8ed5ff]">
                      {seg.id}
                    </span>
                    <span className="text-[9px] font-mono text-[#bdc8d1] block mt-0.5 select-none">
                      {seg.duration}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm select-none ${
                        seg.anomalyScore >= 0.75
                          ? "bg-[#93000a]/20 text-[#ffb4ab]"
                          : seg.anomalyScore >= 0.5
                          ? "bg-[#613b00]/30 text-[#ffc176]"
                          : "bg-[#222a3d]/50 text-[#bdc8d1]"
                      }`}
                    >
                      {seg.anomalyScore.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[10px] text-[#bdc8d1]/60 font-mono">
                    {seg.waveformType === "anomaly" ? "⚠️ anomaly" : "✓ standard hum"}
                  </span>

                  {/* Operational status marker */}
                  <div className="flex gap-1">
                    {seg.isConfirmed && (
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-[#10b981]/25 text-[#10b981] px-1 rounded-sm border border-[#10b981]/30">
                        confirmed
                      </span>
                    )}
                    {seg.isDismissed && (
                      <span className="text-[8px] uppercase tracking-wider font-bold bg-[#64748b]/20 text-[#bdc8d1] px-1 rounded-sm border border-[#64748b]/35">
                        dismissed
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER COLUMN: Live Signal & Waterfall Spectrogram */}
      <div className="flex-1 flex flex-col gap-3 min-w-[420px]">
        {/* Dynamic score summary timeline */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#3e484f]/50">
            <div>
              <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1] font-mono block">
                ANOMALY SCORE TIMELINE
              </span>
              <span className="text-xs font-mono font-semibold text-white mt-1 block">
                {activeSegment.id} • Acoustic Amplitude Stream Analysis
              </span>
            </div>
            <Maximize2 className="w-4 h-4 text-[#bdc8d1]/60" />
          </div>

          {/* Draw a gorgeous stylized vector score timeline representing sound fluctuations */}
          <div className="h-16 mt-3 bg-[#0b1326] rounded border border-[#3e484f]/60 relative flex items-end px-1 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 450 60" preserveAspectRatio="none">
              <path
                d={
                  activeSegment.waveformType === "anomaly"
                    ? "M 0 55 Q 50 50 100 45 T 200 48 T 300 10 T 310 8 T 320 54 T 400 48 T 450 45"
                    : "M 0 52 Q 80 48 160 52 T 320 49 T 450 50"
                }
                fill="none"
                stroke={activeSegment.waveformType === "anomaly" ? "#ffb4ab" : "#8ed5ff"}
                strokeWidth="2"
              />
              <path
                d={
                  activeSegment.waveformType === "anomaly"
                    ? "M 0 55 Q 50 50 100 45 T 200 48 T 300 10 T 310 8 T 320 54 T 400 48 T 450 45 L 450 60 L 0 60 Z"
                    : "M 0 52 Q 80 48 160 52 T 320 49 T 450 50 L 450 60 L 0 60 Z"
                }
                fill={activeSegment.waveformType === "anomaly" ? "rgba(255,180,171,0.06)" : "rgba(142,213,255,0.03)"}
              />
              {/* Threshold indicator line */}
              <line x1="0" y1="20" x2="450" y2="20" stroke="#f1a02b" strokeDasharray="3,3" strokeOpacity="0.4" />
            </svg>
            <div className="absolute top-1 left-3 text-[9px] font-mono text-[#f1a02b]/70 select-none">
              Threshold Limit: 0.75
            </div>
          </div>
        </div>

        {/* Waveform Sound synthesis player card */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1] font-mono">
              WAVEFORM (SYNTHESIZED RAW PCM)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#2d3449] px-1.5 py-0.5 rounded text-[#bdc8d1]">
                SAMPLE RATE: 24 kHz
              </span>
            </div>
          </div>

          {/* Interactive play signal bar chart visualizer */}
          <div className="h-20 bg-[#0b1326] border border-[#3e484f] rounded relative flex items-center px-4 overflow-hidden">
            <div className="flex items-end gap-[2px] h-14 w-full">
              {Array.from({ length: 48 }).map((_, idx) => {
                const isWaveformAnomaly = activeSegment.waveformType === "anomaly";
                // Simulate periodic spikes
                const baseHeight = Math.sin(idx * 0.3) * 16 + 22;
                let finalHt = baseHeight;
                if (isWaveformAnomaly && idx > 25 && idx < 34) {
                  finalHt = Math.random() * 20 + 38;
                }
                const isSpotlighted = isPlaying && idx === Math.floor((playbackTime / 3) * 48);

                return (
                  <div
                    key={idx}
                    style={{ height: `${finalHt}%` }}
                    className={`w-full transition-all duration-100 rounded-sm ${
                      isSpotlighted
                        ? "bg-[#f1a02b] shadow-[0_0_8px_#f1a02b]"
                        : isWaveformAnomaly && idx > 25 && idx < 34
                        ? "bg-[#ffb4ab]/85 glow-error"
                        : "bg-[#8ed5ff]/60"
                    }`}
                  />
                );
              })}
            </div>

            {/* Custom playhead needle slider */}
            <div
              style={{ left: `${(playbackTime / 3) * 100}%` }}
              className="absolute top-0 bottom-0 w-[1.5px] bg-[#f1a02b] transition-all duration-100 pointer-events-none"
            />
          </div>

          {/* Sound play controls row */}
          <div className="bg-[#131b2e] p-2 rounded border border-[#3e484f]/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayback}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${
                  isPlaying ? "bg-[#ffb4ab] text-[#690005]" : "bg-[#8ed5ff] text-[#00354a]"
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
              </button>

              <div className="text-[11px] font-mono text-[#dae2fd] ml-1">
                <span>00:14:{(22.4 + playbackTime).toFixed(1)}</span>
                <span className="text-[#bdc8d1]/50 mx-1">/</span>
                <span className="text-[#bdc8d1]">00:14:25.1</span>
              </div>
            </div>

            {/* Audio slider and volume controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 scrollbar-hide">
                <button
                  onClick={() => setVolume((v) => (v > 0 ? 0 : 80))}
                  className="text-[#bdc8d1] hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 accent-[#8ed5ff] h-1"
                />
              </div>

              {/* Speed modifiers */}
              <div className="flex gap-1">
                {["1.0x", "1.5x", "2.0x"].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                      playbackSpeed === spd ? "bg-[#8ed5ff] text-[#00354a] font-bold" : "bg-[#0b1326] text-[#bdc8d1] hover:bg-[#222a3d]"
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Log-Mel Spectrogram view canvas */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-3 flex flex-col gap-1.5 flex-1 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1] font-mono">
              LOG-MEL SPECTROGRAM HEATMAP (INTERACTIVE WATERFALL)
            </span>
            <div className="text-[9px] font-mono text-[#bdc8d1]/60">
              N_FFT: 2048 | HOP: 512
            </div>
          </div>

          <div className="flex-1 bg-[#0b1326] rounded border border-[#3e484f]/60 relative overflow-hidden flex flex-col justify-between p-1 select-none">
            {/* Frequency scale sidebar markers */}
            <div className="absolute left-2 top-2 bottom-2 font-mono text-[8px] text-[#bdc8d1]/50 flex flex-col justify-between pointer-events-none z-10">
              <span>8.0 kHz</span>
              <span>4.2 kHz (Spike)</span>
              <span>2.0 kHz</span>
              <span>Baseline</span>
            </div>

            <canvas
              ref={spectrogramCanvasRef}
              width="480"
              height="160"
              className="w-full h-full rounded opacity-90 select-none cursor-crosshair"
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Operator Verification and diagnosis logs */}
      <div className="w-96 flex flex-col bg-[#131b2e] border border-[#3e484f] rounded overflow-hidden">
        <div className="p-3 border-b border-[#3e484f] bg-[#0d1527] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#bdc8d1]">
            Segment Analysis
          </span>
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/20 px-1.5 rounded">
            v2.4 Engine
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
          {/* Diagnostics score gauges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0b1326] border border-[#3e484f]/60 rounded p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-[#bdc8d1] font-mono">MAX PEAK SCORE</span>
              <div className="text-xl font-bold font-mono text-[#ffb4ab] my-1">
                {activeSegment.anomalyScore.toFixed(2)}
              </div>
              <div className="text-[9px] text-[#bdc8d1]/50 font-mono">
                Threshold: 0.75
              </div>
            </div>

            <div className="bg-[#0b1326] border border-[#3e484f]/60 rounded p-2.5 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-[#bdc8d1] font-mono">PREDICTED STATUS</span>
              <div
                className={`text-xs font-bold uppercase font-mono tracking-wider my-2.5 ${
                  activeSegment.anomalyScore >= 0.75
                    ? "text-[#ffb4ab]"
                    : activeSegment.anomalyScore >= 0.5
                    ? "text-[#ffc176]"
                    : "text-[#10b981]"
                }`}
              >
                {activeSegment.status}
              </div>
              <div className="text-[9px] text-[#bdc8d1]/50 font-mono">
                Automation Triage
              </div>
            </div>
          </div>

          {/* Evidence assessments block */}
          <div className="bg-[#0b1326] border border-[#3e484f] rounded p-3 space-y-2.5">
            <div className="flex items-center gap-1 text-[#cbd5e1] font-semibold text-xs border-b border-[#3e484f]/50 pb-1.5 leading-none select-none">
              <Cpu className="w-4 h-4 text-[#8ed5ff]" />
              <span>STRUCTURAL PATTERN ASSESSMENT</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#ffc176] font-bold uppercase block tracking-wider font-mono select-none">
                Cause Candidate:
              </span>
              <span className="text-xs text-white block leading-relaxed font-semibold">
                {activeSegment.possibleCause}
              </span>
            </div>

            <div className="space-y-2 font-mono">
              <div>
                <span className="text-[9px] text-[#10b981] font-bold block select-none uppercase tracking-wide">✓ Evidence For:</span>
                <ul className="text-[10px] text-[#bdc8d1]/90 list-disc list-inside mt-0.5 space-y-0.5">
                  {activeSegment.evidenceFor.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[9px] text-[#ffb4ab] font-bold block select-none uppercase tracking-wide">✗ Evidence Against:</span>
                <ul className="text-[10px] text-[#bdc8d1]/90 list-disc list-inside mt-0.5 space-y-0.5">
                  {activeSegment.evidenceAgainst.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[9px] font-mono text-[#bdc8d1]/50 flex justify-between pt-1 border-t border-[#3e484f]/30">
              <span>Uncertainty: <strong className="text-white">{activeSegment.uncertainty}</strong></span>
              <span>Model Version: v2.4</span>
            </div>
          </div>

          {/* Manual Operator Desk Summary Notes */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#bdc8d1] font-mono">
              Operator Log Summary Notes
            </span>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-[#0b1326] border border-[#3e484f] rounded p-2 text-xs text-[#dae2fd] focus:border-[#8ed5ff] focus:ring-1 focus:ring-[#8ed5ff] outline-none font-mono resize-none h-16 placeholder:text-[#bdc8d1]/40"
              placeholder="Input audit remarks or secondary technician review details..."
            />
          </div>

          {/* Human Triage Verification Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleVerify("confirmed")}
              className="flex-1 bg-[#93000a] hover:bg-[#ffdad6] hover:text-[#93000a] text-white border border-[#ffb4ab]/30 transition-all font-mono font-bold text-xs py-2 rounded-sm cursor-pointer select-none active:scale-95 text-center block uppercase"
            >
              Confirm Anomaly
            </button>
            <button
              onClick={() => handleVerify("dismissed")}
              className="px-3 bg-transparent border border-[#3e484f] text-[#bdc8d1] hover:bg-[#222a3d] transition-all font-mono py-2 rounded-sm text-xs cursor-pointer select-none active:scale-95 text-center uppercase"
            >
              Dismiss
            </button>
          </div>

          {/* Generated diagnosis panel */}
          <div className="bg-[#0b1326] border border-[#3e484f] rounded overflow-hidden">
            <div className="px-3 py-2.5 bg-[#171f33]/60 border-b border-[#3e484f] flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-[#8ed5ff] animate-pulse" />
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#8ed5ff] font-mono leading-none">
                  Maintenance Diagnosis
                </span>
              </div>
              <button
                onClick={requestDiagnosticReport}
                disabled={isGeneratingReport}
                className="text-[9px] bg-[#38bdf8]/10 text-[#8ed5ff] border border-[#38bdf8]/30 px-2 py-1 rounded-sm hover:bg-[#38bdf8]/20 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>{isGeneratingReport ? "Evaluating..." : "Regenerate"}</span>
              </button>
            </div>

            <div className="p-3 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto bg-[#070d1a] text-[#dae2fd]/90 border-t border-[#3e484f]/20 scrollbar-hide">
              {diagnosticReport ? (
                renderMarkdownText(diagnosticReport)
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-[#bdc8d1]/40 text-xs italic">
                    No active technician summary initialized.
                  </p>
                  <p className="text-[10px] text-[#bdc8d1]/60">
                    Click Regenerate above to evaluate the mechanical wear hypothesis on segment {activeSegment.id}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
