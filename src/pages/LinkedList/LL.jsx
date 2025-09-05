import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import * as d3 from 'd3';
import { useCodeSharing } from '../../hooks/useCodeSharing';
import './LL.css';

const LL = () => {
  const [code, setCode] = useState(localStorage.getItem('code') || 'Write Your code here...');
  const [trace, setTrace] = useState([]);
  const [step, setStep] = useState(0);
  const [loader, setLoader] = useState(false);
  const editorRef = useRef(null);
  const svgRef = useRef(null);
  const { toast, handleShare } = useCodeSharing();

  const handleChange = (value) => {
    setCode(value);
  };

  const handleExecute = async () => {
    setLoader(true);
    localStorage.setItem('code', code);
    try {
      const response = await axios.post(
        'https://code-backend-89a2.onrender.com/debugger/LinkedList/main',
        { codeInput: code },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const traceVal = response.data.trace || [];
      setTrace(traceVal);
      setStep(0);
    } catch (error) {
      console.error('API call failed:', error);
      setTrace([]);
      setStep(0);
    }
    setLoader(false);
  };

  const handleShareClick = () => {
    handleShare(editorRef, svgRef);
  };

  // Step controls
  const handleFirst = () => setStep(0);
  const handlePrevious = () => setStep(s => Math.max(s - 1, 0));
  const handleNext = () => setStep(s => Math.min(s + 1, trace.length - 1));
  const handleLast = () => setStep(trace.length - 1);

  // Draw linked list whenever trace or step changes
  useEffect(() => {
    const current = trace[step] || {};
    drawGraph(current.list || [], current.pointer, current.visited || []);
  }, [trace, step]);

  function drawGraph(list, pointer, visitedArr) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 200;

    const nodeWidth = 60;
    const nodeHeight = 40;
    const spacing = 80;
    const startX = 50;
    const startY = height / 2 - nodeHeight / 2;

    // Determine visited nodes
    const visitedSet = new Set(
      visitedArr.map((v, i) => (v === 'V' ? list[i] : null)).filter(Boolean)
    );

    // Prepare data array
    const data = list.map((val, i) => ({
      id: val,
      x: startX + i * spacing,
      y: startY,
      isPointer: val === pointer,
      isVisited: visitedSet.has(val),
    }));

    // Define arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#333');

    // Draw links (arrows) between consecutive nodes
    data.forEach((d, i) => {
      if (i < data.length - 1) {
        svg.append('line')
          .attr('x1', d.x + nodeWidth)
          .attr('y1', d.y + nodeHeight / 2)
          .attr('x2', data[i + 1].x)
          .attr('y2', data[i + 1].y + nodeHeight / 2)
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrow)');
      }
    });

    // Draw node rectangles
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 6)
      .attr('fill', d => d.isPointer ? 'orange' : (d.isVisited ? 'lightgreen' : 'gray'))
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5);

    // Add text labels
    svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(d => d.id)
      .attr('x', d => d.x + nodeWidth / 2)
      .attr('y', d => d.y + nodeHeight / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-weight', 'bold');
  }

  const currentVisited = trace[step]?.visited || [];
  // For linked list, queue may not be used, but keep if backend supplies
  const currentQueue = trace[step]?.queue || [];
  const desc = trace[step]?.description || '';

  return (
    <div className="container" style={{ backgroundColor: '#f7f7f7', height: '100vh' }}>
      {toast.show && (
        <div
          className={`toast ${toast.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '4px',
            backgroundColor: toast.type === 'error' ? '#ff4444' : '#4CAF50',
            color: 'white',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          {toast.message}
        </div>
      )}
      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: '33.33%' }}>
          <div className="monaco-editor-toolbar">
            <button className="editor-button" onClick={handleShareClick}>
              {/* share icon */}
            </button>
            <button className="editor-button">Read Only</button>
            <button className="editor-button">Undo</button>
            <button className="editor-button" onClick={handleExecute}>Run</button>
            <button className="editor-button" onClick={handleNext}>Next</button>
            <button className="editor-button" onClick={handleLast}>Last</button>
          </div>

          <MonacoEditor
            language="javascript"
            value={code}
            onChange={handleChange}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              readOnly: false,
              fontSize: 14,
              wordWrap: 'on',
            }}
            onMount={editor => { editorRef.current = editor; }}
            className="editor"
          />

          <div className="buttons">
            <button className="back" onClick={handleFirst}>First</button>
            <button className="back" onClick={handlePrevious}>Prev</button>
            <button className="execute" onClick={handleExecute}>Run</button>
            <button className="forward" onClick={handleNext}>Next</button>
            <button className="forward" onClick={handleLast}>Last</button>
          </div>
        </div>

        <div className="resizer" />

        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: '66.66%', display: 'flex', flexDirection: 'column' }}>
          <div>{loader ? 'loading...' : 'loaded'}</div>

          {/* Visited nodes display */}
          <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
            <div>Visited:</div>
            {currentVisited.length > 0
              ? currentVisited.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: item === 'V' ? 'lightgreen' : '#ddd',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      color: '#333',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    {idx}
                  </div>
                ))
              : <span>no visited nodes</span>
            }
          </div>

          {/* Queue display (if any) */}
          <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
            {currentQueue.length > 0 && <div>Queue:</div>}
            {currentQueue.length > 0
              ? currentQueue.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: 'lightgreen',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      color: '#333',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    {idx}
                  </div>
                ))
              : null
            }
          </div>

          {/* Description and pointer display */}
          <div style={{ marginBottom: '8px' }}>
            <span>{desc}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span>Pointer: <strong>{trace[step]?.pointer ?? 'null'}</strong></span>
          </div>

          {/* SVG area */}
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <svg
              ref={svgRef}
              style={{ width: '100%', height: '100%', border: '1px solid #ccc', background: '#fafafa' }}
            />
          </div>
        </div>

        <div className="resizer" />
      </div>
    </div>
  );
};

export default LL;
