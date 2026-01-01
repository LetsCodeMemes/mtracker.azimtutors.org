import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Features from "./pages/Features";
import AddPaper from "./pages/AddPaper";
import GradeSimulator from "./pages/GradeSimulator";
import RevisionPlan from "./pages/RevisionPlan";
import ExaminerInsights from "./pages/ExaminerInsights";
import { Placeholder } from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/features" element={<Features />} />
          {/* Protected routes */}
          <Route
            path="/add-paper"
            element={
              <ProtectedRoute>
                <AddPaper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <ProtectedRoute>
                <GradeSimulator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revision-plan"
            element={
              <ProtectedRoute>
                <RevisionPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/examiner-insights"
            element={
              <ProtectedRoute>
                <ExaminerInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Placeholder title="Profile Settings" description="Customize your account settings and preferences." />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
