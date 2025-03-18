import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import "./Nav.css";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a token exists in localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Convert to boolean
  }, []);

  const handleLoginSuccess = (credentialResponse) => {
    const decodedToken = jwtDecode(credentialResponse.credential);
    localStorage.setItem("token", credentialResponse.credential);
    console.log("User Info:", decodedToken); // Optional: Log user info
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    setIsAuthenticated(false);
    navigate("/login"); // Redirect to login page
  };

  return (
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src="logo.png" alt="CodeStream" />
        </Link>
        <div className="nav-links">
          <Link to="/">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg> &nbsp;Home
          </Link>
          <Link to="/about">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg> &nbsp;About
          </Link>
          <Link to="/contact">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg> &nbsp;Contact
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg> &nbsp;Profile
              </Link>
              <button onClick={handleLogout} id="logout">Log out</button>
            </>
          ) : (
            <>
              <Link to="/signup">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user-round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg> &nbsp;Sign up
              </Link>
              <Link to="/login" id="login">Sign in</Link>
            </>
          )}
        </div>
      </nav>
  );
};

export default Navbar;