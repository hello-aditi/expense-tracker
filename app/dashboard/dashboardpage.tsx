"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { getTableColumns, sql, eq } from "drizzle-orm";
import { db } from "utils/dbConfig";
import { Budgets, Expenses, Goals, Incomes, Transactions } from "utils/schema";
import CardsInfo from "./_components/CardsInfo";
import BarChartDashboard from "./_components/BarChartDashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LineChartDashboard from "./_components/LineChartDashboard";


export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);



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
    getRecentActivities();
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
          ...getTableColumns(Incomes), // Fetch all columns
        })
        .from(Incomes)
        .where(
          sql`
            EXTRACT(MONTH FROM ${Incomes.date}::DATE) = ${month} AND
            EXTRACT(YEAR FROM ${Incomes.date}::DATE) = ${year} AND
            ${Incomes.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
          `
        );

      console.log("Fetched incomes:", result);
      setIncomeList(result); // Set the array of income entries
    } catch (error) {
      console.error("Error fetching income list:", error);
    }
  };

  // New function to fetch recent expenses and goal transactions
  const getRecentActivities = async () => {
    // Fetch recent expenses
    const expensesResult = await db
      .select({
        date: Expenses.date,
        name: Expenses.name,
        type: sql`'Expense'`.mapWith(String),
        amount: Expenses.amount,
      })
      .from(Expenses)
      .where(
        sql`
          EXTRACT(MONTH FROM ${Expenses.date}::DATE) = ${selectedMonth} 
          AND EXTRACT(YEAR FROM ${Expenses.date}::DATE) = ${selectedYear}
          AND ${Expenses.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
        `
      );

    // Fetch recent goal transactions (join with Goals to get goal name)
    const goalTransactionsResult = await db
      .select({
        date: Transactions.date,
        name: Goals.name,
        type: sql`'Goal'`.mapWith(String),
        amount: Transactions.amountAdded,
      })
      .from(Transactions)
      .leftJoin(Goals, eq(Transactions.goalId, Goals.id))
      .where(
        sql`
          EXTRACT(MONTH FROM ${Transactions.date}::DATE) = ${selectedMonth} 
          AND EXTRACT(YEAR FROM ${Transactions.date}::DATE) = ${selectedYear}
          AND ${Transactions.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
        `
      );

    // Combine and sort by date (most recent first)
    const combinedActivities = [...expensesResult, ...goalTransactionsResult]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
    .slice(0, 5); // Limit to 5 recent entries

  setRecentActivities(combinedActivities);
};



  return (
    <div className="p-5">
      <div>
        <h2 className="font-bold text-3xl">Hello, <span className="text-fuchsia-800">{user?.fullName}</span></h2>
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

      {budgetList?.length > 0 || incomeList?.length > 0 ? (
        <>
          <CardsInfo budgetList={budgetList} incomeList={incomeList} selectedMonth={selectedMonth} selectedYear={selectedYear} />

          {/* <FinancialSummary budgetList={budgetList} incomeList={incomeList}/> */}
          <div className="flex mt-6 space-x-4">
            <div className="w-3/5">
              <BarChartDashboard budgetList={budgetList} />
            </div>
            <div className="w-2/5">
              <LineChartDashboard selectedMonth={selectedMonth} selectedYear={selectedYear} />
            </div>
          </div>

          {/* New Section: Recent Expenses and Goal Transactions */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-fuchsia-700 mb-4">Recent Activities</h3>
            {recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg rounded-lg border border-fuchsia-200">
                  <thead>
                    <tr className="bg-fuchsia-50">
                      <th className="p-3 text-left text-fuchsia-700 font-semibold">Date</th>
                      <th className="p-3 text-left text-fuchsia-700 font-semibold">Name</th>
                      <th className="p-3 text-left text-fuchsia-700 font-semibold">Type</th>
                      <th className="p-3 text-left text-fuchsia-700 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, index) => (
                      <tr key={index} className="border-b hover:bg-fuchsia-100">
                        <td className="p-3 text-gray-800">
                          {new Date(activity.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-gray-800">{activity.name}</td>
                        <td className="p-3 text-gray-800">{activity.type}</td>
                        <td className="p-3 text-gray-800">₹{activity.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No recent activities for this month.</p>
            )}
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
            <Button
              className="w-28 p-5"
              onClick={() => router.push("/dashboard/budgets")}
            >
              Add Budget
            </Button>
          )}
        </div>
      )}
    </div>
  );
}