"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // ✅ Next.js navigation
import SideNav from './_components/sideNav';
import DashboardPage from './dashboardpage';
import BudgetsPage from './Budgetspage';

function DashboardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [pageName, setPageName] = useState("Dashboard");

  useEffect(() => {
    if (pathname === "/dashboard") setPageName("Dashboard");
    else if (pathname === "/dashboard/budgets") setPageName("Budgets");
  }, [pathname]);

  return (
    <div className="flex">
      <SideNav setPageName={setPageName} />
      <div className="flex-1 p-5">
        {pageName === "Dashboard" && <DashboardPage />}
        {pageName === "Budgets" && <BudgetsPage />}
      </div>
    </div>
  );
}

export default DashboardLayout;
