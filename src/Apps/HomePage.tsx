import React, { JSX } from "react"
import DashboardLayout from "../components/dashboard"
import { ReminderTodoView } from '../components/ReminderTodoView';
import PageTitle from "../components/PageTitle";

function HomePage(): JSX.Element {
  return (
    <DashboardLayout>
      <div className="p-4">
        <PageTitle 
          title="首页" 
          subtitle="猫舍数据总览"
        />
        <ReminderTodoView />
      </div>
    </DashboardLayout>
  )
}

export default HomePage