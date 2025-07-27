import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import ClickSpark from './components/ClickSpark.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <App />
    </ClickSpark>
    <Toaster />
  </StrictMode>,
)
