import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BillProvider } from "./context/BillContext";
import { TransferProvider } from "./context/TransferContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CardProvider } from "./context/CardContext";
import { ShoppingListProvider } from "./context/ShoppingListContext";
import Index from "./pages/Index";
import Bills from "./pages/Bills";
import Transfers from "./pages/Transfers";
import Settings from "./pages/Settings";
import ShoppingList from "./pages/ShoppingList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <CardProvider>
          <BillProvider>
            <TransferProvider>
              <ShoppingListProvider>
                <Toaster />
                <Sonner position="top-center" />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/bills" element={<Bills />} />
                    <Route path="/pix" element={<Transfers />} />
                    <Route path="/shopping" element={<ShoppingList />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </ShoppingListProvider>
            </TransferProvider>
          </BillProvider>
        </CardProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;