import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import  TestWorker from "./worker?worker&inline"
import "./router"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <button onClick={() => new TestWorker()}></button>
  </React.StrictMode>,
)
