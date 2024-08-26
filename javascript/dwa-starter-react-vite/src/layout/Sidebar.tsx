import { useNavigate, useLocation } from "react-router-dom";
import {
  HouseIcon,
  MenuIcon,
  XIcon,
  SettingsIcon,
  LifeBuoyIcon,
  LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import "./Sidebar.css";
import { Web5Connection } from "@/web5/Web5Connection";
import { ModeToggle } from "@/components/mode-toggle";
import { useWeb5 } from "@/web5";

export const SidebarButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" className="m-2" onClick={() => setOpen(!open)}>
        <MenuIcon className="h-6 w-6" />
      </Button>
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)}></div>
      )}
      <div className={`sidebar-content ${open ? "open" : "closed"}`}>
        <div className="absolute right-4 top-2">
          <Button variant="ghost" onClick={() => setOpen(!open)}>
            <XIcon className="h-6 w-6" />
          </Button>
        </div>
        <Sidebar
          className="mt-8 min-h-full"
          onItemClick={() => setOpen(false)}
        />
      </div>
    </>
  );
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void;
}

export const Sidebar = ({ className, onItemClick }: SidebarProps) => {
  const { isConnected } = useWeb5();
  return (
    <nav className={cn("pb-12 flex flex-col justify-between", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex justify-between mb-2 px-4">
            <h2 className="text-lg font-semibold tracking-tight">My DWA</h2>
            <ModeToggle />
          </div>
          <div className="space-y-1">
            <SidebarMenuItem
              onItemClick={onItemClick}
              icon={HouseIcon}
              label="Home"
              path="/"
            />
            {isConnected && (
              <SidebarMenuItem
                onItemClick={onItemClick}
                icon={SettingsIcon}
                label="Settings"
                path="/settings"
              />
            )}
            <SidebarMenuItem
              onItemClick={onItemClick}
              icon={LifeBuoyIcon}
              label="About"
              path="/about"
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <Web5Connection connectButtonClassName={"w-full justify-between"} />
      </div>
    </nav>
  );
};

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  onItemClick?: () => void;
}

const SidebarMenuItem = ({
  icon: Icon,
  label,
  path,
  onItemClick,
}: SidebarMenuItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;
  const variant = isActive ? "secondary" : "ghost";

  return (
    <Button
      variant={variant}
      className="w-full justify-start"
      onClick={() => {
        navigate(path);
        onItemClick?.();
      }}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};
