import React, { useRef, useState, useEffect } from 'react';
import MonacoEditor from "@monaco-editor/react";
import ExecutionControls from './ExecutionControls';
import { useCodeSharing } from '../../hooks/useCodeSharing';
import Toast from '../Toast';
import { motion } from 'framer-motion';
import "./VisualDebuggerBoiler.css";  // Import the existing CSS

const CodeEditor = ({ 
  code = '', 
  language = 'javascript', 
  onCodeChange = () => {}, 
  isReadOnly = false, 
  onEditorMount = () => {},
  onToggleReadOnly = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onCopy = () => {},
  onFullscreen = () => {},
  copied = false,
  fullscreen = false,
  // Execution Controls props
  handleFirst = () => {},
  handlePrev = () => {},
  handleNext = () => {},
  handleLast = () => {},
  handleExecute = () => {},
  toggleProcess = () => {},
  currentStep = 0,
  debuggedQueue = [],
  isRunning = false,
  location = { pathname: '' },
  isTransitioning = false,
  leftWidth = 33.33,  // Add default value for leftWidth
}) => {
  const editorRef = useRef(null);
  const { toast, handleShare } = useCodeSharing();

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editorRef.current.decorations = [];
    onEditorMount(editor);

    // Add id and name to the textarea element
    const textarea = editor.getContainerDomNode().querySelector('textarea');
    if (textarea) {
      textarea.id = 'monaco-editor-textarea';
      textarea.name = 'monaco-editor-textarea';
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      // Force Monaco Editor to re-layout when fullscreen state changes
      editorRef.current.layout();
    }
  }, [fullscreen]);

  return (
    <div
      className="section flex flex-col border border-slate-700/50 py-2 px-4 bg-[#0F172A]/80 backdrop-blur-md overflow-hidden rounded-xl transition-all duration-300 overflow-y-hidden"
      id="code-editor"
      style={{ width: `${leftWidth}%`, backgroundColor: '#0F172A' }}
    >
      <Toast {...toast} />
      <div className="flex justify-between items-center py-2 px-2">
        {/* Share Button */}
        <motion.button
          className="group relative w-8 h-8 flex justify-center items-center z-10 p-1.5 
            bg-navy-900/60 text-slate-400 border-2 border-slate-700/60 rounded-lg cursor-pointer 
            transition-all duration-200 
            hover:bg-purple-500/30 hover:border-purple-500/70 hover:text-purple-300"
          onClick={() => handleShare(editorRef, language)}
          title="Share"
          aria-label="Share"
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="flex items-center justify-center w-5 h-5"
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2">
              <title>Share Code</title>
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
            </svg>
          </motion.div>
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-700/80 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12">Share</span>
        </motion.button>

        {/* Toggle Readonly Button */}
        <motion.button
          className="group relative w-8 h-8 flex justify-center items-center z-10 p-1.5 
            bg-navy-900/60 text-slate-400 border-2 border-slate-700/60 rounded-lg cursor-pointer 
            transition-all duration-200 
            hover:bg-purple-500/30 hover:border-purple-500/70 hover:text-purple-300"
          onClick={onToggleReadOnly}
          title={isReadOnly ? "Unlock Editor" : "Lock Editor"}
          aria-label={isReadOnly ? "Unlock Editor" : "Lock Editor"}
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isReadOnly ? (
            <motion.div
              className="flex items-center justify-center w-5 h-5 text-current"
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-off">
                <title>Unlock Editor</title>
                <path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982"/>
                <path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353"/>
                <path d="m15 5 4 4"/><path d="m2 2 20 20"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center justify-center w-5 h-5 text-current"
              whileHover={{ rotate: -10 }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                <title>Lock Editor</title>
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                <path d="m15 5 4 4"/>
              </svg>
            </motion.div>
          )}
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-700/80 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12">{isReadOnly ? "Unlock" : "Lock"}</span>
        </motion.button>

        {/* Undo Button */}
        <motion.button
          className="group relative w-8 h-8 flex justify-center items-center z-10 p-1.5 
            bg-navy-900/60 text-slate-400 border-2 border-slate-700/60 rounded-lg cursor-pointer 
            transition-all duration-200 
            hover:bg-purple-500/30 hover:border-purple-500/70 hover:text-purple-300"
          onClick={onUndo}
          title="Undo"
          aria-label="Undo"
          whileHover={{ scale: 1.1, rotate: -5, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="flex items-center justify-center w-5 h-5"
            whileHover={{ translateX: -3 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo">
              <title>Undo</title>
              <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          </motion.div>
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-700/80 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12">Undo</span>
        </motion.button>

        {/* Redo Button */}
        <motion.button
          className="group relative w-8 h-8 flex justify-center items-center z-10 p-1.5 
            bg-navy-900/60 text-slate-400 border-2 border-slate-700/60 rounded-lg cursor-pointer 
            transition-all duration-200 
            hover:bg-purple-500/30 hover:border-purple-500/70 hover:text-purple-300"
          onClick={onRedo}
          title="Redo"
          aria-label="Redo"
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            className="flex items-center justify-center w-5 h-5"
            whileHover={{ translateX: 3 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-redo">
              <title>Redo</title>
              <path d="M21 7v6h6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
            </svg>
          </motion.div>
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-700/80 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12">Redo</span>
        </motion.button>

        {/* Copy Button */}
        <motion.button
          className="group relative w-8 h-8 flex justify-center items-center z-10 p-1.5 
            bg-navy-900/60 text-slate-400 border-2 border-slate-700/60 rounded-lg cursor-pointer 
            transition-all duration-200 
            hover:bg-purple-500/30 hover:border-purple-500/70 hover:text-purple-300"
          onClick={onCopy}
          title={copied ? "Copied!" : "Copy"}
          aria-label={copied ? "Copied!" : "Copy"}
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {copied ? (
            <motion.div className="flex items-center justify-center w-5 h-5" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-check scale-115">
                <title>Copied!</title>
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div className="flex items-center justify-center w-5 h-5" whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                <title>Copy Code</title>
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              </svg>
            </motion.div>
          )}
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-700/80 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12">{copied ? "Copied!" : "Copy"}</span>
        </motion.button>

        {/* Fullscreen Button */}
        <motion.button
          className="group relative w-8 h-8 flex justify-center items-center z-10 p-1.5 
            bg-navy-900/60 text-slate-400 border-2 border-slate-700/60 rounded-lg cursor-pointer 
            transition-all duration-200 
            hover:bg-purple-500/30 hover:border-purple-500/70 hover:text-purple-300"
          onClick={() => onFullscreen("code-editor")}
          title={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          aria-label={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {fullscreen ? (
            <motion.div className="flex items-center justify-center w-5 h-5" whileHover={{ rotate: 10 }} transition={{ duration: 0.3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize">
                <title>Exit Fullscreen</title>
                <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
              </svg>
            </motion.div>
          ) : (
            <motion.div className="flex items-center justify-center w-5 h-5" whileHover={{ rotate: -10 }} transition={{ duration: 0.3 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize">
                <title>Enter Fullscreen</title>
                <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            </motion.div>
          )}
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-700/80 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12">{fullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </motion.button>
      </div>

      {/* Wrapper div for MonacoEditor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          className="w-full h-full p-2.5 rounded-lg bg-[#0F172A]/90 backdrop-blur-sm shadow-inner"
          style={{ backgroundColor: '#0F172A' }}
          language={language}
          placeholder="Write your code here..."
          value={code}
          onChange={onCodeChange}
          id="monaco-code-editor"
          name="monaco-code-editor"
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
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' },
                { token: 'operator', foreground: 'D4D4D4' }
              ],
              colors: {
                "editor.background": "#0F172A",
                "editor.foreground": "#E2E8F0",
                "editor.lineHighlightBackground": "#1E293B",
                "editor.lineHighlightBorder": "transparent",
                "editor.selectionBackground": "#4F46E5",
                "editor.inactiveSelectionBackground": "#4F46E5",
                "editorCursor.foreground": "#E2E8F0",
                "editorWhitespace.foreground": "#475569",
                "editorIndentGuide.background": "#475569",
                "editorIndentGuide.activeBackground": "#64748B",
                "editorLineNumber.foreground": "#64748B",
                "editorLineNumber.activeForeground": "#E2E8F0",
                "editorGutter.background": "#0F172A"
              },
            });
            monaco.editor.setTheme("customTheme");
          }}
          onMount={(editor, monaco) => {
            handleEditorDidMount(editor);
            monaco.editor.setTheme("customTheme");
          }}
        />
      </div>
      {!code && (
        <div className="absolute top-16 left-16 font-mono text-sm text-slate-400/70">
          // Write your code here
        </div>
      )}
      <ExecutionControls
        onFirst={handleFirst}
        onPrev={handlePrev}
        onNext={handleNext}
        onLast={handleLast}
        onExecute={toggleProcess}
        currentStep={currentStep}
        debuggedQueue={debuggedQueue}
        isRunning={isRunning}
        isTransitioning={isTransitioning}
        location={location}
      />
    </div>
  );
};

export default CodeEditor; 