import React from 'react';

const VariableSpace = ({ trace, currentStep, rightWidth = 33.3 }) => {
  return (
    <div
      className="section flex flex-col border border-slate-700/50 py-2 px-4 bg-[#0F172A]/80 backdrop-blur-md overflow-hidden rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
      id="variable-space"
      style={{ width: `${rightWidth}%`, backgroundColor: '#0F172A' }}
    >
      <div className="flex justify-between items-center py-2 px-2">
        <h2 className="text-lg font-semibold text-slate-300">Variable Space</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {trace && trace[currentStep] ? (
          Object.entries(trace[currentStep]).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-navy-900/60 shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all duration-200">
              <div className="text-sm font-medium text-slate-400 mb-1">{key}</div>
              <pre className="text-sm text-slate-300 font-mono bg-[#0F172A]/50 p-2 rounded shadow-inner">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))
        ) : (
          <div className="text-slate-400 text-center py-8">No variables to display</div>
        )}
      </div>
    </div>
  );
};

export default VariableSpace;