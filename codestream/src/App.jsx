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
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
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