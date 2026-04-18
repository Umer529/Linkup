import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import CreateActivity from "./pages/CreateActivity";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityChat from "./pages/ActivityChat";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppInner = () => {
  const location = useLocation();
  const isChat = location.pathname.endsWith('/chat');
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/activity/:id/chat" element={<ProtectedRoute><ActivityChat /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/create" element={<ProtectedRoute><CreateActivity /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isChat && <Footer />}
      {!isChat && <MobileNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
