import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import "./sort.css";
import { useNavigate } from "react-router-dom";

const Bubblesort = () => {
  // Layout and state variables
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [debugSteps, setDebugSteps] = useState([]);
  const [code, setCode] = useState(localStorage.getItem("code"));
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState("plaintext");
  const editorRef = useRef(null);
  const [result, setResult] = useState();
  const [topic,setTopic] = useState(null);
  const navigate = useNavigate();
  // Generic language detection based on code content
  const detectLanguage = (code) => {
    if (/^\s*#include\s+[<"]/.test(code) || /\bint\s+main\s*\(/.test(code)) {
      return "cpp";
    } else if (/^\s*import\s+\w+/.test(code) || /\bdef\s+\w+\s*\(/.test(code)) {
      return "python";
    } else if (/^\s*public\s+class\s+\w+/.test(code) || /\bSystem\.out\.print/.test(code)) {
      return "java";
    } else if (/^\s*function\s+\w+\(/.test(code) || /\bconsole\.log/.test(code)) {
      return "javascript";
    } else if (/\bSELECT\b.*\bFROM\b/i.test(code)) {
      return "sql";
    }
    return "plaintext";
  };

  useEffect(() => {
    setLanguage(detectLanguage(code));
  }, [code]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // Resize handlers for splitting sections
  const handleMouseDown = (section) => (e) => {
    setDragging({ section, startX: e.clientX });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const { section, startX } = dragging;
    const dx = e.clientX - startX;
    const totalWidth = window.innerWidth;
    const percentChange = (dx / totalWidth) * 100;
    if (section === "left") {
      setLeftWidth((prev) => Math.max(10, prev + percentChange));
      setMiddleWidth((prev) => Math.max(10, prev - percentChange));
    } else if (section === "middle") {
      setMiddleWidth((prev) => Math.max(10, prev + percentChange));
      setRightWidth((prev) => Math.max(10, prev - percentChange));
    }
    setDragging({ ...dragging, startX: e.clientX });
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  useEffect(() => {
        if (topic && topic.topic && topic.topic.toLowerCase().includes("merge sort")) {
          navigate("/debugger/mergesort");
        }
      }, [topic, navigate]);
    
  // Execute code and fetch debugging steps from the API
  const handleExecute = async () => {
    localStorage.setItem("code", code);
    const response1 = await fetch("http://localhost:5000/debugger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: code }),
      });
      const data1 = await response1.json();
      setTopic(data1);
    setLoading(true);
    try {
      const detectedLang = detectLanguage(code);
      if (detectedLang !== "plaintext") {
        const response = await fetch("http://localhost:5000/debugger/bubblesort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: code }),
        });
  
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("API Response:", data); // Debugging API Response
        setResult(data);
      }
    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Navigation handlers for debugging steps
  const handleNext = () => {
    if (currentStep < debugSteps.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  const handleFirst = () => setCurrentStep(0);
  const handleLast = () => setCurrentStep(debugSteps.length - 1);
  useEffect(() => {
    console.log("Updated result:", result);
  }, [result]);
  
  return (
    <div className="container">
      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <MonacoEditor
            className="editor"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onMount={handleEditorDidMount}
          />
          <div className="buttons">
            <button onClick={handleFirst} disabled={currentStep === 0}>
              First
            </button>
            <button onClick={handlePrev} disabled={currentStep === 0}>
              Prev
            </button>
            <button onClick={handleExecute}>Execute</button>
            <button onClick={handleNext} disabled={currentStep >= debugSteps.length - 1}>
              Next
            </button>
            <button onClick={handleLast} disabled={currentStep === debugSteps.length - 1}>
              Last
            </button>
          </div>
        </div>
        <div className="resizer" onMouseDown={handleMouseDown("left")}></div>

        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
          <AnimatePresence>
            {loading ? (
              <motion.div
                className="loader"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              />
            ) : (
              <ReactFlowProvider>
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} fitView>
                  <Controls />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </ReactFlowProvider>
            )}
          </AnimatePresence>
        </div>
        <div className="resizer" onMouseDown={handleMouseDown("middle")}></div>

        {/* Variable Space Section */}
        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>
          Variable Space
        </div>
      </div>
    </div>
  );
};

export default Bubblesort;
