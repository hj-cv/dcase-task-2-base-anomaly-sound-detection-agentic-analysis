import { Session } from "../types";
import {
  FolderOpen,
  FileAudio,
  AlertTriangle,
  PlaySquare,
  ChevronRight,
  TrendingUp,
  Database,
  ArrowRight
} from "lucide-react";

interface OverviewProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  onFilterClick?: () => void;
  onExportClick?: () => void;
}

export default function Overview({ sessions, onSelectSession, onFilterClick, onExportClick }: OverviewProps) {
  // Compute some metrics from live sessions state
  const totalSessionsCount = 42; // static as per reference image design
  const clipsProcessedCount = 1240; // static as per reference image design
  const anomalyCandidatesCount = 86; // static as per reference image design

  // Custom mock points for Model Performance Baseline (DCASE AUC spline)
  const chartPoints = [0.72, 0.74, 0.76, 0.73, 0.78, 0.81, 0.80, 0.83, 0.84, 0.82, 0.85, 0.84];
  const maxVal = 0.90;
  const minVal = 0.70;

  // Convert chart points to SVG polyline coordinates
  const width = 280;
  const height = 60;
  const svgPoints = chartPoints
    .map((val, idx) => {
      const x = (idx / (chartPoints.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0b1326] scrollbar-hide animate-fade-in">
      {/* Top Title/Menu Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">System Overview</h1>
          <p className="text-xs text-[#bdc8d1] mt-1">
            High-level summary of acoustic processing queues and anomaly detection candidates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onFilterClick}
            className="px-3.5 py-1.5 bg-[#171f33] border border-[#3e484f] rounded text-[#dae2fd] text-xs font-semibold hover:border-[#8ed5ff] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>Filter</span>
          </button>
          <button
            onClick={onExportClick}
            className="px-3.5 py-1.5 bg-[#8ed5ff] text-[#00354a] hover:bg-[#c4e7ff] rounded text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sessions */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 flex justify-between items-start hover:border-[#8ed5ff]/50 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1]">
              Total Sessions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-white">{totalSessionsCount}</span>
              <span className="text-[10px] font-mono text-[#10b981] font-medium">+3 this week</span>
            </div>
          </div>
          <div className="p-2 rounded bg-[#0b1326] text-[#8ed5ff]">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Clips Processed */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 flex justify-between items-start hover:border-[#8ed5ff]/50 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1]">
              Total Clips Processed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-white">
                {clipsProcessedCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-[#dae2fd]/60 font-medium">~15.2 GB</span>
            </div>
          </div>
          <div className="p-2 rounded bg-[#0b1326] text-[#8ed5ff]">
            <FileAudio className="w-5 h-5" />
          </div>
        </div>

        {/* Anomaly Candidates */}
        <div className="bg-[#171f33] border border-[#ffb4ab]/30 rounded p-4 flex justify-between items-start hover:border-[#ffb4ab] transition-all glow-ready">
          <div className="space-y-1">
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#ffb4ab] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Anomaly Candidates
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-[#ffb4ab]">
                {anomalyCandidatesCount}
              </span>
              <span className="text-[10px] font-mono text-[#ffb4ab]/70 font-medium font-bold">
                Pending review
              </span>
            </div>
          </div>
          <div className="p-2 rounded bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/20">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Middle Grid Row: Charts & Datasets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Model Performance Baseline */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1]">
              Model Performance Baseline
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mt-2 gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] text-[#bdc8d1]">Mean AUC (DCASE Benchmark)</span>
                <span className="text-2xl font-mono font-bold text-[#8ed5ff]">0.84</span>
              </div>
              <span className="text-xs font-mono text-[#f1a02b]">
                Target Baseline: <strong className="font-bold">0.90</strong>
              </span>
            </div>
          </div>

          {/* SVG Baseline spline chart */}
          <div className="h-20 bg-[#0b1326] border border-[#3e484f] rounded relative flex items-center px-4 overflow-hidden">
            <div className="absolute top-2 left-4 text-[9px] font-mono text-[#bdc8d1]/50">
              0.90 Target
            </div>
            <div className="absolute bottom-2 left-4 text-[9px] font-mono text-[#bdc8d1]/50">
              0.70 Min
            </div>
            {/* Target line */}
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-[#f1a02b]/45" />

            <svg className="w-full h-12 overflow-visible" viewBox={`0 0 ${width} 60`} preserveAspectRatio="none">
              {/* Shaded Area under spline */}
              <defs>
                <linearGradient id="splineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8ed5ff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8ed5ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,60 ${svgPoints} ${width},60`}
                fill="url(#splineGrad)"
              />
              {/* Spline peak line */}
              <polyline
                fill="none"
                stroke="#8ed5ff"
                strokeWidth="2"
                points={svgPoints}
              />
            </svg>
          </div>
        </div>

        {/* Dataset Quick Access */}
        <div className="bg-[#171f33] border border-[#3e484f] rounded p-4 space-y-3">
          <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1]">
            Dataset Quick Access
          </span>

          <div className="space-y-2">
            {[
              { name: "DCASE2023", desc: "Acoustic Triage Benchmark Folder", count: 24 },
              { name: "3D Printer (MIMII)", desc: "Fan noise with extruder click indicators", count: 18 }
            ].map((dataset, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSession(sessions[idx % sessions.length].id)}
                className="w-full text-left bg-[#0b1326] hover:bg-[#222a3d] border border-[#3e484f] hover:border-[#8ed5ff] transition-all rounded p-2.5 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-[#8ed5ff]" />
                  <div>
                    <div className="text-xs font-mono font-medium text-white group-hover:text-[#8ed5ff]">
                      {dataset.name}
                    </div>
                    <div className="text-[10px] text-[#bdc8d1] mt-0.5">{dataset.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#bdc8d1] group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Sessions */}
      <div className="bg-[#171f33] border border-[#3e484f] rounded overflow-hidden">
        <div className="px-4 py-3 bg-[#131b2e] border-b border-[#3e484f] flex justify-between items-center">
          <span className="text-[10px] tracking-wider uppercase font-bold text-[#bdc8d1]">
            Recent Triage Sessions
          </span>
          <span className="text-[10px] font-mono text-[#8ed5ff] hover:underline cursor-pointer select-none">
            Active Real-time Buffer
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3e484f] text-[9px] uppercase tracking-wider text-[#bdc8d1]/80 font-bold font-mono">
                <th className="px-4 py-2.5">Session ID</th>
                <th className="px-4 py-2.5">Date / Time (UTC)</th>
                <th className="px-4 py-2.5">Monitoring Node</th>
                <th className="px-4 py-2.5">Process Timer</th>
                <th className="px-4 py-2.5 text-right">Candidates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3e484f]/50 font-mono text-xs">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className="hover:bg-[#222a3d] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 font-semibold text-white group-hover:text-[#8ed5ff]">
                    {session.id}
                  </td>
                  <td className="px-4 py-3 text-[#bdc8d1]">{session.timestamp}</td>
                  <td className="px-4 py-3 text-[#bdc8d1]">{session.device}</td>
                  <td className="px-4 py-3 text-[#bdc8d1]/60 text-[11px]">{session.duration}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                        session.status === "warning"
                          ? "bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/20 animate-pulse"
                          : "bg-[#222a3d] text-[#bdc8d1]"
                      }`}
                    >
                      {session.candidatesCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
