import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Code Animation</h1>
      <p>Use this tool to visualize your code execution step by step.</p>
      <Link to="/debugger">
        <button>Go to Visual Debugger</button>
      </Link>
    </div>
  );
};

export default HomePage;