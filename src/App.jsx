import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";

const App = () => {
  // Layout states for resizable sections
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);

  // States for code, debug output and loader
  const [debuggedQueue, setDebuggedQueue] = useState([]);
  const [code, setCode] = useState("// Write your code here...");
  const [Execute, setExecute] = useState(0);
  const [executeFlag, setExecuteFlag] = useState(false);
  const [loader, setLoader] = useState(false);

  // React Flow states for nodes and edges
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const containerRef = useRef(null);
  const isResizing = useRef(false);
  const currentResizer = useRef(null);

  // Handlers for resizing the layout
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
      newLeftWidth =
        ((event.clientX - containerRect.left) / containerRect.width) * 100;
      newMiddleWidth = 100 - newLeftWidth - rightWidth;
      if (newLeftWidth > 10 && newMiddleWidth > 10) {
        setLeftWidth(newLeftWidth);
        setMiddleWidth(newMiddleWidth);
      }
    } else if (currentResizer.current === "right") {
      newMiddleWidth =
        ((event.clientX - containerRect.left) / containerRect.width) * 100 -
        leftWidth;
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

  // Execute handler to trigger data fetch and flowchart update
  const handleExecute = useCallback(() => {
    setExecute((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (Execute === 0) return;
    setLoader(true);
    const showData = async () => {
      try {
        const response = await fetch("http://localhost:3000/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: code }),
        });
        const data = await response.json();
        // Split the response into non-empty lines
        const newOutput = data.loop.split("\n").filter(Boolean);
        setDebuggedQueue(newOutput);

        // Create a node for each debug line
        const newNodes = newOutput.map((line, index) => ({
          id: `${index}`,
          data: { label: line },
          position: { x: 100, y: index * 100 },
          style: {
            border: "1px solid #777",
            padding: 10,
            borderRadius: 5,
            backgroundColor: line.includes("i++")
              ? "#e8f5e9"
              : line.includes("i<n")
              ? "#e0f7fa"
              : "#fff3e0",
          },
        }));

        // Create sequential edges connecting the nodes
        const newEdges = newOutput.slice(1).map((_, index) => ({
          id: `e${index}-${index + 1}`,
          source: `${index}`,
          target: `${index + 1}`,
          animated: true,
          style: { stroke: "#555", strokeWidth: 2 },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error("Error executing:", error);
      } finally {
        setLoader(false);
      }
    };

    showData();
  }, [Execute, code]);

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="logo">
          <img src="logo.png" alt="CodeStream" />
        </a>
        <div className="nav-links">
          <a href="#">Explore</a>
          <a href="#">Problems</a>
          <a href="#" id="login">Sign in</a>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-content" ref={containerRef}>
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <MonacoEditor
            className="editor"
            language="javascript"
            value={code}
            onChange={(newCode) => setCode(newCode)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          <div className="buttons">
            <button>First</button>
            <button>Prev</button>
            <button id="execute" onClick={handleExecute}>Execute</button>
            <button>Next</button>
            <button>Last</button>
          </div>
        </div>

        <div className="resizer" onMouseDown={(e) => handleMouseDown(e, "left")}></div>

        {/* Visual Debugger Flowchart Section */}
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
          <AnimatePresence mode="wait">
            {loader ? (
              <motion.div
                className="loader"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
              />
            ) : (
              <ReactFlow nodes={nodes} edges={edges} fitView>
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            )}
          </AnimatePresence>
        </div>

        <div className="resizer" onMouseDown={(e) => handleMouseDown(e, "right")}></div>

        {/* Variable Space Section */}
        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>
          Variable Space
        </div>
      </div>
    </div>
  );
};

export default App;