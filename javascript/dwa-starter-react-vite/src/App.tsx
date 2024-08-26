import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import PWABadge from "@/PWABadge.tsx";
import { Sidebar, SidebarButton } from "@/layout/Sidebar.tsx";
import { SettingsPage } from "@/pages/settings-page";
import { HomePage } from "@/pages/home-page";
import { AboutPage } from "@/pages/about-page";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Web5Provider } from "@/web5/Web5Provider";

export const App = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Web5Provider>
          <div className="flex md:min-h-screen">
            {isDesktop && <Sidebar className="min-h-screen fixed w-64" />}
            <div className={`p-4 w-full ${isDesktop ? "ml-64" : ""}`}>
              {!isDesktop && <SidebarButton />}
              <Routes>
                <Route path="/about" element={<AboutPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<HomePage />} />
              </Routes>
            </div>
            <PWABadge />
            <Toaster />
          </div>
        </Web5Provider>
      </ThemeProvider>
    </Router>
  );
};
