import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav } from './components/Nav'
import { ActivitiesPage } from './features/activities'
import { KnowledgePage } from './features/knowledge'

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/activities" replace />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
      </Routes>
    </>
  )
}

export default App
