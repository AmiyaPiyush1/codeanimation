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
import axios from "axios";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "./BubbleSort.css";

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

const BubbleSort = () => {
  // Layout and state variables
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [debuggedQueue, setDebuggedQueue] = useState([]);
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
  const { problemType, specificType } = location.state || {};
  const [Trace, setTrace] = useState();

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
    editorRef.current.decorations = []; // Initialize decorations
  };

  // Get code from localStorage on mount
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

  // Update localStorage and language when code changes
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

  const FlowController = ({ currentStep, nodes }) => {
    const { setCenter } = useReactFlow();
    useEffect(() => {
      if (nodes.length > 0 && nodes[currentStep]) {
        const activeNode = nodes[currentStep];
        const adjustedX = activeNode.position.x + 80;
        const adjustedY = activeNode.position.y + 80;
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

  // Execution function for bubble sort branch
  const handleExecute = async () => {
    setLoader(true);
    setIsRunning(true);
    try {
      // POST the code, input, and language to your backend endpoint.
      const response = await fetch("http://localhost:3000/debugger/sorting/bubblesort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: code,                      // Your bubbleSort function code
          input: "[5,4,3,2,1]",                // Example input array
          language: "javascript",              // Language (if needed by backend)
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      // Extract the trace from the JSON response.
      const { trace } = await response.json();
  
      const newNodes = [];
      let pass = 1;
      let y = 0;
  
      // Create the initial "call" node using the first event array state.
      newNodes.push({
        id: "call",
        data: { label: `Pass ${pass} – call\n[${trace[0].array.join(", ")}]` },
        position: { x: 50, y },
        className: "default-node",
        draggable: false,
      });
      y += 100;
  
      // Iterate through each trace event to generate nodes.
      trace.forEach((e, i) => {
        // When a new pass begins (detected by a "compare" event starting at indices 0 and 1 after the first event)
        if (e.event === "compare" && e.i === 0 && e.j === 1 && i !== 0) {
          pass++;
          newNodes.push({
            id: `pass-${pass}`,
            data: { label: `Pass ${pass}` },
            position: { x: 50, y },
            className: "pass-node",
            draggable: false,
          });
          y += 80;
        }
  
        // Determine the label based on the event type.
        const label = 
          e.event === "compare" ? `compare i=${e.i}, j=${e.j}` :
          e.event === "swap"    ? `swap i=${e.i}, j=${e.j}` :
          "return";
  
        // Highlight the two elements involved in the event.
        const arrStr = e.array
          .map((v, idx) => (idx === e.i || idx === e.j ? `<${v}>` : `${v}`))
          .join(", ");
  
        newNodes.push({
          id: `evt-${i}`,
          data: { label: `${label}\n[ ${arrStr} ]` },
          position: { x: 50, y },
          className: e.event === "swap" ? "swap-node" : "default-node",
          draggable: false,
        });
        y += 80;
      });
  
      // Create a final node to display the final sorted array.
      const finalArr = trace[trace.length - 1].array;
      newNodes.push({
        id: "final",
        data: { label: `Final\n[${finalArr.join(", ")}]` },
        position: { x: 50, y },
        className: "sorted-array-node",
        draggable: false,
      });
  
      // Update your state with the new nodes and trace queue.
      setNodes(newNodes);
      setDebuggedQueue(trace);
    } catch (err) {
      console.error(err);
    } finally {
      setLoader(false);
      setIsRunning(false);
    }
  };
  
  
  const handleNext = () => {
    if (currentStep < debuggedQueue.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Optionally, update node highlighting based on the new step
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          className: node.id === `step-${nextStep}` || (debuggedQueue[nextStep].childNodes && debuggedQueue[nextStep].childNodes.includes(node.id))
            ? `${node.className} highlighted-node`
            : node.className.replace(" highlighted-node", ""),
        }))
      );
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
    setCurrentStep(debuggedQueue.length - 1);
  };

  return (
    <div className="container">
      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <div className="monaco-editor-toolbar">
            <button className="editor-button" onClick={handleShare}>
              {/* Share Icon */}
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
                // Unlock Icon
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-off">
                  <path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982" />
                  <path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353" />
                  <path d="m15 5 4 4" />
                  <path d="m2 2 20 20" />
                </svg>
              ) : (
                // Lock Icon
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
            <button className="editor-button" onClick={location.pathname === "/debugger" ? handleExecute : () => { isRunning ? setIsRunning(false) : handleExecute(); }}>
              {isRunning ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause">
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </button>
            <button className="editor-button" onClick={handleRedo}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-redo">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
              </svg>
            </button>
            <button className="editor-button" onClick={copyToClipboard}>
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-check" style={{ transform: "scale(1.15)" }}>
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="m9 14 2 2 4-4" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
              )}
            </button>
            <button className="editor-button" onClick={() => handleFullscreen("code-editor")}>
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
          </div>

          <MonacoEditor
            className="editor"
            language={language}
            placeholder="Write your code here..."
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
                  "editor.lineHighlightBorder": "#FF5733"
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
              // Write your code here
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
            <button id="execute" onClick={location.pathname === "/debugger" ? handleExecute : () => { isRunning ? setIsRunning(false) : handleExecute(); }}>
              {isRunning ? "Stop" : "Execute"} &nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-code ${isRunning ? "rotate-animation" : ""}`}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>
            <button onClick={handleNext} disabled={currentStep >= debuggedQueue.length - 1} className="forward">
              Next&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <button onClick={handleLast} disabled={currentStep === debuggedQueue.length} className="forward">
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
          {Trace && Array.isArray(Trace) && Trace[currentStep] ? (
            <div>
              <h3>Step {currentStep}</h3>
              <pre>{JSON.stringify(Trace[currentStep], null, 2)}</pre>
            </div>
          ) : (
            <p>Variable Space</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;
