import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider
} from "reactflow";
import { useNavigate } from "react-router-dom";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "./VisualDebugger.css";

// Initialize dagre for layout
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setGraph({ rankdir: "TB" });
dagreGraph.setDefaultEdgeLabel(() => ({}));

const applyDagreLayout = (nodes, edges) => {
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 180, height: 50 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: {
        x: dagreGraph.node(node.id).x,
        y: dagreGraph.node(node.id).y,
      },
    })),
    edges,
  };
};

// Detect language based on code contents
const detectLanguage = (code) => {
  if (/^\s*#include\s+[<"]/.test(code) || /\bint\s+main\s*\(/.test(code)) {
    return "cpp";
  } else if (/^\s*import\s+\w+/.test(code) || /\bdef\s+\w+\s*\(/.test(code)) {
    return "python";
  } else if (/^\s*public\s+class\s+\w+/.test(code) || /\bSystem\.out\.print/.test(code)) {
    return "java";
  } else if (/^\s*function\s+\w+\(/.test(code) || /\bconsole\.log/.test(code)) {
    return "javascript";
  } else if (/\bSELECT\b.*\bFROM\b/i.test(code) || /\bINSERT\s+INTO\b/i.test(code)) {
    return "sql";
  }
  return "plaintext";
};

const VisualDebugger = () => {
  // Layout and state variables
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [debuggedQueue, setDebuggedQueue] = useState([]);
  const [code, setCode] = useState("// Write your code here...");
  const [loader, setLoader] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [language, setLanguage] = useState("plaintext");
  const [currentStep, setCurrentStep] = useState(0);
  const [topic, setTopic] = useState(null);
  const editorRef = useRef(null);

  // Initialize navigation
  const navigate = useNavigate();

  // Redirect if the topic returned by the API contains "merge sort"
  useEffect(() => {
    if (topic && topic.topic && topic.topic.toLowerCase().includes("merge sort")) {
      navigate("/debugger/mergesort");
    }
    if (topic && topic.topic && topic.topic.toLowerCase().includes("bubble sort")) {
      navigate("/debugger/bubblesort");
    }
  }, [topic, navigate]);

  // Update language when code changes
  useEffect(() => {
    setLanguage(detectLanguage(code));
  }, [code]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editorRef.current.decorations = []; // Initialize decorations
  };

  const FlowController = ({ currentStep, nodes }) => {
    const { setCenter } = useReactFlow();

    useEffect(() => {
      if (nodes.length > 0 && nodes[currentStep]) {
        const activeNode = nodes[currentStep];
        // Apply manual adjustments to X and Y positions
        const adjustedX = activeNode.position.x + 80;
        const adjustedY = activeNode.position.y + 80;
        // Smooth transition to the adjusted node position
        setCenter(adjustedX, adjustedY, {
          zoom: 1.25,
          duration: 500,
          easing: (t) => t * (2 - t),
        });
      }
    }, [currentStep, nodes, setCenter]);

    return null;
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.getModel()?.setLanguage(language);
    }
  }, [language]);

  // Handle resizing by mouse events
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

  const handleNext = () => {
    if (currentStep < debuggedQueue.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFirst = () => {
    setCurrentStep(0);
  };

  const handleLast = () => {
    setCurrentStep(debuggedQueue.length - 1);
  };

  useEffect(() => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((node, index) => ({
        ...node,
        style: {
          ...node.style,
          border: index === currentStep ? "1.7px solid #555" : "1.5px solid transparent",
          transition: "border 0.1s ease-out"
        },
      }));

      // Reapply layout for better visual arrangement
      const layouted = applyDagreLayout(updatedNodes, edges);
      return layouted.nodes;
    });
  }, [currentStep, edges]);

  useEffect(() => {
    if (!editorRef.current || debuggedQueue.length === 0) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;
    const lineNumber = debuggedQueue[currentStep]?.line || 1;
    console.log("Current Step:", currentStep);
    console.log("Highlighting Line:", lineNumber);
    // Remove previous decorations
    editorRef.current.decorations = editor.deltaDecorations(editorRef.current.decorations || [], []);
    // Apply new decoration for highlighting
    editorRef.current.decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)),
        options: {
          isWholeLine: true,
          className: "highlight-line",
        },
      },
    ]);
    editor.revealLineInCenter(lineNumber); 
  }, [currentStep, debuggedQueue]);

  // Execute and fetch the API responses
  const handleExecute = useCallback(async () => {
    setLoader(true);
    localStorage.setItem("code", code);
    try {
      const detectedLang = detectLanguage(code);
      if (detectedLang === "plaintext") {
        setNodes([
          {
            id: "error",
            data: { label: "Syntax Error: Unrecognized programming language." },
            position: { x: 200, y: 200 },
            draggable: false,
            style: {
              border: "2px solid red",
              backgroundColor: "#FFCDD2",
              padding: 10,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: "bold",
              color: "#B71C1C",
            },
          },
        ]);
        setEdges([]);
        setLoader(false);
        return;
      }

      // Fetch topic from the debugger API
      const response1 = await fetch("http://localhost:3000/debugger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: code }),
      });
      const data1 = await response1.json();
      setTopic(data1);

      // Fetch debugging details from the generate API
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: code }),
      });
      const data = await response.json();
      let extractedData = [];

      if (typeof data.content === "string") {
        extractedData = data.content
          .replace(/```json|```/g, "")
          .replace(/[{}[\],"]/g, "")
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
      } else if (Array.isArray(data.content)) {
        extractedData = data.content;
      }

      setDebuggedQueue(
        extractedData.map((line, index) => ({
          text: line,
          line: index + 1,
        }))
      );
      setCurrentStep(0);

      const newNodes = extractedData.map((line, index) => {
        let backgroundColor;
        if (data.type === "sorting") {
          if (line.toLowerCase().includes("merge sort")) {
            backgroundColor = "#AED581";
          } else if (line.toLowerCase().includes("divide")) {
            backgroundColor = "#81D4FA";
          } else if (line.toLowerCase().includes("merge")) {
            backgroundColor = "#FFAB91";
          } else if (line.toLowerCase().includes("example")) {
            backgroundColor = "#CE93D8";
          } else {
            backgroundColor = "#FFD3B6";
          }
        } else {
          backgroundColor = line.includes("i++")
            ? "#DFF2BF"
            : line.includes("i<n")
            ? "#BDE0FE"
            : "#FFD3B6";
        }
        const label = line;
        return {
          id: `${index}`,
          data: { label },
          position: { x: 100, y: index * 100 },
          draggable: true,
          style: {
            border: "2px solid #555",
            padding: 10,
            borderRadius: 8,
            fontSize: 14,
            boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.2)",
            backgroundColor: backgroundColor,
          },
        };
      });

      const newEdges = extractedData.slice(1).map((_, index) => ({
        id: `e${index}-${index + 1}`,
        source: `${index}`,
        target: `${index + 1}`,
        animated: true,
        type: "smoothstep",
        style: { stroke: "#555", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
        },
      }));

      const layoutedElements = applyDagreLayout(newNodes, newEdges);
      setDebuggedQueue(layoutedElements.nodes);
      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
      setCurrentStep(0);
    } catch (error) {
      console.error("Execution Error:", error);
    } finally {
      setLoader(false);
    }
  }, [code]);
  return (
    <div className="container">
      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <MonacoEditor
            className="editor"
            language={language}
            value={code}
            onChange={(newCode) => setCode(newCode)}
            options={{
              fontSize: 14,
              minimap: { enabled: false, scale: 1, side: "right" },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 0, bottom: 0, left: 0, right: 0 },
              quickSuggestions: { other: true, comments: true, strings: true },
              suggestOnTriggerCharacters: true,
              inlineSuggest: true,
              wordWrap: "on",
              folding: true,
              smoothScrolling: true,
              tabSize: 2,
              renderWhitespace: "all",
              overviewRulerBorder: false,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              matchBrackets: "always",
              cursorStyle: "line-thin",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              suggestSelection: "recentlyUsed",
              parameterHints: { enabled: true },
              glyphMargin: false,
              lightbulb: { enabled: true },
              formatOnType: true,
              formatOnPaste: true,
              bracketPairColorization: { enabled: true },
              stickyScroll: { enabled: true },
              lineNumbersMinChars: 3,
            }}
            beforeMount={(monaco) => {
              monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
            }}
            onMount={handleEditorDidMount}
          />
          <div className="buttons">
            <button onClick={handleFirst} disabled={currentStep === 0}>First</button>
            <button onClick={handlePrev} disabled={currentStep === 0}>Prev</button>
            <button id="execute" onClick={handleExecute}>Execute</button>
            <button onClick={handleNext} disabled={currentStep >= debuggedQueue.length - 1}>Next</button>
            <button onClick={handleLast} disabled={currentStep === debuggedQueue.length}>Last</button>
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("left")}></div>

        {/* Visual Debugger Section */}
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
              <ReactFlowProvider>
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} fitView>
                  <FlowController currentStep={currentStep} nodes={nodes} />
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

export default VisualDebugger;
