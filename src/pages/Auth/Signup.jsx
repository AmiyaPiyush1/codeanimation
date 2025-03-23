import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // Import the CSS file

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Dynamically get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // Email validation function
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation function
  const isStrongPassword = (password) => 
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Input validation
    if (!isValidEmail(email)) {
      setError("Invalid email format.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/auth/signup`, { email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Signup</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className={loading ? "disabled" : ""} disabled={loading}>
            {loading ? "Signing Up..." : "Signup"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;