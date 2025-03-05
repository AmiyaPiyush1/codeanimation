import React, { useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import "./App.css";

const App = () => {
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);

  const [code, setCode] = useState("// Write your code here...");

  const containerRef = useRef(null);
  const isResizing = useRef(false);
  const currentResizer = useRef(null);

  const handleMouseDown = (event, resizer) => {
    isResizing.current = true;
    currentResizer.current = resizer;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event) => {
    if (!isResizing.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newLeftWidth, newMiddleWidth, newRightWidth;

    if (currentResizer.current === "left") {
      newLeftWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100;
      newMiddleWidth = 100 - newLeftWidth - rightWidth;
      if (newLeftWidth > 10 && newMiddleWidth > 10) {
        setLeftWidth(newLeftWidth);
        setMiddleWidth(newMiddleWidth);
      }
    } else if (currentResizer.current === "right") {
      newMiddleWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100 - leftWidth;
      newRightWidth = 100 - leftWidth - newMiddleWidth;
      if (newMiddleWidth > 10 && newRightWidth > 10) {
        setMiddleWidth(newMiddleWidth);
        setRightWidth(newRightWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    currentResizer.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <a href ="/" className="logo">
          <img src="logo.png" alt="CodeStream" />
        </a>
        <div className="search-bar">
          <input type="checkbox" id="checkbox" />
          <label for="checkbox" class="toggle">
              <div class="bars" id="bar1"></div>
              <div class="bars" id="bar2"></div>
              <div class="bars" id="bar3"></div>
          </label>
        </div>

        <div className="search-bar-menu">
          <div className="profile-section">
            <img src="profile.png" alt="Profile" />
            <div className="profile-name">John Doe</div
          >
          </div>
          <div className="options-section">
            <a href="#">Explore</a>
            <a href="#">Problems</a>
            <a href="#">Settings</a>
            <a href="#">Sign out</a>
          </div>
        </div>
        
        <div className="nav-links">
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg> Home</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> About</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Contact</a>
          <a href="#">Login</a>
          <a href="#">Signup</a>
        </div>
      </nav>

      {/* Resizable Sections */}
      <div className="main-content" ref={containerRef}>
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <MonacoEditor
              className="editor"
              language="javascript"
              value={code}
              onChange={(newCode) => setCode(newCode)}
              options={{ fontSize: 14, minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              roundedSelection: false,
              cursorBlinking: "smooth", 
              theme: "vs-light"}}
            />
          <div className="buttons">
            <button>First</button>
            <button>Prev</button>
            <button id="execute">Execute</button>
            <button>Next</button>
            <button>Last</button>
          </div>
        </div>
        <div className="resizer" onMouseDown={(e) => handleMouseDown(e, "left")}></div>
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>Visual Debugging Section</div>
        <div className="resizer" onMouseDown={(e) => handleMouseDown(e, "right")}></div>
        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>Variable Space</div>
      </div>
    </div>
  );
};

export default App;