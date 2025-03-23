import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Dynamically get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"; // For Vite

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      console.log("Login Successful");
      navigate("/");
      window.location.reload(); // Reload the page to update Navbar
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div className="login-container">
          <div className="login-box">
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
            <div className="signup-link">
            Don't have an account? <a href="/signup"> Signup</a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;