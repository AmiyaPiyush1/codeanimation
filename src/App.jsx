import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Nav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import VisualDebugger from "./pages/VisualDebugger/VisualDebugger.jsx";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import "./App.css";
import Mergesort from "./pages/Sort/Mergesort.jsx";
import Bubblesort from "./pages/Sort/Bubblesort.jsx";

const Layout = () => {
  const location = useLocation();
  const hideFooterRoutes = ["/debugger", "/debugger/mergesort"];

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/debugger" element={<ProtectedRoute><VisualDebugger /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/debugger/mergesort" element={<Mergesort />}/>
        <Route path="/debugger/bubblesort" element={<Bubblesort />}/>
      </Routes>
      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
