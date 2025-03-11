import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import dagre from "dagre"; // For automatic node layout
import "reactflow/dist/style.css";
import "./App.css";

const App = () => {
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);

  const [debuggedQueue, setDebuggedQueue] = useState([]);
  const [code, setCode] = useState("// Write your code here...");
  const [execute, setExecute] = useState(0);
  const [loader, setLoader] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleExecute = useCallback(async () => {
    setLoader(true);
  
    try {
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: code }),
      });
  
      const data = await response.json();
      const newOutput = data.loop.split("\n").filter(Boolean);
      setDebuggedQueue(newOutput);
  
      const newNodes = newOutput.map((line, index) => ({
        id: `${index}`,
        data: { label: line },
        position: { x: 0, y: index * 100 },
        style: {
          border: "2px solid #555",
          padding: 10,
          borderRadius: 8,
          fontSize: 14,
          boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.2)",
          backgroundColor: line.includes("i++")
            ? "#DFF2BF"
            : line.includes("i<n")
            ? "#BDE0FE"
            : "#FFD3B6",
        },
      }));
  
      const newEdges = newOutput.slice(1).map((_, index) => ({
        id: `e${index}-${index + 1}`,
        source: `${index}`,
        target: `${index + 1}`,
        animated: true,
        style: { stroke: "#555", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
        },
      }));
  
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes,
        newEdges
      );
  
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error("Execution Error:", error);
    } finally {
      setLoader(false);
    }
  }, [code]);

  // DAGRE (for automatic layout)
  const getLayoutedElements = (nodes, edges) => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: "TB" }); // Top to Bottom layout
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => graph.setNode(node.id, { width: 150, height: 50 }));
    edges.forEach((edge) => graph.setEdge(edge.source, edge.target));

    dagre.layout(graph);

    const newNodes = nodes.map((node) => ({
      ...node,
      position: {
        x: graph.node(node.id).x,
        y: graph.node(node.id).y,
      },
    }));

    return { nodes: newNodes, edges };
  };

  useEffect(() => {
    if (execute === 0) return;
    setLoader(true);
  
    const fetchExecutionData = async () => {
      try {
        const response = await fetch("http://localhost:3000/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: code }),
        });
  
        const data = await response.json();
        
        // Split into lines and filter out unwanted elements
        const newOutput = data.loop
          .split("\n")
          .map((line) => line.trim()) // Trim spaces
          .filter((line) => {
            return (
              line.length > 2 && // Avoid single characters
              !line.match(/^[\[\]{}"]+$/) && // Remove isolated JSON characters
              !line.match(/^(\d+[:,]*)+$/) // Remove array-like structures
            );
          }); // Filter out unwanted characters
  
        setDebuggedQueue(newOutput);
  
        const newNodes = newOutput.map((line, index) => ({
          id: `${index}`,
          data: { label: line },
          position: { x: 0, y: index * 100 },
          style: {
            border: "2px solid #555",
            padding: 10,
            borderRadius: 8,
            fontSize: 14,
            boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.2)",
            backgroundColor: line.includes("i++")
              ? "#DFF2BF"
              : line.includes("i<n")
              ? "#BDE0FE"
              : "#FFD3B6",
          },
        }));
  
        const newEdges = newOutput.slice(1).map((_, index) => ({
          id: `e${index}-${index + 1}`,
          source: `${index}`,
          target: `${index + 1}`,
          animated: true,
          style: { stroke: "#555", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
          },
        }));
  
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          newNodes,
          newEdges
        );
  
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error("Execution Error:", error);
      } finally {
        setLoader(false);
      }
    };
  
    fetchExecutionData();
  }, [execute, code]);

  return (
    <div className="container">
      <nav className="navbar">
        <a href="/" className="logo">
          <img src="logo.png" alt="CodeStream" />
        </a>
        <div className="nav-links">
          <a href="#">Explore</a>
          <a href="#">Problems</a>
          <a href="#" id="login">
            Sign in
          </a>
        </div>
      </nav>

      <div className="main-content">
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
            <button id="execute" onClick={handleExecute}>
              Execute
            </button>
            <button>Next</button>
            <button>Last</button>
          </div>
        </div>

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
                <Controls />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            )}
          </AnimatePresence>
        </div>

        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>
          Variable Space
        </div>
      </div>
    </div>
  );
};

export default App;