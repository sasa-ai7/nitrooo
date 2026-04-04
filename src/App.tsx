import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeoProvider } from "@/context/GeoContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { OrderCenterProvider } from "@/context/OrderCenterContext";
import { TelemetryProvider } from "@/context/TelemetryContext";
import Index from "./pages/Index.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderResult from "./pages/OrderResult.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <GeoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TelemetryProvider>
              <OrderCenterProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders/:orderId" element={<OrderResult />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OrderCenterProvider>
            </TelemetryProvider>
          </BrowserRouter>
        </TooltipProvider>
      </GeoProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
