import { Outlet } from "react-router-dom";
import { SidebarNav } from "./Sidebar";
import { useState } from "react";

const Wrapper: React.FC = () => {
  const [pageType, setPageType] = useState<string>("home");
  return (
    <div className="flex min-h-screen min-w-screen ">
      <SidebarNav currentView={pageType} onNavigate={setPageType} />
      <div className="h-screen w-full overflow-y-scroll bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default Wrapper;
