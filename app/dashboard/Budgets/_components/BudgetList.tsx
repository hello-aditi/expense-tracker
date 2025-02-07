"use client";

import React, { useEffect, useState } from 'react'
import CreateBudget from './CreateBudget'
import { db } from 'utils/dbConfig'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import { Budgets, Expenses } from 'utils/schema'
import { useUser } from '@clerk/nextjs'
import BudgetItem from './BudgetItem';

function BudgetList() {

  const [budgetList, setBudgetList] = useState([]);

  const {user} = useUser();

  useEffect(() => {
    console.log("User data:", user);
    if (user && user.primaryEmailAddress?.emailAddress) {
      getBudgetList();
    }
  }, [user]);
  

  // USED TO GET BUDGET LIST 

  const getBudgetList = async () => {
    try {
      console.log("Fetching budget list..."); // Debugging log
  
      const result = await db.select({
        ...getTableColumns(Budgets),
        totalSpend: sql`SUM(${Expenses.amount}::NUMERIC)`.mapWith(Number),
        totalItem: sql`COUNT(${Expenses.id})`.mapWith(Number)
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .groupBy(Budgets.id);
  
      console.log("Expenses Schema:", Expenses); // Debugging log
      console.log("Budget List Result:", result); // Debugging log
      setBudgetList(result);

    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };
  


  return (
    <div className='mt-7'>
        <div className='grid grid-cols-1
        md:grid-cols-2 lg:grid-cols-3 gap-3'>
        <CreateBudget
        refreshData={()=>getBudgetList()}/>
        {budgetList?.length>0 ? budgetList.map((budget) => (
          <BudgetItem key={budget.id} budget={budget} />
        ))
        :[1,2,3,4,5,6].map((item,index)=>(
          <div key={index} className='w-full bg-slate-200 rounded-md h-[145px] animate-pulse'>
          </div>
        ))
        
      }
        </div>
    </div>
  )
}

export default BudgetList