import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "../VisualDebugger/VisualDebugger.css";

// Initialize dagre for layout
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setGraph({ rankdir: "TB" });
dagreGraph.setDefaultEdgeLabel(() => ({}));

const applyDagreLayout = (nodes, edges) => {
  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: 180, height: 50 })
  );
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
  const monacoInstance = useRef(null);
  const [debuggedQueue, setDebuggedQueue] = useState([]);
  const [code, setCode] = useState('');
  const [loader, setLoader] = useState(false);
  const [execute, setExecute] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [language, setLanguage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const editorRef = useRef(null);
  const hasRun = useRef(false);
  const processRef = useRef(null);

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

const handleEditorDidMount = (editor) => {
  editorRef.current = editor;
  editorRef.current.decorations = []; // Initialize decorations
};

// First useEffect to get code from localStorage on mount
useEffect(() => {
  const userCode = localStorage.getItem('code');

  if (userCode) {
    setCode(userCode); // Set the code from localStorage
    setLanguage(detectLanguage(userCode)); // Detect language based on the code
  }
}, []); // Empty dependency array: will run only once on component mount

useEffect(() => {
  if (!hasRun.current && code) {
    const executeButton = document.querySelector('#execute'); // Target the execute button
    if (executeButton) {
      executeButton.click(); // Simulate the button click
    }
    hasRun.current = true; // Mark as executed
  }
}, [code]);  // Empty dependency array: will run only once on component mount

// Second useEffect to update localStorage whenever code changes
useEffect(() => {
  if (code === '') {
    // If the code is empty, remove it from localStorage
    localStorage.removeItem('code');
  } else {
    // Update localStorage with the current code
    localStorage.setItem('code', code);
  }

  // Update the language based on the code
  setLanguage(detectLanguage(code));

}, [code]); // This will run every time the 'code' changes

const handleChange = (value, e) => {
  if (value !== undefined) {
    setCode(value);
    setExecute(false);
  } else {
    console.error('Monaco editor value is undefined');
  }
};

  const FlowController = ({ currentStep, nodes }) => {
    const { setCenter } = useReactFlow();

    useEffect(() => {
        if (nodes.length > 0 && nodes[currentStep]) {
            const activeNode = nodes[currentStep];
            
            // Apply manual adjustments to X and Y positions
            const adjustedX = activeNode.position.x + 80; // Adjust X position
            const adjustedY = activeNode.position.y + 80; // Adjust Y position
            
            // Smooth transition to the adjusted node position
            setCenter(adjustedX, adjustedY, {
                zoom: 1.25,
                duration: 500, // Smooth transition duration
                easing: (t) => t * (2 - t), // Ease-out effect
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
  

  // Copy editor content
  const copyToClipboard = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);

        // Reset to original icon after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy code: ", err);
      }
    }
  };

  // Undo last code change
const handleUndo = () => {
  if (editorRef.current) {
    const editor = editorRef.current;
    editor.trigger("keyboard", "undo");
  }
};

// Redo last undone change
const handleRedo = () => {
  if (editorRef.current) {
    const editor = editorRef.current;
    editor.trigger("keyboard", "redo");
  }
};

// Share code in different formats
const handleShare = async () => {
  if (!editorRef.current) return;

  const code = editorRef.current.getValue();
  const language = detectLanguage(code);

  try {
    const shareText = `Check out this code snippet (${language.toUpperCase()}):\n\n${code}`;
    const shareFile = new Blob([code], { type: "text/plain" });
    const fileName = `code-snippet.${language}`;

    // Share data object
    const shareData = {
      title: "Shared Code",
      text: shareText,
      url: "https://your-code-share-platform.com", // Replace with your platform
      files: [new File([shareFile], fileName)],
    };

    // Attempt to use the Web Share API if available
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback: Copy code and provide download link
      await navigator.clipboard.writeText(shareText);

      // Auto-download the code snippet
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(shareFile);
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  } catch (error) {
    console.error("Error sharing code: ", error);
  }
};

// Smoothly toggle full-screen mode for the Monaco editor with Escape key support
const handleFullscreen = (id) => {
  const editorSection = document.getElementById(id);
  if (!editorSection) return;

  // Check if in fullscreen mode
  const isFullscreen = () => !!document.fullscreenElement;

  // Get section position
  const getPositionClass = () => {
    const rect = editorSection.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const sectionCenter = rect.left + rect.width / 2;

    if (sectionCenter < screenWidth * 0.33) {
      return "fullscreen-left";  // Section is in the left third of the screen
    } else if (sectionCenter > screenWidth * 0.66) {
      return "fullscreen-right"; // Section is in the right third of the screen
    } else {
      return "fullscreen-center"; // Section is in the middle third
    }
  };

  // Handle fullscreen change
  const handleFullscreenChange = () => {
    if (!isFullscreen()) {
      editorSection.classList.remove("fullscreen-active", "fullscreen-left", "fullscreen-center", "fullscreen-right");
      setFullscreen(false);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }
  };

  // Escape key handler
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      exitFullscreen();
    }
  };

  // Enter fullscreen with animation based on position
  const enterFullscreen = () => {
    if (editorSection.requestFullscreen) {
      editorSection.requestFullscreen()
        .then(() => {
          const positionClass = getPositionClass(); // Get the appropriate animation class
          setTimeout(() => {
            editorSection.classList.add("fullscreen-active", positionClass);
            setFullscreen(true);
          }, 300);

          // Add event listeners
          document.addEventListener("keydown", handleKeyDown);
          document.addEventListener("fullscreenchange", handleFullscreenChange);
        })
        .catch((err) => console.error("Error enabling fullscreen:", err));
    } else {
      console.error("Fullscreen API not supported");
    }
  };

  // Exit fullscreen
  const exitFullscreen = () => {
    if (isFullscreen() && document.exitFullscreen) {
      document.exitFullscreen()
        .catch((err) => console.error("Error exiting fullscreen:", err));
    }
  };

  // Toggle fullscreen state
  isFullscreen() ? exitFullscreen() : enterFullscreen();
};

  const handleNext = () => {
    if (currentStep < debuggedQueue.length - 1) {
      setCurrentStep(currentStep + 1); // Just move the highlight
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1); // Just move the highlight
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
  
    const lineNumber = debuggedQueue[currentStep]?.line || 1; // Default to line 1
  
    // Remove previous decorations
    editorRef.current.decorations = editor.deltaDecorations(
      editorRef.current.decorations || [],
      []
    );
  
    // Apply new decoration for highlighting
    editorRef.current.decorations = editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)),
          options: {
            isWholeLine: true,
            className: "highlight-line",
          },
        },
      ]
    );
  
    // Ensure smooth scrolling to the highlighted line
    editor.revealLineInCenter(lineNumber);
  }, [currentStep, debuggedQueue]);

  // Effect hook to update editor options when `isReadOnly` changes
  useEffect(() => {
    if (monacoInstance.current) {
      monacoInstance.current.updateOptions({ readOnly: isReadOnly });
    }
  }, [isReadOnly]); // Run this effect whenever `isReadOnly` state changes

  // Toggle Read-Only Mode
  const toggleReadOnly = () => {
    setIsReadOnly((prev) => !prev); // Toggle the read-only state
  };

  const toggleProcess = async () => {
    if (isRunning) {
      clearInterval(processRef.current);
      try {
        await axios.post("http://localhost:3000/stop-execution");
      } catch (error) {
        console.error("Error stopping execution:", error);
      }
      setIsRunning(false);
      setIsPaused(false);
    } else {
      setIsRunning(true);
      setIsPaused(false);
      await handleExecute();
    }
  };

  const navigate = useNavigate(); // Using useNavigate hook

  // Function to identify problem type and route accordingly
  const identifyProblemAndRoute = useCallback(async (code) => {
    try {
      // Send code to backend for problem identification
      const response = await axios.post("http://localhost:3000/debugger/identifyproblem", {
          problem: code
      });

      const problemType = response.data.problemType.replace(/\s+/g, '').toLowerCase().trim();  // Directly use response.data.problemType
      const specificType = response.data.specificType.replace(/\s+/g, '').toLowerCase().trim();  // Get specificType

      // Route based on both problem type and specific type
      if (problemType === `${problemType}` && specificType === `${specificType}`) {
        navigate(`/debugger/${problemType}/${specificType}`);
      } else {
        console.log("No specific handler for this problem type.");
      }
    } catch (error) {
      console.error("Error identifying problem type or routing:", error);
    }
  }, [navigate]);

  // Execute and fetch the API response
  const handleExecute = useCallback(async () => {
    setLoader(true);
    localStorage.setItem('code', code);

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

      await identifyProblemAndRoute(code);
      const response = await fetch("http://localhost:3000/debugger/sorting/bubblesort", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: code }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      let extractedData = [];

      // Process the content (works if content is string with newline separation)
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
          line: index + 1, // Assign correct line numbers
        }))
      );
      setCurrentStep(0);

      // Create nodes with animation. For sorting, we add a motion.div wrapper.
      const newNodes = extractedData.map((line, index) => {
        let backgroundColor;
        if (data.type === "sorting") {
          // Determine background color for sorting steps based on keywords
          if (line.toLowerCase().includes("merge sort")) {
            backgroundColor = "#AED581"; // Greenish for algorithm name
          } else if (line.toLowerCase().includes("divide")) {
            backgroundColor = "#81D4FA"; // Blueish for divide step
          } else if (line.toLowerCase().includes("merge")) {
            backgroundColor = "#FFAB91"; // Orangeish for merging step
          } else if (line.toLowerCase().includes("example")) {
            backgroundColor = "#CE93D8"; // Purpleish for example details
          } else {
            backgroundColor = "#FFD3B6"; // Default color for sorting
          }
        } else {
          // For loop operations (existing logic)
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

      // Create edges between consecutive nodes
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
      setDebuggedQueue(layoutedElements.nodes); // Store all nodes
      setNodes(layoutedElements.nodes); // Show only the first node initially
      setEdges(layoutedElements.edges);
      setCurrentStep(0); // Reset traversal step
    } catch (error) {
      console.error("Execution Error:", error);
    } finally {
      setLoader(false);
      setExecute(true);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [code, identifyProblemAndRoute]);

  return (
    <div className="container">

      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
            <div className="monaco-editor-toolbar">
              <button className="editor-button" onClick={handleShare}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>              
              </button>

              <button className="editor-button" onClick={toggleReadOnly}>
                {isReadOnly ? (
                  // Show Unlock Icon when in Read-Only mode
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-off"><path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982"/><path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353"/><path d="m15 5 4 4"/><path d="m2 2 20 20"/></svg>                
                ) : (
                  // Show Lock Icon when in Editable mode
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>                
                )}
              </button>

              <button className="editor-button" onClick={handleUndo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>              
              </button>

              <button className="editor-button" onClick={handleExecute}>
                {isRunning ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>                  
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>              
                )}
              </button>

              <button className="editor-button" onClick={handleRedo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-redo"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>              
              </button>
              
              <button className="editor-button" onClick={copyToClipboard}>
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  </svg>
                )}
              </button>
              
              <button className="editor-button" onClick={() => handleFullscreen("code-editor")}>
                {fullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>                
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                )}              
                </button>
            </div>
            
            <MonacoEditor
                className="editor"
                language={language}
                value={code}
                onChange={handleChange}
                options={{
                  fontSize: 14, // Increase font size for better readability
                  minimap: { enabled: false, scale: 1, side: "right" }, // Improve minimap visibility
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 0, bottom: 0, left: 0, right: 0 },
                  quickSuggestions: { other: true, comments: true, strings: true }, 
                  suggestOnTriggerCharacters: true,
                  inlineSuggest: true, // Enable inline suggestions
                  wordWrap: "on", // Enable word wrapping
                  folding: true, // Enable code folding
                  smoothScrolling: true, // Smooth scrolling for better experience
                  tabSize: 2, // Set tab size for better readability
                  renderWhitespace: "all", // Show all whitespaces
                  overviewRulerBorder: false, // Remove ruler border for cleaner UI
                  autoClosingBrackets: "always", // Auto close brackets
                  autoClosingQuotes: "always", // Auto close quotes
                  matchBrackets: "always", // Highlight matching brackets
                  cursorStyle: "line-thin",
                  cursorBlinking: "smooth", // Smoother cursor blinking
                  cursorSmoothCaretAnimation: "on", // Smooth cursor movement
                  suggestSelection: "recentlyUsed", // Improve suggestion selection
                  parameterHints: { enabled: true }, // Show function parameter hints
                  glyphMargin: false, // Enable glyph margin for debugging indicators
                  lightbulb: { enabled: true }, // Show code action lightbulbs
                  formatOnType: true, // Auto-format code while typing
                  formatOnPaste: true, // Auto-format on paste
                  bracketPairColorization: { enabled: true }, // Colorize matching brackets
                  stickyScroll: { enabled: true }, // Enable sticky scroll for better navigation
                  lineNumbersMinChars: 3,
                  readOnly: isReadOnly,
                }}
                beforeMount={(monaco) => {
                  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
                  
                  // Define and apply a custom theme
                  monaco.editor.defineTheme("customTheme", {
                    base: "vs",
                    inherit: true,
                    rules: [],
                    colors: {
                      "editor.background": "#FFFFFF", // Your desired background color
                      "editor.lineHighlightBorder": "#FF5733"
                    },
                  });
                  
                  monaco.editor.setTheme("customTheme");
                }}
                onMount={handleEditorDidMount}
              />
          <div className="buttons">
            <button onClick={handleFirst} disabled={currentStep === 0}>First</button>
            <button onClick={handlePrev} disabled={currentStep === 0}>Prev</button>
            <button id="execute" onClick={toggleProcess}>
                {isRunning ? "Stop" : "Execute"}
            </button>
            <button onClick={handleNext} disabled={currentStep >= debuggedQueue.length - 1}>Next</button>
            <button onClick={handleLast} disabled={currentStep === debuggedQueue.length}>Last</button>
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("left")}></div>

        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
              <button className="editor-button" id="react-flow-fullscreen" onClick={() => handleFullscreen("visual-debugger")}>
                {fullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>                
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
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
        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>
          Variable Space
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;