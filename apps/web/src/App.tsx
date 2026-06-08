import { Routes, Route, Navigate } from 'react-router-dom'
import { ActivitiesPage } from './features/activities'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/activities" replace />} />
      <Route path="/activities" element={<ActivitiesPage />} />
    </Routes>
  )
}

export default App
