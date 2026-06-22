import {
  LayoutDashboard,
  Activity,
  Database,
  TrendingUp,
  BarChart2,
  History,
  Cpu,
  BookOpen,
  Plus,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNewSession: () => void;
}

export default function Sidebar({ currentTab, onTabChange, onNewSession }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "testbed", label: "Testbed Monitor", icon: Activity },
    { id: "analysis", label: "Analysis Workspace", icon: TrendingUp },
    { id: "reports", label: "Reports", icon: BarChart2 },
    { id: "archives", label: "Archives", icon: History }
  ];

  const bottomItems = [
    { id: "status", label: "System Status", icon: Cpu },
    { id: "docs", label: "Documentation", icon: BookOpen }
  ];

  return (
    <nav className="fixed left-0 top-14 h-[calc(100vh-56px)] flex flex-col z-40 bg-[#131b2e] border-r border-[#3e484f] w-64 pb-4">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#3e484f] flex items-center gap-3 bg-[#0d1527]">
        <div className="w-8 h-8 rounded bg-[#38bdf8] flex items-center justify-center text-[#004965] shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#8ed5ff] leading-tight">Anomaly Triage</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#bdc8d1] mt-0.5">
            Technical Mode
          </div>
        </div>
      </div>

      {/* New Session Button */}
      <div className="p-4 border-b border-[#3e484f]">
        <button
          onClick={onNewSession}
          className="w-full bg-[#8ed5ff] text-[#00354a] hover:bg-[#c4e7ff] transition-all duration-150 py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 relative cursor-pointer group ${
                isActive
                  ? "bg-[#171f33] text-[#8ed5ff] border-l-4 border-[#8ed5ff] font-semibold"
                  : "text-[#bdc8d1] hover:bg-[#171f33] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#8ed5ff]" : "text-[#bdc8d1] group-hover:text-white"}`} />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#8ed5ff] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Items */}
      <div className="mt-auto border-t border-[#3e484f] pt-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left text-[10px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                isActive ? "text-[#8ed5ff] bg-[#171f33]" : "text-[#bdc8d1] hover:bg-[#171f33]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
