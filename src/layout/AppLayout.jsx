import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import AppHeader from "./AppHeader";
import { Toaster } from "react-hot-toast";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <Toaster
          toastOptions={{
            style: {
              zIndex: 999999999, // highest possible, above everything
            },
          }}
          position="top-right"
        />
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
