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

const Layout = () => {
  const location = useLocation();
  const hideFooterRoutes = ["/debugger"];

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/debugger" element={<ProtectedRoute><VisualDebugger /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
