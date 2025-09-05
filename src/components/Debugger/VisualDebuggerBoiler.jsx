import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, transform } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";  // Importing useNavigate if you're using React Router
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import axios from "axios";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "./VisualDebuggerBoiler.css";
import CodeEditor from "./CodeEditor";
import VisualDebuggerGraph from "./VisualDebuggerGraph";
import VariableSpace from "./VariableSpace";
import AIAssistant from '../AIAssistant/AIAssistant';
import { useCodeSharing } from '../../hooks/useCodeSharing';
import Toast from '../Toast';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

dagreGraph.setGraph({
  rankdir: "TB", // Can be dynamically changed ("TB", "LR", "RL", "BT")
  nodesep: 50,  // Spacing between nodes
  ranksep: 100, // Spacing between ranks
  marginx: 20,  
  marginy: 20,
});

const applyDagreLayout = (nodes, edges, layoutOptions = {}) => {
  const { rankdir = "TB", nodesep = 50, ranksep = 100 } = layoutOptions;

  // Update graph layout properties dynamically
  dagreGraph.setGraph({ rankdir, nodesep, ranksep, marginx: 20, marginy: 20 });
  
  // Add nodes to the graph with dynamic sizing
  nodes.forEach((node) => {
    const width = node.width || 150; // Default width
    const height = node.height || 60; // Default height
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { weight: edge.weight || 1 });
  });

  // Compute layout
  dagre.layout(dagreGraph);

  // Update node positions with computed layout
  const positionedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return { ...node, position: { x, y } };
  });

  return { nodes: positionedNodes, edges };
};

const VisualDebuggerBoiler = ({ onChatMessage }) => {
  // Layout and state variables
  const [leftWidth, setLeftWidth] = useState(45);
  const [middleWidth, setMiddleWidth] = useState(66.67);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [showVariableSpace, setShowVariableSpace] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
  const location = useLocation();
  const editorRef = useRef(null);
  const hasRun = useRef(false);
  const processRef = useRef(null);
  const {problemType, specificType} = location.state || {};
  const [Trace,setTrace] = useState();
  const hasExecutedForPath = useRef(false);  // Add this ref to track execution state
  const { toast, handleShare } = useCodeSharing();
  const [error, setError] = useState(null);  // Add error state
  const [loading, setLoading] = useState(false);  // Add loading state
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef(null);
  const [autoExecute, setAutoExecute] = useState(false);
  const [isFromChatbot, setIsFromChatbot] = useState(false);
  const [shouldAutoExecuteOnRoute, setShouldAutoExecuteOnRoute] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState('TB'); // TB, LR, RL, BT

  // Reset execution state on mount
  useEffect(() => {
    setIsRunning(false);
    setIsPaused(false);
    setLoader(false);
    setExecute(false);
    localStorage.removeItem('isRunning');
  }, []);

  // Add performance optimization for node updates
  const debouncedNodeUpdate = useCallback(
    debounce((newNodes) => {
      setNodes(newNodes);
    }, 100),
    []
  );

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
    if (editor) {
      editorRef.current = editor;
      editorRef.current.decorations = []; // Initialize decorations
      
      // Configure editor options
      editor.updateOptions({
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        cursorSmoothCaretAnimation: 'on',
        cursorBlinking: 'smooth',
        renderWhitespace: 'selection',
        renderLineHighlight: 'all',
        minimap: {
          enabled: true,
          renderCharacters: false,
          maxColumn: 80
        },
        // Add undo/redo configuration
        undoStopAfterPaste: true,
        undoStopBeforePaste: true,
        multiCursorModifier: 'alt',
        wordWrap: 'on'
      });

      // Add change event listener with debouncing
      editor.onDidChangeModelContent(() => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        updateTimeoutRef.current = setTimeout(() => {
          const value = editor.getValue();
          handleChange(value);
        }, 100);
      });
      setEditorInitialized(true);
    } else {
      console.error('Editor initialization failed');
      setError('Editor initialization failed. Please try refreshing the page.');
      setEditorInitialized(false);
    }
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
      if (executeButton && location.pathname !== "/debugger") {
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
    if (value === undefined) {
      console.error('Monaco editor value is undefined');
      return;
    }

    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set the code state directly
    setCode(value);
    setExecute(false);
    
    // Only reset execution state if not from chatbot
    if (!isFromChatbot) {
      setIsRunning(false);
      setLoader(false);
      setCurrentStep(-1);
      setDebuggedQueue([]);
      setNodes([]);
      setEdges([]);
      setTrace(null);
      hasExecutedForPath.current = false;
      setAutoExecute(false); // Disable auto-execution on manual changes
    }
  };

  // Add CSS for smooth transitions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .monaco-editor .view-line {
        transition: background-color 0.3s ease-in-out;
      }

      .monaco-editor .margin {
        transition: background-color 0.3s ease-in-out;
      }

      .monaco-editor .current-line {
        transition: background-color 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const FlowController = ({ currentStep, nodes }) => {
    const { setCenter, getViewport } = useReactFlow();

    useEffect(() => {
      if (nodes.length > 0 && nodes[currentStep]) {
        const activeNode = nodes[currentStep];
        const viewport = getViewport();
        
        // Calculate the center position of the node
        const nodeCenterX = activeNode.position.x + (activeNode.width || 150) / 2;
        const nodeCenterY = activeNode.position.y + (activeNode.height || 60) / 2;
        
        // Calculate the offset to center the node in the viewport
        const offsetX = viewport.width / 2;
        const offsetY = viewport.height / 2;
        
        // Calculate the final position to center the node
        const targetX = nodeCenterX - offsetX;
        const targetY = nodeCenterY - offsetY;
        
        // Smooth transition to the centered position
        setCenter(targetX, targetY, {
          zoom: 1.25,
          duration: 500,
          easing: (t) => t * (2 - t), // Ease-out effect
        });
      }
    }, [currentStep, nodes, setCenter, getViewport]);

    return null;
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.getModel()?.setLanguage(language);
    }
  }, [language]);

  const handleMouseDown = (section) => (e) => {
    e.preventDefault();
    // Remove transition classes when starting to resize
    document.querySelector('.main-content').classList.remove('transition-enabled');
    document.querySelectorAll('.section').forEach(section => section.classList.remove('transition-enabled'));
    setDragging({ section, startX: e.clientX });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const { section, startX } = dragging;
    const dx = e.clientX - startX;
    const totalWidth = window.innerWidth;
    const percentChange = (dx / totalWidth) * 100;

    if (section === "left") {
      const newLeftWidth = Math.max(20, Math.min(60, leftWidth + percentChange));
      const remainingWidth = 100 - newLeftWidth;
      
      if (showVariableSpace) {
        // When variable space is visible, distribute remaining width between middle and right
        const newMiddleWidth = Math.max(20, Math.min(60, remainingWidth * 0.5));
        const newRightWidth = remainingWidth - newMiddleWidth;
        setLeftWidth(newLeftWidth);
        setMiddleWidth(newMiddleWidth);
        setRightWidth(newRightWidth);
      } else {
        // When variable space is hidden, give all remaining width to middle
        setLeftWidth(newLeftWidth);
        setMiddleWidth(remainingWidth);
        setRightWidth(0);
      }
    } else if (section === "middle") {
      if (showVariableSpace) {
        const newMiddleWidth = Math.max(20, Math.min(60, middleWidth + percentChange));
        const newRightWidth = Math.max(20, Math.min(60, rightWidth - percentChange));
        const remainingWidth = 100 - newMiddleWidth - newRightWidth;
        
        setLeftWidth(remainingWidth);
        setMiddleWidth(newMiddleWidth);
        setRightWidth(newRightWidth);
      }
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
  }, [dragging]); // `dragging` needs to be in dependency for smooth updates

  // Handle React Flow node changes
  const onNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      debouncedNodeUpdate(newNodes);
    },
    [nodes, debouncedNodeUpdate]
  );

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


  // Copy editor content
  const copyToClipboard = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);

        // Reset to original icon after 1 seconds
        setTimeout(() => setCopied(false), 1000);
      } catch (err) {
        console.error("Failed to copy code: ", err);
      }
    }
  };

  // Undo last code change
  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  };

  // Redo last undone change
  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  };

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
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const step = debuggedQueue[nextStep];

      // Update nodes: Remove previous highlights and apply only to the current ones
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          className:
            node.id === step.processedNode || step.childNodes.includes(node.id)
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
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const step = debuggedQueue[prevStep];

      // Update nodes: Remove previous highlights and apply only to the current ones
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          className:
            node.id === step.processedNode || step.childNodes.includes(node.id)
              ? `${node.className} highlighted-node`
              : node.className.replace(" highlighted-node", ""),
        }))
      );
    }
  };

  const handleFirst = () => {
    setCurrentStep(0);
    const step = debuggedQueue[0];

    // Update nodes: Remove previous highlights and apply only to the first step
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        className:
          node.id === step.processedNode || step.childNodes.includes(node.id)
            ? `${node.className} highlighted-node`
            : node.className.replace(" highlighted-node", ""),
      }))
    );
  };

  const handleLast = () => {
    const lastStep = debuggedQueue.length - 1;
    setCurrentStep(lastStep);
    const step = debuggedQueue[lastStep];

    // Update nodes: Remove previous highlights and apply only to the last step
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        className:
          node.id === step.processedNode || step.childNodes.includes(node.id)
            ? `${node.className} highlighted-node`
            : node.className.replace(" highlighted-node", ""),
      }))
    );
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

  const toggleProcess = async () => {
    if (isRunning) {
      try {
        // Clear the interval first
        if (processRef.current) {
          clearInterval(processRef.current);
          processRef.current = null;
        }

        // Update state before making the API call
        setIsRunning(false);
        setIsPaused(true);
        setLoader(false);
        setExecute(false);
        localStorage.removeItem('isRunning');

        // Make the API call to stop execution
        const response = await axios.post("https://code-backend-89a2.onrender.com/stop-execution", {}, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000 // Add timeout to prevent hanging
        });

        if (response.status === 200) {
          console.log("Execution stopped successfully");
          // Clear any remaining state
          setDebuggedQueue([]);
          setNodes([]);
          setEdges([]);
          setTrace(null);
          setCurrentStep(-1);
        } else {
          console.warn("Unexpected response when stopping execution:", response.status);
        }
      } catch (error) {
        console.error("Error stopping execution:", error);
        // Even if the API call fails, ensure the UI is updated
        setIsRunning(false);
        setIsPaused(true);
        setLoader(false);
        setExecute(false);
        localStorage.removeItem('isRunning');
      }
    } else {
      try {
        setIsRunning(true);
        setIsPaused(false);
        setLoader(true);
        localStorage.setItem('isRunning', 'true');
        await handleExecute();
      } catch (error) {
        console.error("Error starting execution:", error);
        setIsRunning(false);
        setIsPaused(false);
        setLoader(false);
        localStorage.removeItem('isRunning');
        setErrorMessage("Failed to start execution. Please try again.");
      }
    }
  };

  const navigate = useNavigate(); // Using useNavigate hook

  // Function to identify problem type and route accordingly
  const identifyProblemAndRoute = useCallback(async (code) => {
    try {
      // Send code to backend for problem identification
      const response = await axios.post("https://code-backend-89a2.onrender.com/debugger/identifyproblem", {
        problem: code
      });

      const problemType = response.data.problemType.replace(/\s+/g, '').toLowerCase().trim();
      const specificType = response.data.specificType.replace(/\s+/g, '').toLowerCase().trim();

      // Route based on both problem type and specific type
      navigate(`/debugger/${problemType}/${specificType}`, { 
        state: { problemType, specificType } 
      });
    } catch (error) {
      console.error("Error identifying problem type or routing:", error);
    }
  }, [navigate]);

  // Enhanced error handling for execution
  const handleExecute = useCallback(async () => {
    if (isTransitioning || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      if (!editorInitialized) {
        throw new Error('Editor not initialized. Please wait or refresh the page.');
      }

      if (!editorRef.current || typeof editorRef.current.getValue !== 'function') {
        throw new Error('Editor not properly initialized. Please try refreshing the page.');
      }

      const code = editorRef.current.getValue();
      if (!code?.trim()) {
        return; // Silently return for empty code
      }

      // Clear previous visualization with animation
      setNodes([]);
      setEdges([]);
      setTrace(null);
      setCurrentStep(-1);
      setDebuggedQueue([]);

      // Extract array from code for sorting algorithms
      let arrayToSort = null;
      if (code.includes('merge_sort') || code.includes('mergesort')) {
        // Try to find Java-style array declaration
        const javaArrayMatch = code.match(/int\s*\[\]\s*\w+\s*=\s*\{([\d\s,]+)\}/);
        if (javaArrayMatch) {
          try {
            const arrayContent = javaArrayMatch[1].split(',').map(num => parseInt(num.trim()));
            if (arrayContent.every(num => !isNaN(num))) {
              arrayToSort = arrayContent;
              console.log("Found Java array:", arrayToSort);
            }
          } catch (e) {
            console.log("Failed to parse Java array:", e);
          }
        }

        // If no Java array found, try other formats
        if (!arrayToSort) {
          // Try to find array in the code
          const arrayMatch = code.match(/\[[\d\s,]*\]/);
          if (arrayMatch) {
            try {
              arrayToSort = JSON.parse(arrayMatch[0]);
              if (!Array.isArray(arrayToSort) || !arrayToSort.every(num => typeof num === 'number')) {
                throw new Error('Invalid array format');
              }
            } catch (e) {
              // If array parsing fails, try to find variables
              const variableMatches = code.match(/(?:let|const|var|int\[\])\s+(\w+)\s*=\s*([^;]+)/g);
              if (variableMatches) {
                for (const match of variableMatches) {
                  const value = match.split('=')[1].trim();
                  try {
                    // Try to parse the value as an array
                    const parsedValue = JSON.parse(value);
                    if (Array.isArray(parsedValue) && parsedValue.every(num => typeof num === 'number')) {
                      arrayToSort = parsedValue;
                      break;
                    }
                  } catch (e) {
                    // If parsing fails, try to evaluate the expression
                    try {
                      const evaluatedValue = eval(value);
                      if (Array.isArray(evaluatedValue) && evaluatedValue.every(num => typeof num === 'number')) {
                        arrayToSort = evaluatedValue;
                        break;
                      }
                    } catch (evalError) {
                      continue;
                    }
                  }
                }
              }
            }
          }
        }
        
        if (!arrayToSort) {
          // If no numeric array found, use a default array for visualization
          arrayToSort = [64, 34, 25, 12, 22, 11, 90];
          console.log("No numeric array found, using default array for visualization:", arrayToSort);
        }
      }

      // Only proceed with execution if there are no syntax errors
      setLoader(true);
      setIsRunning(true);
      localStorage.setItem('isRunning', 'true');
      localStorage.setItem("code", code);

      // Continue with existing execution logic
      await identifyProblemAndRoute(code);

      // 3. Ensure we are on the correct path before fetching
      if (location.pathname === `/debugger/${problemType}/${specificType}`) {
        try {
          // Ensure arrayToSort is a valid numeric array
          if (!Array.isArray(arrayToSort) || !arrayToSort.every(num => typeof num === 'number')) {
            arrayToSort = [64, 34, 25, 12, 22, 11, 90];
          }

          // 4. POST the code to your backend
          const response = await fetch(
            `https://code-backend-89a2.onrender.com/debugger/${problemType}/${specificType}`,
            {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({ 
                problem: code,
                array: arrayToSort 
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
          }

          // 5. Parse the backend response
          const data = await response.json();
          // Expected structure: { inputArray, sortedArray, mergeSortTable }
          const { inputArray, sortedArray, mergeSortTable, executionTrace } = data;
          
          if (!inputArray || !sortedArray || !mergeSortTable) {
            throw new Error("Invalid response format from backend.");
          }

          setTrace(executionTrace);
          // 6. Build Nodes & Edges from mergeSortTable
          const backendNodes = mergeSortTable.nodes;
          const backendEdges = mergeSortTable.edges;

          // Compute a level (y-position) for each node based on the DAG dependencies.
          // First, compute in-degrees.
          const inDegree = {};
          backendNodes.forEach((node) => {
            inDegree[node.id] = 0;
          });
          backendEdges.forEach((edge) => {
            inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
          });

          // Nodes with in-degree 0 start at level 0.
          const levelMap = {}; // map of nodeId -> level
          const queue = [];
          backendNodes.forEach((node) => {
            if (inDegree[node.id] === 0) {
              levelMap[node.id] = 0;
              queue.push(node.id);
            }
          });

          // Prepare an array to store each debug step of the level calculation.
          const debugSteps = [];

          // Propagate levels: each child gets parent's level + 1.
          while (queue.length > 0) {
            const currentId = queue.shift();

            // Determine child nodes for the current node
            const childNodes = backendEdges
              .filter(edge => edge.source === currentId)
              .map(edge => edge.target);

            backendEdges.forEach((edge) => {
              if (edge.source === currentId) {
                const newLevel = levelMap[currentId] + 1;
                if (levelMap[edge.target] === undefined || newLevel > levelMap[edge.target]) {
                  levelMap[edge.target] = newLevel;
                }
                // Only add the target to the queue if it isn't already present.
                if (!queue.includes(edge.target)) {
                  queue.push(edge.target);
                }
              }
            });

            // Save a snapshot of the current step including the child nodes.
            debugSteps.push({
              processedNode: currentId,
              childNodes, // store child nodes for highlighting later
              currentLevelMap: { ...levelMap },
              remainingQueue: [...queue],
            });
          }
          // Save the debug steps to state so they can be accessed by handleNext.
          setDebuggedQueue(debugSteps);
          // Group nodes by level for horizontal positioning.
          const levelNodes = {};
          backendNodes.forEach((node) => {
            const lvl = levelMap[node.id] || 0;
            if (!levelNodes[lvl]) levelNodes[lvl] = [];
            levelNodes[lvl].push(node);
          });

          // Create new nodes with calculated positions.
          const newNodes = [];
          const newEdges = [];
          const levelGap = 100; // vertical spacing between levels
          const nodeGap = 120;  // horizontal spacing between nodes on same level

          Object.keys(levelNodes).forEach((lvlStr) => {
            const lvl = Number(lvlStr);
            const nodesAtLevel = levelNodes[lvl];
            nodesAtLevel.forEach((node, idx) => {
              let nodeClass = "default-node";
              if (node.id.includes("_merge")) {
                nodeClass = "merge-node";
              } else if (node.id.includes("_div")) {
                nodeClass = "div-node";
              }
              newNodes.push({
                id: node.id,
                data: { label: `${node.id}: ${JSON.stringify(node.state)}` },
                position: { x: idx * nodeGap, y: lvl * levelGap },
                draggable: false,
                className: nodeClass, // CSS class will control border, background, etc.
              });
            });
          });

          // Create new edges with moving animation and arrow markers.
          backendEdges.forEach((edge) => {
            newEdges.push({
              id: `${edge.source}-${edge.target}`,
              source: edge.source,
              target: edge.target,
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: "#000", // Arrow color; can be styled in CSS as well
              },
              className: "custom-edge", // Use CSS to add further styling if needed
            });
          });

          // Optionally, add a final node to show the sorted array.
          const maxLevel = Math.max(...Object.values(levelMap));
          newNodes.push({
            id: "sortedArray",
            data: { label: `Sorted Array: ${JSON.stringify(sortedArray)}` },
            position: { x: 100, y: (maxLevel + 1) * levelGap },
            draggable: false,
            className: "sorted-array-node",
          });

          // 8. Update React state to show nodes & edges in the UI
          setNodes(newNodes);
          setEdges(newEdges);
        } catch (error) {
          console.error("Error fetching merge sort data:", error);
        }
      }
    } catch (error) {
      console.error("Execution Error:", error);
      setErrorMessage(error.message || 'An error occurred during execution');
      setNodes([
        {
          id: "error",
          data: { 
            label: (
              <div className="error-content">
                <div className="error-header">
                  <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Execution Error</span>
                </div>
                <div className="error-message">
                  {error.message}
                </div>
              </div>
            )
          },
          position: { x: 200, y: 200 },
          draggable: false,
          className: "error-node",
        }
      ]);
      setEdges([]);
    } finally {
      setIsProcessing(false);
      setLoader(false);
      setExecute(true);
      setIsRunning(false);
      localStorage.removeItem('isRunning');
      setIsPaused(false);
      setCurrentStep(-1);
    }
  }, [code, identifyProblemAndRoute, location.pathname, problemType, specificType, editorInitialized, isTransitioning, isProcessing]);

  // Add useEffect to handle route changes
  useEffect(() => {
    if (location.pathname !== "/debugger" && shouldAutoExecuteOnRoute) {
      setShouldAutoExecuteOnRoute(false); // Prevent future auto-executions
      setAutoExecute(true); // Enable auto-execution for this route
      
      // Reset the execution flag to allow execution
      hasExecutedForPath.current = false;
      
      // Schedule the execution
      const timeoutId = setTimeout(() => {
        if (editorInitialized && code) {
          handleExecute();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, shouldAutoExecuteOnRoute, editorInitialized, code]);

  // Modify the useEffect for automatic execution
  useEffect(() => {
    let timeoutId;
    if (code && 
        location.pathname !== "/debugger" && 
        !isRunning && 
        !loader && 
        !hasExecutedForPath.current && 
        editorInitialized && 
        autoExecute && 
        !isFromChatbot) {
      timeoutId = setTimeout(() => {
        hasExecutedForPath.current = true;
        handleExecute();
        setAutoExecute(false); // Disable auto-execution after first run
      }, 100);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location.pathname, code, isRunning, loader, editorInitialized, autoExecute, isFromChatbot]);

  // Reset the execution flag when pathname changes
  useEffect(() => {
    hasExecutedForPath.current = false;
    setShouldAutoExecuteOnRoute(true); // Enable auto-execution for new routes
  }, [location.pathname]);

  // Add this useEffect at the top level of the component
  useEffect(() => {
    // Check if we were running before navigation
    const wasRunning = localStorage.getItem('isRunning') === 'true';
    if (wasRunning) {
      setIsTransitioning(true);  // Set transitioning state
      // Keep the running state in localStorage during transition
      localStorage.setItem('isRunning', 'true');
      // Clear transitioning state after a short delay
      setTimeout(() => {
        setIsTransitioning(false);
        setIsRunning(true);
      }, 300);
    } else {
      // If not running, ensure localStorage is cleared
      localStorage.removeItem('isRunning');
      setIsRunning(false);
    }
  }, [location.pathname]); // Run this effect when the pathname changes

  // Add function to normalize widths when toggling variable space
  const normalizeWidths = (showVarSpace) => {
    if (showVarSpace) {
      // When showing variable space, distribute remaining width between middle and right
      const remainingWidth = 100 - leftWidth;
      const newMiddleWidth = remainingWidth * 0.5;
      const newRightWidth = remainingWidth - newMiddleWidth;
      setMiddleWidth(newMiddleWidth);
      setRightWidth(newRightWidth);
    } else {
      // When hiding variable space, give all remaining width to middle
      setMiddleWidth(100 - leftWidth);
      setRightWidth(0);
    }
  };

  // Modify toggleLayout to add transition classes
  const toggleLayout = () => {
    setIsTransitioning(true);
    // Add transition classes for smooth toggle
    document.querySelector('.main-content').classList.add('transition-enabled');
    document.querySelectorAll('.section').forEach(section => section.classList.add('transition-enabled'));
    
    const newShowVariableSpace = !showVariableSpace;
    setShowVariableSpace(newShowVariableSpace);
    normalizeWidths(newShowVariableSpace);
    
    setTimeout(() => {
      setIsTransitioning(false);
      // Remove transition classes after toggle
      document.querySelector('.main-content').classList.remove('transition-enabled');
      document.querySelectorAll('.section').forEach(section => section.classList.remove('transition-enabled'));
    }, 500);
  };

  // Add the validateSyntax function
  const validateSyntax = (code, language) => {
    const errors = [];
    
    // Check for balanced brackets and parentheses
    const brackets = {
      '(': ')',
      '[': ']',
      '{': '}'
    };
    const stack = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (brackets[char]) {
          stack.push({ char, line: i + 1, col: j + 1 });
        } else if (Object.values(brackets).includes(char)) {
          if (stack.length === 0) {
            errors.push(`Unexpected closing bracket '${char}' at line ${i + 1}, column ${j + 1}`);
          } else {
            const last = stack.pop();
            if (brackets[last.char] !== char) {
              errors.push(`Mismatched brackets: '${last.char}' at line ${last.line}, column ${last.col} and '${char}' at line ${i + 1}, column ${j + 1}`);
            }
          }
        }
      }
    }

    if (stack.length > 0) {
      const last = stack.pop();
      errors.push(`Unclosed bracket '${last.char}' at line ${last.line}, column ${last.col}`);
    }

    // Check for infinite loops
    const loopPatterns = {
      python: [
        { pattern: /while\s+True:/g, message: 'Potential infinite loop detected. Please add a break condition.' },
        { pattern: /for\s+\w+\s+in\s+range\s*\(\s*\d+\s*\):/g, message: 'Potential infinite loop detected. Please add a break condition.' }
      ],
      javascript: [
        { pattern: /while\s*\(\s*true\s*\)/g, message: 'Potential infinite loop detected. Please add a break condition.' },
        { pattern: /for\s*\(\s*;\s*;\s*\)/g, message: 'Potential infinite loop detected. Please add a break condition.' }
      ],
      java: [
        { pattern: /while\s*\(\s*true\s*\)/g, message: 'Potential infinite loop detected. Please add a break condition.' },
        { pattern: /for\s*\(\s*;\s*;\s*\)/g, message: 'Potential infinite loop detected. Please add a break condition.' }
      ],
      cpp: [
        { pattern: /while\s*\(\s*true\s*\)/g, message: 'Potential infinite loop detected. Please add a break condition.' },
        { pattern: /for\s*\(\s*;\s*;\s*\)/g, message: 'Potential infinite loop detected. Please add a break condition.' }
      ]
    };

    if (loopPatterns[language]) {
      loopPatterns[language].forEach(({ pattern, message }) => {
        if (pattern.test(code)) {
          errors.push(message);
        }
      });
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join('\n')
      };
    }

    return { isValid: true };
  };

  // Add cleanup for the timeout
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Modify handleCodeFromChatbot to handle all responses naturally
  const handleCodeFromChatbot = (response) => {
    // Check if this is a code-related response
    const codeMatch = response.match(/```(?:python|java|javascript|cpp)?\n([\s\S]*?)```/);
    
    if (codeMatch && editorRef.current) {
      // This is a code response, apply it to the editor
      const codeToApply = codeMatch[1].trim();
      setIsFromChatbot(true);
      
      const model = editorRef.current.getModel();
      if (model) {
        editorRef.current.executeEdits('chatbot-edit', [{
          range: model.getFullModelRange(),
          text: codeToApply,
          forceMoveMarkers: true
        }]);
      }
      
      setCode(codeToApply);
      setTimeout(() => {
        setIsFromChatbot(false);
      }, 1000);
    }
  };

  // Fix layout direction toggle
  const toggleLayoutDirection = useCallback(() => {
    const directions = ['TB', 'LR', 'RL', 'BT'];
    const currentIndex = directions.indexOf(layoutDirection);
    const nextDirection = directions[(currentIndex + 1) % directions.length];
    
    // Ensure we have nodes before applying layout
    if (nodes.length > 0) {
      // Create a new dagre graph instance
      const g = new dagre.graphlib.Graph();
      g.setGraph({
        rankdir: nextDirection,
        nodesep: 50,
        ranksep: 100,
        marginx: 20,
        marginy: 20
      });
      g.setDefaultEdgeLabel(() => ({}));

      // Add nodes to the graph
      nodes.forEach((node) => {
        g.setNode(node.id, {
          width: node.width || 150,
          height: node.height || 60
        });
      });

      // Add edges to the graph
      edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      // Compute the layout
      dagre.layout(g);

      // Get the new node positions
      const newNodes = nodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - (node.width || 150) / 2,
            y: nodeWithPosition.y - (node.height || 60) / 2
          }
        };
      });

      // Update both the direction and nodes in a single batch
      setLayoutDirection(nextDirection);
      setNodes(newNodes);
    }
  }, [nodes, edges]);

  // Update the layout button to show current direction
  const getLayoutIcon = () => {
    switch (layoutDirection) {
      case 'TB':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
            <path d="M3 3h18v18H3z" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        );
      case 'LR':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
            <path d="M3 3h18v18H3z" />
            <path d="M9 3v18" />
            <path d="M3 9h18" />
          </svg>
        );
      case 'RL':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
            <path d="M3 3h18v18H3z" />
            <path d="M15 3v18" />
            <path d="M3 9h18" />
          </svg>
        );
      case 'BT':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
            <path d="M3 3h18v18H3z" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            handleExecute();
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleNext();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            handlePrev();
            break;
          case 'Home':
            e.preventDefault();
            handleFirst();
            break;
          case 'End':
            e.preventDefault();
            handleLast();
            break;
          case 'l':
            e.preventDefault();
            toggleLayoutDirection();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleExecute, handleNext, handlePrev, handleFirst, handleLast, toggleLayoutDirection]);

  const handleApplyAISuggestions = (newCode) => {
    if (editorRef.current && newCode) {
      const model = editorRef.current.getModel();
      if (model) {
        // Get the full range of the editor
        const fullRange = model.getFullModelRange();
        
        // Apply the code changes
        editorRef.current.executeEdits('ai-suggestion', [{
          range: fullRange,
          text: newCode,
          forceMoveMarkers: true
        }]);
        
        // Update the code state
        setCode(newCode);
        
        // Focus the editor
        editorRef.current.focus();
      }
    }
  };

  return (
    <div className="container bg-navy-900/50 backdrop-blur-sm min-h-screen w-screen max-w-none px-0 mx-0">
      <Toast {...toast} />
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
      <div className="main-content flex h-[calc(100vh-4rem)] relative overflow-hidden">
        <CodeEditor
          code={code}
          language={language}
          onCodeChange={handleChange}
          isReadOnly={isReadOnly}
          onEditorMount={handleEditorDidMount}
          onShare={handleShare}
          onToggleReadOnly={toggleReadOnly}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCopy={copyToClipboard}
          onFullscreen={handleFullscreen}
          copied={copied}
          fullscreen={fullscreen}
          handleFirst={handleFirst}
          handlePrev={handlePrev}
          handleNext={handleNext}
          handleLast={handleLast}
          handleExecute={handleExecute}
          toggleProcess={toggleProcess}
          currentStep={currentStep}
          debuggedQueue={debuggedQueue}
          isRunning={isRunning}
          isTransitioning={isTransitioning}
          location={location}
          leftWidth={leftWidth}
        />

        {/* Resizer between Code Editor and Visual Debugger */}
        <div
          className="group flex-shrink-0 w-1 h-full bg-transparent cursor-ew-resize
            hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors duration-150"
          onMouseDown={handleMouseDown("left")}
          title="Drag to resize"
        ></div>

        <VisualDebuggerGraph
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          loader={loader}
          currentStep={currentStep}
          onFullscreen={handleFullscreen}
          middleWidth={middleWidth}
          showVariableSpace={showVariableSpace}
        />

        {showVariableSpace && (
          <>
            {/* Resizer between Visual Debugger and Variable Space */}
            <div
              className="group flex-shrink-0 w-1 h-full bg-transparent cursor-ew-resize
                hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors duration-150"
              onMouseDown={handleMouseDown("middle")}
              title="Drag to resize"
            ></div>
            <VariableSpace
              trace={Trace}
              currentStep={currentStep}
              rightWidth={rightWidth}
            />
          </>
        )}

        <button 
          className={`layout-toggle-button absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex justify-center items-center 
          bg-slate-800/60 border border-slate-700/50 rounded-full cursor-pointer z-50 transition-all duration-300 ease-in-out 
          hover:bg-purple-600/30 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] 
          active:bg-purple-700/40 ${showVariableSpace ? 'expanded' : ''}`}
                    onClick={toggleLayout}
                    title={showVariableSpace ? "Collapse" : "Expand"}
                  >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-purple-400 transition-transform duration-300"
          >
            <path d={showVariableSpace ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
          </svg>
        </button>

        {/* Update the layout direction toggle button */}
        <button
          className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 flex justify-center items-center 
            bg-slate-800/60 border border-slate-700/50 rounded-full cursor-pointer z-50 
            transition-all duration-300 ease-in-out hover:bg-purple-600/30 
            hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] 
            active:bg-purple-700/40"
          onClick={toggleLayoutDirection}
          title={`Change layout direction (Current: ${layoutDirection})`}
        >
          {getLayoutIcon()}
        </button>
      </div>
      <AIAssistant onApplyChanges={handleApplyAISuggestions} />
    </div>
  );
};

// Add debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default VisualDebuggerBoiler;