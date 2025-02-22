"use client";

import { usePathname, useParams } from "next/navigation";
import SideNav from "./_components/sideNav";
import DashboardPage from "./dashboardpage";
import BudgetsPage from "./Budgets/Budgetspage";
import ExpensePage from "./Expenses/[id]/page";
import MyGoalsPage from "./Goals/page";
import IncomePage from "./Incomes/page";
import { useState } from "react";

function DashboardLayout() {
  const pathname = usePathname();
  const params = useParams();

  console.log("Current pathname:", pathname); 
  console.log("useParams Output (layout.tsx):", params); 

  const [isCollapsed, setIsCollapsed] = useState(false);

  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  console.log("✅ Extracted ID (layout):", id); 

  let pageContent = <div>Loading...</div>; 

  if (pathname === "/") {
    pageContent = <DashboardPage />;
  } else if (pathname === "/dashboard/budgets") {
    pageContent = <BudgetsPage />;
  } else if (pathname.startsWith("/dashboard/expenses/") && id) {
    console.log("matching path")
  } else if (pathname === "/dashboard") {
    pageContent = <DashboardPage />;
  } else if (pathname === "/dashboard/goals") {
    pageContent = <MyGoalsPage />;
  } else if (pathname === "/dashboard/incomes") {
    pageContent = <IncomePage />;
  }

  if (id) {
    console.log("✅ ExpensePage Rendering for ID:", id);
    pageContent = <ExpensePage params={{ id }} />;
  } else {
    console.warn("⚠️ ExpensePage ID not found");
  }

    console.log("✅ Extracted ID (layout):", id);
    console.log("Stopping here ? (layout) ")
  
  return (
    <div className="flex">
      <SideNav setPageName={undefined} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div 
      className={`flex-1 p-5 ml-[200px] transition-all
      ${isCollapsed ? "ml-[80px]" : "ml-[200px]"}
      `}>
        
        {pageContent}
      </div>
    </div>
  );
}

export default DashboardLayout;