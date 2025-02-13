"use client";

import { usePathname, useParams } from "next/navigation";
import SideNav from "./_components/sideNav";
import DashboardPage from "./dashboardpage";
import BudgetsPage from "./Budgets/Budgetspage";
import ExpensePage from "./Expenses/[id]/page";

function DashboardLayout() {
  const pathname = usePathname();
  const params = useParams();

  console.log("🚀 Current pathname:", pathname); // ✅ Debugging
  console.log("🚀 useParams Output (layout.tsx):", params); // ✅ Debugging

  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  console.log("✅ Extracted ID (layout):", id); // ✅ Debugging

  let pageContent = <div>Loading...</div>; // Default to avoid empty page

  if (pathname === "/") {
    pageContent = <DashboardPage />;
  } else if (pathname === "/dashboard/budgets") {
    pageContent = <BudgetsPage />;
  } else if (pathname.startsWith("/dashboard/expenses/") && id) {
    console.log("matching path")
  } else if (pathname === "/dashboard") {
    pageContent = <DashboardPage />;
  }

  if (id) {
    console.log("✅ ExpensePage Rendering for ID:", id);
    pageContent = <ExpensePage params={{ id }} />;
  } else {
    console.warn("⚠️ ExpensePage ID not found");
  }

    console.log("✅ Extracted ID (layout):", id); // ✅ Debugging
    console.log("Stopping here ? (layout) ")
  
  return (
    <div className="flex">
      <SideNav setPageName={undefined} />
      <div className="flex-1 p-5">{pageContent}</div>
    </div>
  );
}

export default DashboardLayout;


