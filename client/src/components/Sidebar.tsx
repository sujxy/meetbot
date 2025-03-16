import { Home, CalendarPlus, FileText, Settings } from "lucide-react";

interface SidebarNavProps {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function SidebarNav({ onNavigate, currentView }: SidebarNavProps) {
  const navItems = [
    {
      id: "home",
      title: "Home",
      icon: Home,
    },
    {
      id: "join",
      title: "Join Meeting",
      icon: CalendarPlus,
    },
    {
      id: "summaries",
      title: "Summaries",
      icon: FileText,
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="border-r border-gray-300 w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-gray-300 px-4">
          <h2 className="text-lg font-semibold">MeetBot</h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`
                  flex h-10 w-full items-center justify-start gap-2 rounded-md px-3 text-sm transition-all
                  ${
                    currentView === item.id
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:bg-gray-100 hover:text-black"
                  }
                `}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-300 p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200">
              <span className="flex h-full w-full items-center justify-center text-xs font-medium ">
                SS
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Sujay Singh</p>
              <p className="text-xs text-muted">sujay@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
