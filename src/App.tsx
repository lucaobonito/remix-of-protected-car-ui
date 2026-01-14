import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { VehiclesProvider } from "@/contexts/VehiclesContext";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { AchievementsProvider } from "@/contexts/AchievementsContext";
import { AuditProvider } from "@/contexts/AuditContext";
import { NavigationHistoryProvider } from "@/contexts/NavigationHistoryContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Inspections from "./pages/Inspections";
import NewInspection from "./pages/NewInspection";
import Kanban from "./pages/Kanban";
import Reports from "./pages/Reports";
import Rankings from "./pages/Rankings";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AuditProvider>
          <VehiclesProvider>
            <NotificationsProvider>
              <GoalsProvider>
                <AchievementsProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <NavigationHistoryProvider>
                        <Routes>
                          <Route path="/" element={<Navigate to="/login" replace />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/vehicles" element={<Vehicles />} />
                          <Route path="/inspections" element={<Inspections />} />
                          <Route path="/new-inspection" element={<NewInspection />} />
                          <Route path="/kanban" element={<Kanban />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/rankings" element={<Rankings />} />
                          <Route path="/users" element={<Users />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/audit" element={<AuditLog />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </NavigationHistoryProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </AchievementsProvider>
              </GoalsProvider>
            </NotificationsProvider>
          </VehiclesProvider>
        </AuditProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
