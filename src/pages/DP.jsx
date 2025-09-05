import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "./recursion.css";

// Set up the dagre graph for layout.
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
dagreGraph.setGraph({
  rankdir: "TB",
  nodesep: 50,
  ranksep: 100,
  marginx: 20,
  marginy: 20,
});

const applyDagreLayout = (nodes, edges, layoutOptions = {}) => {
  const { rankdir = "TB", nodesep = 50, ranksep = 100 } = layoutOptions;
  dagreGraph.setGraph({ rankdir, nodesep, ranksep, marginx: 20, marginy: 20 });
  nodes.forEach((node) => {
    const width = node.width || 150;
    const height = node.height || 60;
    dagreGraph.setNode(node.id, { width, height });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { weight: edge.weight || 1 });
  });
  dagre.layout(dagreGraph);
  const positionedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return { ...node, position: { x, y } };
  });
  return { nodes: positionedNodes, edges };
};

const FlowController = ({ currentStep, nodes, trace }) => {
  const { setCenter } = useReactFlow();
  useEffect(() => {
    const activeTrace = trace[currentStep];
    if (activeTrace && activeTrace.nodeId) {
      const activeNode = nodes.find((n) => n.id === activeTrace.nodeId);
      if (activeNode) {
        const adjustedX = activeNode.position.x + 80;
        const adjustedY = activeNode.position.y + 80;
        setCenter(adjustedX, adjustedY, {
          zoom: 1.25,
          duration: 500,
          easing: (t) => t * (2 - t),
        });
      }
    }
  }, [currentStep, nodes, trace, setCenter]);
  return null;
};

const DP = () => {
  // State and layout widths.
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [trace, setTrace] = useState([]);
  const [code, setCode] = useState('');
  const [loader, setLoader] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [language, setLanguage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();
  const editorRef = useRef(null);
  const hasRun = useRef(false);
  const [selectedTrace, setSelectedTrace] = useState(null);

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

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editorRef.current.decorations = [];
  };

  useEffect(() => {
    const userCode = localStorage.getItem('code');
    if (userCode) {
      setCode(userCode);
      setLanguage(detectLanguage(userCode));
    }
  }, []);

  useEffect(() => {
    if (!hasRun.current && code) {
      const executeButton = document.querySelector('#execute');
      if (executeButton && location.pathname !== "/debugger") {
        executeButton.click();
      }
      hasRun.current = true;
    }
  }, [code, location.pathname]);

  useEffect(() => {
    if (code === '') {
      localStorage.removeItem('code');
    } else {
      localStorage.setItem('code', code);
    }
    setLanguage(detectLanguage(code));
  }, [code]);

  const handleChange = (value) => {
    if (value !== undefined) {
      setCode(value);
    } else {
      console.error('Monaco editor value is undefined');
    }
  };

  const handleMouseDown = (section) => (e) => {
    e.preventDefault();
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
    setDragging({ section, startX: e.clientX });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

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
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isReadOnly });
    }
  }, [isReadOnly]);

  const toggleReadOnly = () => {
    setIsReadOnly((prev) => !prev);
  };

  const copyToClipboard = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      } catch (err) {
        console.error("Failed to copy code: ", err);
      }
    }
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "undo");
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger("keyboard", "redo");
    }
  };

  const handleShare = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    const detectedLang = detectLanguage(code) || "txt";
    const fileName = `code-snippet.${detectedLang}`;
    const shareText = `Check out this code snippet (${detectedLang.toUpperCase()}):\n\n${code}`;
    const shareFile = new Blob([code], { type: "text/plain" });
    const fileObject = new File([shareFile], fileName, { type: "text/plain" });
    const shareData = {
      title: "Shared Code",
      text: shareText,
      files: [fileObject],
    };
    try {
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareText);
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(shareFile);
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error sharing code:", error);
    }
  };

  const handleFullscreen = (id) => {
    const editorSection = document.getElementById(id);
    if (!editorSection) return;
    const isFullscreen = () => !!document.fullscreenElement;
    const getPositionClass = () => {
      const rect = editorSection.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const sectionCenter = rect.left + rect.width / 2;
      if (sectionCenter < screenWidth * 0.33) {
        return "fullscreen-left";
      } else if (sectionCenter > screenWidth * 0.66) {
        return "fullscreen-right";
      } else {
        return "fullscreen-center";
      }
    };
    const handleFullscreenChange = () => {
      if (!isFullscreen()) {
        editorSection.classList.remove("fullscreen-active", "fullscreen-left", "fullscreen-center", "fullscreen-right");
        setFullscreen(false);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        exitFullscreen();
      }
    };
    const enterFullscreen = () => {
      if (editorSection.requestFullscreen) {
        editorSection.requestFullscreen()
          .then(() => {
            const positionClass = getPositionClass();
            setTimeout(() => {
              editorSection.classList.add("fullscreen-active", positionClass);
              setFullscreen(true);
            }, 300);
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("fullscreenchange", handleFullscreenChange);
          })
          .catch((err) => console.error("Error enabling fullscreen:", err));
      } else {
        console.error("Fullscreen API not supported");
      }
    };
    const exitFullscreen = () => {
      if (isFullscreen() && document.exitFullscreen) {
        document.exitFullscreen()
          .catch((err) => console.error("Error exiting fullscreen:", err));
      }
    };
    isFullscreen() ? exitFullscreen() : enterFullscreen();
  };

  // Execution function that builds nodes and edges with default (light) style.
  const handleExecute = async () => {
    setLoader(true);
    setIsRunning(true);
    try {
      const response = await fetch("http://localhost:3000/debugger/recursion/main", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: code, language: language, input: "" }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const steps = await response.json();
      // Expected steps format: { event: "call"/"return", func, depth, args, value, note? }
      const nodeDataById = {};
      const newEdges = [];
      const callStack = [];
      let currentY = 0;
      const colorPalette = ["#FFD700", "#ADFF2F", "#87CEFA", "#FFB6C1", "#FFA07A", "#E6E6FA"];

      for (let i = 0; i < steps.length; i++) {
        const { event, func, depth, args, value, note } = steps[i];
        if (event === "call") {
          const nodeId = `step-${i}`;
          steps[i].nodeId = nodeId;
          // Store parent id if exists.
          if (callStack.length > 0) {
            steps[i].parentId = callStack[callStack.length - 1];
          }
          const defaultNodeStyle = {
            border: "2px solid #333",
            borderRadius: "8px",
            padding: "10px",
            background: colorPalette[depth % colorPalette.length],
            boxShadow: "3px 3px 6px rgba(0,0,0,0.1)",
          };
          nodeDataById[nodeId] = {
            id: nodeId,
            func,
            args,
            depth,
            returnValue: null,
            yPos: currentY,
            defaultStyle: defaultNodeStyle,
          };
          if (callStack.length > 0) {
            const parentId = callStack[callStack.length - 1];
            newEdges.push({
              id: `edge-call-${parentId}-${nodeId}`,
              source: parentId,
              target: nodeId,
              type: "straight",
              label: "call",
              style: { stroke: "#007bff", strokeWidth: 2 },
              markerEnd: { type: "arrowclosed", color: "#007bff" },
              defaultStyle: { stroke: "#007bff", strokeWidth: 2 },
              animated: false,
            });
          }
          callStack.push(nodeId);
          currentY += 150;
        } else if (event === "return") {
          const childId = callStack.pop();
          if (!childId) continue;
          steps[i].nodeId = childId;
          if (callStack.length > 0) {
            const parentId = callStack[callStack.length - 1];
            steps[i].parentId = parentId;
            newEdges.push({
              id: `edge-return-${childId}-${parentId}`,
              source: childId,
              target: parentId,
              type: "smoothstep",
              label: value !== undefined ? `return ${value}` : "return",
              style: { stroke: "#28a745", strokeWidth: 2 },
              markerEnd: { type: "arrowclosed", color: "#28a745" },
              sourcePosition: "right",
              targetPosition: "right",
              defaultStyle: { stroke: "#28a745", strokeWidth: 2 },
              animated: false,
            });
          }
          if (value !== undefined) {
            nodeDataById[childId].returnValue = value;
          }
          if (note) {
            steps[i].note = note;
          }
        }
      }
      const newNodes = Object.values(nodeDataById).map((nodeData) => {
        const { id, func, args, depth, returnValue, yPos, defaultStyle } = nodeData;
        const argString = args ? Object.values(args).join(", ") : "";
        const nodeLabel = returnValue
          ? `${func}(${argString}) => ${returnValue}`
          : `${func}(${argString})`;
        return {
          id,
          data: { label: nodeLabel },
          position: { x: depth * 50, y: yPos },
          style: defaultStyle,
          defaultStyle,
        };
      });
      setNodes(newNodes);
      setEdges(newEdges);
      setTrace(steps);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error fetching recursion data:", error);
    } finally {
      setLoader(false);
      setIsRunning(false);
    }
  };

  // Updated handleNext: only update the edge connected to the active node.
  const handleNext = () => {
    if (currentStep < trace.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const activeTrace = trace[nextStep];
      const activeNodeId = activeTrace.nodeId;
      // Determine the active edge id based on event type.
      let activeEdgeId = "";
      if (activeTrace.event === "call" && activeTrace.parentId) {
        activeEdgeId = `edge-call-${activeTrace.parentId}-${activeNodeId}`;
      } else if (activeTrace.event === "return" && activeTrace.parentId) {
        activeEdgeId = `edge-return-${activeNodeId}-${activeTrace.parentId}`;
      }
      // Update nodes: active node darkened; others default.
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === activeNodeId
            ? { ...node, style: { ...node.style, border: "2px solid #000", background: "#ccc" } }
            : { ...node, style: node.defaultStyle || node.style }
        )
      );
      // Update edges: only the edge with id activeEdgeId is animated and darkened.
      setEdges((prevEdges) =>
        prevEdges.map((edge) => {
          if (edge.id === activeEdgeId) {
            if (edge.label && edge.label.toLowerCase().includes("call")) {
              return {
                ...edge,
                animated: true,
                style: { ...edge.style, stroke: "#0056b3", strokeWidth: 2 },
              };
            }
            if (edge.label && edge.label.toLowerCase().includes("return")) {
              return {
                ...edge,
                animated: true,
                style: { ...edge.style, stroke: "#196F3D", strokeWidth: 2 },
              };
            }
            return edge;
          } else {
            return { ...edge, animated: false, style: edge.defaultStyle || edge.style };
          }
        })
      );
      // Update variable space.
      const displayData = {
        step: nextStep,
        event: activeTrace.event,
        function: activeTrace.func,
        arguments: activeTrace.args ? activeTrace.args : "None",
        returnValue: activeTrace.value !== undefined ? activeTrace.value : "N/A",
        note: activeTrace.note ? activeTrace.note : "",
      };
      setSelectedTrace(displayData);
    } else {
      console.log("No more steps to display.");
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
    setCurrentStep(trace.length - 1);
  };

  return (
    <div className="container">
      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <div className="monaco-editor-toolbar">
            <button className="editor-button" onClick={handleShare}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button className="editor-button" onClick={toggleReadOnly}>
              {isReadOnly ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-off">
                  <path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982" />
                  <path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353" />
                  <path d="m15 5 4 4" />
                  <path d="m2 2 20 20" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  <path d="m15 5 4 4" />
                </svg>
              )}
            </button>
            <button className="editor-button" onClick={handleUndo}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>
            <button className="editor-button" id="execute" onClick={() => { isRunning ? setIsRunning(false) : handleExecute(); }}>
              {isRunning ? "Stop" : "Execute"}&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-code ${isRunning ? "rotate-animation" : ""}`}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>
            <button onClick={handleNext} disabled={currentStep >= trace.length - 1} className="forward">
              Next&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <button onClick={handleLast} disabled={currentStep === trace.length} className="forward">
              Last&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right">
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </button>
          </div>

          <MonacoEditor
            className="editor"
            language={language}
            placeholder="Write your recursion code here..."
            value={code}
            onChange={handleChange}
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
              readOnly: isReadOnly,
            }}
            beforeMount={(monaco) => {
              monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
              monaco.editor.defineTheme("customTheme", {
                base: "vs",
                inherit: true,
                rules: [],
                colors: {
                  "editor.background": "#FFFFFF",
                  "editor.lineHighlightBorder": "#FF5733",
                },
              });
              monaco.editor.setTheme("customTheme");
            }}
            onMount={handleEditorDidMount}
          />
          {!code && (
            <div style={{
              position: "absolute",
              top: "4rem",
              left: "4.2rem",
              fontFamily: "Fira Code, monospace",
              fontSize: 14,
            }}>
              // Write your recursion code here
            </div>
          )}
          <div className="buttons">
            <button className="back" onClick={handleFirst} disabled={currentStep === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-left">
                <path d="m11 17-5-5 5-5" />
                <path d="m18 17-5-5 5-5" />
              </svg>
              &nbsp;First
            </button>
            <button className="back" onClick={handlePrev} disabled={currentStep === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                <path d="m15 18-6-6 6-6" />
              </svg>
              &nbsp;Prev
            </button>
            <button id="execute" onClick={() => { isRunning ? setIsRunning(false) : handleExecute(); }}>
              {isRunning ? "Stop" : "Execute"}&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-code ${isRunning ? "rotate-animation" : ""}`}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>
            <button onClick={handleNext} disabled={currentStep >= trace.length - 1} className="forward">
              Next&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <button onClick={handleLast} disabled={currentStep === trace.length} className="forward">
              Last&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right">
                <path d="m6 17 5-5-5-5" />
                <path d="m13 17 5-5-5-5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("left")}></div>

        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
          <button className="editor-button" id="react-flow-fullscreen" onClick={() => handleFullscreen("visual-debugger")}>
            {fullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize">
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
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
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  fitView
                >
                  <FlowController currentStep={currentStep} nodes={nodes} trace={trace} />
                  <Controls />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </ReactFlowProvider>
            )}
          </AnimatePresence>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("middle")}></div>

        {/* Variable Space Section */}
        <div
          className="section"
          id="variable-space"
          style={{
            width: `${rightWidth}%`,
            padding: "10px",
            backgroundColor: "#f7f7f7",
            borderRadius: "5px",
            fontFamily: "monospace",
            overflowX: "auto"
          }}
        >
          {selectedTrace ? (
            <div>
              <h3>Step {selectedTrace.step}</h3>
              <p><strong>Event:</strong> {selectedTrace.event}</p>
              <p><strong>Function:</strong> {selectedTrace.function}</p>
              <p>
                <strong>Arguments:</strong>{" "}
                {typeof selectedTrace.arguments === "object"
                  ? JSON.stringify(selectedTrace.arguments, null, 2)
                  : selectedTrace.arguments}
              </p>
              {selectedTrace.note && (
                <p>
                  <strong>Note:</strong> {selectedTrace.note}
                </p>
              )}
              {selectedTrace.returnValue !== "N/A" && (
                <p>
                  <strong>Return Value:</strong> {selectedTrace.returnValue}
                </p>
              )}
            </div>
          ) : (
            <p>Variable Space</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DP;
