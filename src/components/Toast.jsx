import React from 'react';

const Toast = ({ show, message, type }) => {
  if (!show) return null;

  return (
    <div 
      className={`toast ${type}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '4px',
        backgroundColor: type === 'error' ? '#ff4444' : '#4CAF50',
        color: 'white',
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      {message}
    </div>
  );
};

export default Toast; 