import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav } from './components/Nav'
import { ActivitiesPage } from './features/activities'
import { KnowledgePage } from './features/knowledge'
import { DraftsPage } from './features/drafts'
import { ReportsPage } from './features/reports'

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/activities" replace />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </>
  )
}

export default App
