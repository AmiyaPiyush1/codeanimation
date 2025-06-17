import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Navbar from "./components/Navbar/Nav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import PageTransition from "./components/PageTransition/PageTransition.jsx";
import ErrorBoundary from "./components/Common/ErrorBoundary.jsx";
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AuthCallback from './pages/Auth/AuthCallback';
import { AuthProvider } from './context/AuthContext';
import MergeSort from "../src/pages/Sort/MergeSort.jsx";
import BubbleSort from "../src/pages/Sort/BubbleSort.jsx";
import InsertionSort from "./pages/Sort/InsertionSort.jsx";
import QuickSort from "./pages/Sort/QuickSort.jsx";
import SelectionSort from "./pages/Sort/SelectionSort.jsx";
import Recursion from "./pages/Recurrsion/recursion.jsx";
import DP from "./pages/DP/DP.jsx";
import GraphMat from "./pages/Graphs/graph_mat.jsx";
import "./App.css";
import About from './pages/About/About';
import Forum from './pages/Community/Forum';
import Careers from './pages/Careers/Careers';
import Blog from './pages/Blog/Blog';
import Documentation from './pages/Documentation/Documentation';
import AlgorithmLibrary from './pages/AlgorithmLibrary/AlgorithmLibrary';
import AIAssistant from './pages/AIAssistant/AIAssistant';
import Changelog from './pages/Changelog/Changelog';
import ContactUs from './pages/Legal/ContactUs';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import CookieSettings from './pages/Legal/CookieSettings';
import HelpCenter from './pages/Legal/HelpCenter';
import Profile from './pages/Profile/Profile';
import Trees from "./pages/Trees/Trees.jsx";
import { ThemeProvider } from './context/ThemeContext';
import LL from "./pages/LinkedList/LL.jsx";
import './styles/theme.css';

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home/CodeStreamLanding.jsx"));
const VisualDebugger = lazy(() => import("./pages/VisualDebugger/VisualDebugger.jsx"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound.jsx"));

// Route Configuration
const routesConfig = [
  // Public Routes
  { 
    path: "/", 
    element: <Home />, 
    protected: false, 
    showFooter: true,
    title: "Home"
  },
  { 
    path: "/about", 
    element: <About />, 
    protected: false, 
    showFooter: true,
    title: "About Us"
  },
  { 
    path: "/forum", 
    element: <Forum />, 
    protected: false, 
    showFooter: true,
    title: "Community Forum"
  },

  // Debugger Routes
  { 
    path: "/debugger", 
    element: <VisualDebugger />, 
    protected: true,
    title: "Visual Debugger"
  },
  { 
    path: "/debugger/sorting/mergesort", 
    element: <MergeSort />, 
    protected: true,
    title: "Merge Sort"
  },
  { 
    path: "/debugger/sorting/bubblesort", 
    element: <BubbleSort />, 
    protected: true,
    title: "Bubble Sort"
  },
  { 
    path: "/debugger/sorting/insertionsort", 
    element: <InsertionSort />, 
    protected: true,
    title: "Insertion Sort"
  },
  { 
    path: "/debugger/sorting/quicksort", 
    element: <QuickSort />, 
    protected: true,
    title: "Quick Sort"
  },
  { 
    path: "/debugger/sorting/selectionsort", 
    element: <SelectionSort />, 
    protected: true,
    title: "Selection Sort"
  },
  { 
    path: "/debugger/recursion/main", 
    element: <Recursion />, 
    protected: true,
    title: "Recursion"
  },
  { 
    path: "/debugger/dynamicprogramming/main", 
    element: <DP />, 
    protected: true,
    title: "Dynamic Programming"
  },
  { 
    path: "/debugger/graphs/main", 
    element: <GraphMat />, 
    protected: true,
    title: "Graph Algorithms"
  },

  { 
    path: "/debugger/trees/main", 
    element: <Trees />, 
    protected: true,
    title: "Trees"
  },
  { 
    path: "/debugger/LinkedList/main", 
    element: <LL />, 
    protected: true,
    title: "Trees"
  },

  // Legal Routes
  { 
    path: "/contact", 
    element: <ContactUs />, 
    protected: false, 
    showFooter: true,
    title: "Contact Us"
  },
  { 
    path: "/privacy", 
    element: <PrivacyPolicy />, 
    protected: false, 
    showFooter: true,
    title: "Privacy Policy"
  },
  { 
    path: "/terms", 
    element: <TermsOfService />, 
    protected: false, 
    showFooter: true,
    title: "Terms of Service"
  },
  { 
    path: "/cookies", 
    element: <CookieSettings />, 
    protected: false, 
    showFooter: true,
    title: "Cookie Settings"
  },
  { 
    path: "/help", 
    element: <HelpCenter />, 
    protected: false, 
    showFooter: true,
    title: "Help Center"
  },

  // Other Routes
  { 
    path: '/careers', 
    element: <Careers />, 
    showFooter: true,
    title: "Careers"
  },
  { 
    path: '/blog', 
    element: <Blog />, 
    showFooter: true,
    title: "Blog"
  },
  { 
    path: '/docs', 
    element: <Documentation />, 
    showFooter: true,
    title: "Documentation"
  },
  { 
    path: '/algorithms', 
    element: <AlgorithmLibrary />, 
    showFooter: true,
    title: "Algorithm Library"
  },
  { 
    path: '/ai-assistant', 
    element: <AIAssistant />, 
    showFooter: true,
    title: "AI Assistant"
  },
  { 
    path: '/changelog', 
    element: <Changelog />, 
    showFooter: true,
    title: "Changelog"
  },

  // Profile Route
  { 
    path: "/profile", 
    element: <Profile />, 
    protected: true,
    showFooter: true,
    title: "Profile"
  },

  { 
    path: '*', 
    element: <NotFound />, 
    showFooter: true,
    title: "Page Not Found"
  }
];

// Enhanced minimalist loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
    <div className="relative">
      {/* Enhanced minimalist loading animation */}
      <div className="w-20 h-20 relative">
        {/* Outer ring with subtle gradient */}
        <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 border-2 border-t-white/10 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow" />
        
        {/* Inner ring with accent color */}
        <div className="absolute inset-2 border-2 border-purple-500/20 rounded-full" />
        <div className="absolute inset-2 border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow-reverse" />
        
        {/* Center dot with glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-sm animate-pulse" />
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full relative" />
          </div>
        </div>
      </div>

      {/* Enhanced minimalist text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-white/40 font-light tracking-[0.2em] uppercase">
          Loading
        </p>
        {/* Subtle progress indicator */}
        <div className="mt-3 w-12 h-[1px] bg-white/10 mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/30 animate-progress" />
        </div>
      </div>
    </div>
  </div>
);

// Layout component with enhanced minimalist design
const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const showFooter = !location.pathname.includes('debugger');

  useEffect(() => {
    const currentRoute = routesConfig.find(route => route.path === location.pathname);
    if (currentRoute) {
      document.title = `${currentRoute.title} | CodeStream`;
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C]">
      {/* Enhanced subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow relative">
          <Outlet />
        </main>
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

// Enhanced styles for minimalist animations
const styles = `
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-slow-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-spin-slow {
  animation: spin-slow 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.animate-spin-slow-reverse {
  animation: spin-slow-reverse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.animate-progress {
  animation: progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Wrapper component to handle animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Suspense fallback={<Loading />}>
          <Routes location={location}>
            {/* Auth routes with AuthLayout (no navbar/footer) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Route>

            {/* Main routes with Navbar and conditional Footer */}
            <Route element={<MainLayout />}>
              {routesConfig.map(({ path, element, protected: isProtected }) => (
                <Route
                  key={path}
                  path={path}
                  element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
                />
              ))}
            </Route>
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-navy-950 text-slate-200 antialiased">
            <AnimatedRoutes />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;