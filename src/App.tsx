import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <header className="h-14 flex items-center border-b border-border bg-card px-4">
                <SidebarTrigger className="mr-2" />
                <h1 className="text-lg font-semibold text-hydraulic-primary">
                  Hydraulic Press Monitoring Dashboard
                </h1>
              </header>
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/simulation" element={<Simulation />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/shift" element={<Index />} />
                  <Route path="/auto" element={<Index />} />
                  <Route path="/electronic-drawing" element={<Index />} />
                  <Route path="/hydraulic-drawing" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
