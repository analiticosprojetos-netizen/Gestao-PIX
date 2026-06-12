import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TransferProvider } from "./context/TransferContext";
import { CardProvider } from "./context/CardContext";
import { SettingsProvider } from "./context/SettingsContext";
import { LiderProvider } from "./context/LiderContext";
import { BillProvider } from "./context/BillContext";
import { ShoppingProvider } from "./context/ShoppingContext";
import Index from "./pages/Index";
import Transfers from "./pages/Transfers";
import Cards from "./pages/Cards";
import Lider from "./pages/Lider";
import Settings from "./pages/Settings";
import Bills from "./pages/Bills";
import ShoppingList from "./pages/ShoppingList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <TransferProvider>
          <CardProvider>
            <LiderProvider>
              <BillProvider>
                <ShoppingProvider>
                  <Toaster />
                  <Sonner position="top-center" />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/pix" element={<Transfers />} />
                      <Route path="/cards" element={<Cards />} />
                      <Route path="/lider" element={<Lider />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/boletos" element={<Bills />} />
                      <Route path="/lista" element={<ShoppingList />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </ShoppingProvider>
              </BillProvider>
            </LiderProvider>
          </CardProvider>
        </TransferProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;