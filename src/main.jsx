import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { ManifestationWizard } from './components/ManifestationWizard'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ManifestationWizard />
  </React.StrictMode>
)
