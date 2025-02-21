"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { getTableColumns, sql, eq } from "drizzle-orm";
import { db } from "utils/dbConfig";
import { Budgets, Expenses, Incomes } from "utils/schema";
import CardsInfo from "./_components/CardsInfo";
import BarChartDashboard from "./_components/BarChartDashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      getBudgetList();
      getIncomeList();
    }
  }, [user]);


  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      checkIfNewUser();
    }
  }, [user]);

  const checkIfNewUser = async () => {
    try {
      const previousBudgets = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .limit(1); // Only check if at least one budget exists

      setIsNewUser(previousBudgets.length === 0);
    } catch (error) {
      console.error("Error checking user budget history:", error);
    }
  };

  const getCurrentMonth = () => new Date().getMonth() + 1;
  const getCurrentYear = () => new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    getBudgetList(selectedMonth, selectedYear);
    getIncomeList(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    const selectedM = parseInt(e.target.value);

    if (selectedYear === currentYear && selectedM > currentMonth) return;

    setSelectedMonth(selectedM);
  };

  const handleYearChange = (e) => {
    const selectedY = parseInt(e.target.value);

    if (selectedY > currentYear) return;

    setSelectedYear(selectedY);

    // Adjust month selection if needed
    if (selectedY === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  };

  const resetExpensesIfNewMonth = async () => {
    const lastBudgetEntry = await db
      .select()
      .from(Budgets)
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(sql`${Budgets.date} DESC`)
      .limit(1);

    if (lastBudgetEntry.length > 0) {
      const lastBudgetDate = new Date(lastBudgetEntry[0].date);
      const lastBudgetMonth = lastBudgetDate.getMonth() + 1;
      const lastBudgetYear = lastBudgetDate.getFullYear();

      if (lastBudgetMonth !== currentMonth || lastBudgetYear !== currentYear) {
        console.log("New month detected! Creating a new budget entry.");

        await db.insert(Budgets).values({
          createdBy: user?.primaryEmailAddress?.emailAddress,
          date: new Date(),
        });
      }
    } else {
      console.log("No budget found. Creating a new budget entry.");
      await db.insert(Budgets).values({
        createdBy: user?.primaryEmailAddress?.emailAddress,
        date: new Date(),
      });
    }
  };

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      resetExpensesIfNewMonth();
      getBudgetList(selectedMonth, selectedYear);
      getIncomeList(selectedMonth, selectedYear);
    }
  }, [user, selectedMonth, selectedYear]);

  const getBudgetList = async (month = getCurrentMonth(), year = getCurrentYear()) => {
    try {
      console.log("Fetching budget list for:", month, year);

      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalBudget: sql`SUM(${Budgets.amount}::NUMERIC)`.mapWith(Number),
          totalSpend: sql`COALESCE(SUM(${Expenses.amount}::NUMERIC), 0)`.mapWith(Number),
          totalItem: sql`COALESCE(COUNT(${Expenses.id}), 0)`.mapWith(Number)
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          sql`
            EXTRACT(MONTH FROM ${Budgets.date}::DATE) = ${month} 
            AND EXTRACT(YEAR FROM ${Budgets.date}::DATE) = ${year}
            AND ${Budgets.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
          `
        )
        .groupBy(Budgets.id);

      console.log("Budget List Result:", result);
      setBudgetList(result);
    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };

  const getIncomeList = async (month = getCurrentMonth(), year = getCurrentYear()) => {
    try {
      console.log("Fetching income for the month and year : ", month, year);

      const result = await db
        .select({
          totalIncome: sql`SUM(amount)`.as("totalIncome")
        })
        .from(Incomes)
        .where(
          sql`
          EXTRACT(MONTH FROM ${Incomes.date}::DATE) = ${month} AND
          EXTRACT(YEAR FROM ${Incomes.date}::DATE) = ${year} AND
          ${Incomes.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
        `
        )


      console.log("fetched incomes :", result);
      setIncomeList(result);
    }
    catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="p-5">
      <div>
        <h2 className="font-bold text-3xl">Hello, {user?.fullName}</h2>
        <p className="text-gray-500">Where's your money going? Let's have a look...</p>
      </div>

      {!isNewUser && (
        <div className="flex space-x-4 my-4">
          {/* Month Dropdown */}
          <select
            className="p-2 border rounded-lg bg-white"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {Array.from({ length: 12 }, (_, index) => {
              const isFuture = selectedYear === currentYear && index + 1 > currentMonth;
              return (
                <option key={index + 1} value={index + 1} disabled={isFuture}>
                  {new Date(0, index).toLocaleString("default", { month: "long" })}
                </option>
              );
            })}
          </select>

          {/* Year Dropdown */}
          <select
            className="p-2 border rounded-lg bg-white"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year} value={year} disabled={year > currentYear}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {budgetList?.length > 0 ? (
        <>
          <CardsInfo budgetList={budgetList} incomeList={incomeList} />
          
           {/* <FinancialSummary budgetList={budgetList} incomeList={incomeList}/> */}
          <div className="grid grid-cols-2 md:grid-cols-2 mt-6">
            <div className="md:col-span-4">
              <BarChartDashboard budgetList={budgetList} />
            </div>
            <div>Other Content</div>
          </div>
        </>
      ) : (
        <div className="flex flex-col mt-10 p-5">
          <h2 className="text-xl font-bold text-gray-600">No data found</h2>
          <p className="text-gray-500">
            {isNewUser
              ? "Start by adding your first budget below."
              : "No budget data found for the selected month and year."}
          </p>
          {isNewUser && (
            <Button className="w-28 p-5" onClick={() => router.push("/dashboard/budgets")}>Add Budget</Button>
          )}
        </div>
      )}

      
    </div>

  );
}
