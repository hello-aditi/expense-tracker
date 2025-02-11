"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { db } from "utils/dbConfig";
import { Budgets, Expenses } from "utils/schema";
import { getTableColumns, sql, eq, desc } from "drizzle-orm";
import BudgetItem from "app/dashboard/Budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";

function ExpensePage() {
  const params = useParams();
  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState(null);

  const [expensesList, setExpensesList] = useState([]);

  // Ensure params.id is properly extracted
  const budgetId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  
  console.log("🚀 Extracted ID (ExpensePage):", budgetId);

  useEffect(() => {
    console.log("🟢 useEffect Triggered: ID:", budgetId, "User:", user);

    if (budgetId && user?.primaryEmailAddress?.emailAddress) {
      getBudgetInfo();
    } else {
      console.warn("⚠️ Skipping fetch: Missing ID or user email.");
    }

  }, [budgetId, user]);

  // To get all the budget Information 

  const getBudgetInfo = async () => {
    try {
      console.log("🔍 Fetching budget for ID:", budgetId);
      console.log("👤 User Email:", user?.primaryEmailAddress?.emailAddress);

      if (!budgetId || !user?.primaryEmailAddress?.emailAddress) {
        console.warn("🚨 Missing ID or user email, skipping fetch.");
        return;
      }

      const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`COALESCE(SUM(${Expenses.amount}::NUMERIC), 0)`.mapWith(Number),
        totalItem: sql`COUNT(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(
        sql`${Budgets.id} = ${budgetId} AND ${Budgets.createdBy} = ${user.primaryEmailAddress.emailAddress}`
      )
      .groupBy(Budgets.id);

      console.log("🟢 Query Result:", result);

      if (result.length === 0) {
        console.warn("⚠️ No data found for ID:", budgetId);
        setBudgetInfo(null);
        return;
      }

      setBudgetInfo(result[0]);

    } catch (error) {
      console.error("❌ Error fetching budget:", error);
    }

    getExpensesList();
  };

  // To know the latest expenses 

  const getExpensesList = async() => {
      const result = await db.select().from(Expenses)
      .where(eq(Expenses.budgetId, params.id))
      .orderBy(desc(Expenses.date));
      setExpensesList(result);
      console.log(result)
  }

  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl">My Expenses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-7">
        {budgetInfo ? (
          <>
            {/* <p className="text-green-600">✅ Data Loaded Successfully</p> */}
            <BudgetItem budget={budgetInfo} />
          </>
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse"></div>
        )}
        <AddExpense user={user} refreshData={()=>getBudgetInfo()}/>
      </div>

      <div className="mt-4">
        <h2 className="font bold text-lg">Latest Expenses</h2>
        <ExpenseListTable expensesList = {expensesList}/>
      </div>
    </div>
    
  );
}

export default ExpensePage;
