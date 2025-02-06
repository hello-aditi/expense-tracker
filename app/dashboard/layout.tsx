"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // ✅ Next.js navigation
import SideNav from './_components/sideNav';
// import DashboardHeader from './_components/dashboardHeader';
import DashboardPage from './dashboardpage';
import BudgetsPage from './Budgets/Budgetspage';
import { db } from '../../utils/dbConfig';
import { Budgets } from '../../utils/schema';
import { useUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';

function DashboardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [pageName, setPageName] = useState("Dashboard");

  useEffect(() => {
    if (pathname === "/dashboard") setPageName("Dashboard");
    else if (pathname === "/dashboard/budgets") setPageName("Budgets");
  }, [pathname]);

  const {user} = useUser();

  useEffect(()=>{
    user&&checkUserBudgets();
  },[user])

  const checkUserBudgets = async() =>{
    const result = await db.select()
    .from(Budgets)
    .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress ))

    console.log(result)

    // if(result?.length==0)
    // {
    //   router.replace('/dashboard/budgets')
    // } 
    // The entire page reloads automatically
  }


  return (
    <div className="flex">
      <SideNav setPageName={setPageName} />
      {/* <DashboardHeader /> */}
      <div className="flex-1 p-5">
        {pageName === "Dashboard" && <DashboardPage />}
        {pageName === "Budgets" && <BudgetsPage />}
      </div>
    </div>
  );
}

export default DashboardLayout;

// useState
// useRef