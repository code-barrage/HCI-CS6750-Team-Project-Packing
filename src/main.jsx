import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './PackLeader.jsx' // <-- This imports your file
import './index.css' // <-- This imports Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)