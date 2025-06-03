import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] p-4">
    <div className="max-w-md w-full bg-navy-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-semibold text-white mb-4">Something went wrong</h2>
      <pre className="text-red-400 text-sm mb-6 overflow-auto max-h-40">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
)

// Performance monitoring
const reportError = (error) => {
  // You can integrate with error tracking services here
  console.error('Application error:', error)
}

// Root component to handle providers
const Root = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={reportError}
    >
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E293B',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

// Initialize the application
const initializeApp = () => {
  try {
    const root = createRoot(document.getElementById('root'))
    
    root.render(
      <StrictMode>
        <Root />
      </StrictMode>
    )
  } catch (error) {
    console.error('Failed to initialize application:', error)
    // Show a user-friendly error message
    document.getElementById('root').innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0A0F1C;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 20px;
        text-align: center;
      ">
        <div>
          <h1 style="font-size: 24px; margin-bottom: 16px;">Failed to load application</h1>
          <p style="color: #94A3B8; margin-bottom: 16px;">Please try refreshing the page or contact support if the problem persists.</p>
          <button
            onclick="window.location.reload()"
            style="
              background: #8B5CF6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
            "
          >
            Refresh Page
          </button>
        </div>
      </div>
    `
  }
}

// Start the application
initializeApp()
