import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
// Import bundled CSS
import '@calendar-from-cli/ui-components'
import { setPageIcon, setPageTitle } from './browser-api/dom.ts'
import { getConfig } from './config/config.ts'
import { RenderingErrorBoundary } from './error-handling/RenderingErrorBoundary.tsx'
import { ErrorBoundary } from 'react-error-boundary'

;(function () {
  setPageTitle(getConfig().title)
  setPageIcon(getConfig().iconHref)

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary fallback={<RenderingErrorBoundary />}>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
})()
