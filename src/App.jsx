import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Nav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import ErrorBoundary from "./components/Common/ErrorBoundary.jsx"; // Error handling component
import MergeSort from "../src/pages/Sort/MergeSort.jsx";
import BubbleSort from "../src/pages/Sort/BubbleSort.jsx";
import "./App.css";

// 🔹 Lazy Load Pages for Performance Optimization
const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage.jsx"));
const VisualDebugger = lazy(() => import("./pages/VisualDebugger/VisualDebugger.jsx"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup"));

// 🔹 Route Configuration for Scalability
const routesConfig = [
  { path: "/", element: <LandingPage />, protected: false },
  { path: "/login", element: <Login />, protected: false },
  { path: "/signup", element: <Signup />, protected: false },
  { path: "/debugger", element: <VisualDebugger />, protected: true },
  { path: "/debugger/sorting/mergesort", element: <MergeSort />, protected: true},
  { path: "/debugger/sorting/bubblesort", element: <BubbleSort />, protected: true},
];

const Layout = () => {
  const location = useLocation();
  const hideFooterRoutes = ["/debugger"];

  return (
    <>
      <Navbar />
      <Suspense>
        <ErrorBoundary>
          <Routes>
            {routesConfig.map(({ path, element, protected: isProtected }) => (
              <Route
                key={path}
                path={path}
                element={isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element}
              />
            ))}
            {/* Redirect unknown routes to home */}
            {/* <Route path="*" element={<Navigate to="/not-found" replace />} /> */}
          </Routes>
        </ErrorBoundary>
      </Suspense>
      {!hideFooterRoutes.some(route => new RegExp(`^${route}`).test(location.pathname)) && <Footer />}
    </>
  );
};

const App = () => (
  <Router>
    <Layout />
  </Router>
);

export default App;