import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Permits from "./pages/Permits";
import Clients from "./pages/Clients";
import Exports from "./pages/Exports";
import Presets from "./pages/Presets";
import Automations from "./pages/Automations";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  let isAuthed = false;
  try {
    isAuthed = !!localStorage.getItem("auth_user");
  } catch {}
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <RequireAuth>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full bg-background">
                      <AppSidebar />
                      <main className="flex-1 overflow-hidden">
                        <header className="h-14 border-b border-border bg-card flex items-center px-4">
                          <SidebarTrigger className="mr-4" />
                          <div className="flex-1" />
                        </header>
                        <div className="p-6 h-[calc(100vh-3.5rem)] overflow-y-auto">
                          <Routes>
                            <Route path="/welcome" element={<Welcome />} />
                            <Route path="/" element={<Index />} />
                            <Route path="/permits" element={<Permits />} />
                            <Route path="/clients" element={<Clients />} />
                            <Route path="/exports" element={<Exports />} />
                            <Route path="/presets" element={<Presets />} />
                            <Route path="/automations" element={<Automations />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </SidebarProvider>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;