import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BillProvider } from "./context/BillContext";
import { TransferProvider } from "./context/TransferContext";
import { CardProvider } from "./context/CardContext";
import { SettingsProvider } from "./context/SettingsContext";
import Index from "./pages/Index";
import Bills from "./pages/Bills";
import Transfers from "./pages/Transfers";
import Cards from "./pages/Cards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <BillProvider>
          <TransferProvider>
            <CardProvider>
              <Toaster />
              <Sonner position="top-center" />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/pix" element={<Transfers />} />
                  <Route path="/cards" element={<Cards />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CardProvider>
          </TransferProvider>
        </BillProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;