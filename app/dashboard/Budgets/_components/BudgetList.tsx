"use client";

import React, { useEffect, useState } from "react";
import { db } from "utils/dbConfig";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "utils/schema";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "./BudgetItem";
import CreateBudget from "./CreateBudget";

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const { user } = useUser();

  // Get current date values
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // State for year and month filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  console.log("month now :" ,currentMonth);

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      getBudgetList();
    }
  }, [user, selectedYear, selectedMonth]); // Depend on filters

  // Fetch Budget List with filters
  const getBudgetList = async () => {
    try {
      console.log("Fetching budget list...");

      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`SUM(${Expenses.amount}::NUMERIC)`.mapWith(Number),
          totalItem: sql`COUNT(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          sql`${eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)} AND 
               EXTRACT(YEAR FROM ${Budgets.date}) = ${selectedYear} AND
               EXTRACT(MONTH FROM ${Budgets.date}) = ${selectedMonth}`
        )
        .groupBy(Budgets.id);

      setBudgetList(result);

    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="mt-7">
      <div className="flex space-x-4 mb-4">

        {/* Year filter */}
        <select
          className="border p-2 rounded-md"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[0,1,2,3,4,5].map((i)=>{
            const year = new Date().getFullYear() - i
            return(
              <option key = {year} value={year}>
                {year}
              </option>
            );
          })}
        </select>

        {/* Month filter */}
        <select
          className="border p-2 rounded-md"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {months.map((month,index)=>

            <option
            key={index}
            value={index + 1}
            disabled={selectedYear === currentYear && index + 1 > currentMonth}
            >
              {month}
            </option>
          )}
        </select>
      </div>

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Show "Create New Budget" ONLY for the current month */}
        {selectedYear === currentYear && selectedMonth === currentMonth && (
          <CreateBudget refreshData={() => getBudgetList()} />
        )}

        {/* Render Budget Items */}
        {budgetList?.length > 0 ? (
          budgetList.map((budget) => (
            <BudgetItem key={budget.id} budget={budget} />
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 mt-4">
            Data not available for{" "}
            {new Date(0, selectedMonth - 1).toLocaleString("en", {month: "long",
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetList;
