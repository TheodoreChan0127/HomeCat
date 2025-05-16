import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '../Apps/HomePage'
import CatProfile from '../Apps/CatProfile'
import DailyRecords from '../Apps/DailyRecords'
import ReminderSettings from '../Apps/ReminderSettings'
import DataAnalysis from '../Apps/DataAnalysis'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cat-profile" element={<CatProfile />} />
        <Route path="/daily-records" element={<DailyRecords />} />
        <Route path="/reminder-settings" element={<ReminderSettings />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
      </Routes>
    </Router>
  )
}

export default AppRouter