import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '../Apps/HomePage'
import CatProfile from '../Apps/CatProfile'
import DataAnalysis from '../Apps/DataAnalysis'
import React, { JSX } from 'react'
import Settings from '../Apps/Settings'
import Finance from '../Apps/Finance'


const AppRouter = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/cat-profile" element={<CatProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
        <Route path="/finance" element={<Finance />} />
      </Routes>
    </Router>
  )
}

export default AppRouter
