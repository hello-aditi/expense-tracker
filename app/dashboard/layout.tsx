// app/(routes)/dashboard/layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from './_components/sideNav';
import DashboardHeader from './_components/dashboardHeader';

function layout() {
  return (
    <div>
      <SideNav />
      <Outlet />
      <DashboardHeader />
    </div>

  )
}

export default layout;