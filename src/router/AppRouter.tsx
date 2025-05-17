import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '../Apps/HomePage'
import CatProfile from '../Apps/CatProfile'
import ReminderSettings from '../Apps/ReminderSettings'
import DataAnalysis from '../Apps/DataAnalysis'
import React, { JSX } from 'react'


const AppRouter = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/cat-profile" element={<CatProfile />} />
        <Route path="/reminder-settings" element={<ReminderSettings />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
      </Routes>
    </Router>
  )
}

export default AppRouter
