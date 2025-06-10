import {
  Home,
  CalendarPlus,
  FileText,
  Settings,
  Loader,
  MessageSquare,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/userContext";

const navItems = [
  {
    id: "home",
    route: "/",
    title: "Home",
    icon: Home,
  },
  {
    id: "join-meeting",
    route: "/join-meeting",
    title: "Join Meeting",
    icon: CalendarPlus,
  },
  {
    id: "summary",
    route: "/summary",
    title: "Summaries",
    icon: FileText,
  },
  {
    id: "chat",
    route: "/chat",
    title: "Chat with Meeting",
    icon: MessageSquare,
  },
  {
    id: "settings",
    route: "/settings",
    title: "Settings",
    icon: Settings,
  },
];

const getPageRoute = () => {
  const path = window.location.pathname;

  if (path.startsWith("/summary")) {
    return "summary";
  } else if (path.startsWith("/join-meeting")) {
    return "join-meeting";
  } else if (path.startsWith("/settings")) {
    return "settings";
  } else if (path.startsWith("/chat")) {
    return "chat";
  } else {
    return "home";
  }
};

export function SidebarNav() {
  const navigate = useNavigate();
  const { user, isLoading } = useUserContext();
  const activePage = getPageRoute();

  return (
    <div className="border-r border-gray-300 w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center gap-1 justify-start  border-b border-gray-300 px-4">
          <img src={"/favicon.png"} className="w-6 h-6" />
          <h2 className="text-xl font-semibold">
            Meet<span className="font-light">Bot</span>
          </h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`
                  flex h-10 w-full items-center justify-start gap-2 rounded-md px-3 text-sm transition-all
                  ${
                    activePage === item.id
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:bg-gray-100 hover:text-black"
                  }
                `}
                onClick={() => navigate(item.route)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-300 p-4">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader className={"animate-spin mx-auto"} />
            ) : (
              <>
                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    className="flex h-full w-full items-center justify-center text-xs font-medium "
                    src={user?.picture}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
