import { Search, Settings, HelpCircle, User, AlertTriangle, Bell } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  activeAlertCount: number;
  onOpenAlerts: () => void;
}

export default function Header({ onSearch, activeAlertCount, onOpenAlerts }: HeaderProps) {
  return (
    <header className="flex-none bg-[#0b1326] border-b border-[#3e484f] flex justify-between items-center w-full px-6 h-14 z-50">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8ed5ff]" />
          Acoustic Anomaly Triage
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-64 md:block hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdc8d1] w-4 h-4" />
          <input
            className="w-full bg-[#131b2e] border border-[#3e484f] rounded text-xs text-[#dae2fd] pl-9 pr-3 py-1.5 focus:border-[#8ed5ff] focus:ring-1 focus:ring-[#8ed5ff] focus:outline-none transition-colors"
            placeholder="Search sessions, tags..."
            type="text"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {activeAlertCount > 0 && (
            <button
              onClick={onOpenAlerts}
              className="relative text-[#ffb4ab] hover:bg-[#222a3d] transition-colors p-2 rounded cursor-pointer active:scale-95 duration-100 flex items-center gap-1"
              title="Active Alerts Trigger"
            >
              <Bell className="w-5 h-5 animate-bounce" />
              <span className="absolute -top-0.5 -right-0.5 bg-[#93000a] text-white border border-[#ffb4ab] text-[9px] font-bold px-1 rounded-full">
                {activeAlertCount}
              </span>
            </button>
          )}

          <button className="text-[#bdc8d1] hover:text-white hover:bg-[#222a3d] transition-colors p-2 rounded cursor-pointer active:scale-95 duration-100">
            <Settings className="w-5 h-5" />
          </button>
          <button className="text-[#bdc8d1] hover:text-white hover:bg-[#222a3d] transition-colors p-2 rounded cursor-pointer active:scale-95 duration-100">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="text-[#bdc8d1] hover:text-white hover:bg-[#222a3d] transition-colors p-2 rounded cursor-pointer active:scale-95 duration-100 flex items-center gap-1.5 border border-[#3e484f] px-2.5 py-1 rounded-sm bg-[#131b2e]">
            <User className="w-4 h-4" />
            <span className="text-[11px] font-mono font-medium tracking-wide">OPERATOR</span>
          </button>
        </div>
      </div>
    </header>
  );
}
