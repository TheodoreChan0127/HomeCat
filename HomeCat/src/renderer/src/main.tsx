import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './Apps/HomePage'
import CatProfile from './Apps/CatProfile'
import DailyRecords from './Apps/DailyRecords'
import ReminderSettings from './Apps/ReminderSettings'
import DataAnalysis from './Apps/DataAnalysis'

// 配置路由
const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/cat-profile', element: <CatProfile /> },
  { path: '/daily-records', element: <DailyRecords /> },
  { path: '/reminder-settings', element: <ReminderSettings /> },
  { path: '/data-analysis', element: <DataAnalysis /> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
