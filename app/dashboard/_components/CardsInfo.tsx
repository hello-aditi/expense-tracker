"use client"
import { Banknote, HandCoins, PiggyBank, ReceiptText, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { sql, eq } from "drizzle-orm";

import { db } from "utils/dbConfig";
import { Expenses, Transactions } from "utils/schema";
import { useUser } from "@clerk/nextjs";



function CardsInfo({ budgetList, incomeList, selectedMonth, selectedYear }) {
  const { user } = useUser();
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState({ addedTotalExpenses: 0 });
  const [totalTransactions, setTotalTransactions] = useState({ totalAmountAdded: 0 });

  useEffect(() => {
    if (budgetList?.length > 0) {
      const total = budgetList.reduce((sum, budget) => sum + budget.amount, 0);
      setTotalBudget(total);
    }

    if (incomeList?.length > 0) {
      const total = incomeList.reduce((sum, income) => sum + income.amount, 0);
      setTotalIncome(total);
    }
  }, [budgetList, incomeList]);

  const getTotalExpenses = async (month = selectedMonth, year = selectedYear) => {
    try {
      console.log("Fetching Total Expenses for:", month, year);
      const result = await db
        .select({
          addedTotalExpenses: sql`SUM(${Expenses.amount}::NUMERIC)`.mapWith(Number),
        })
        .from(Expenses)
        .where(
          sql`
            ${eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
            EXTRACT(YEAR FROM ${Expenses.date}) = ${year} AND
            EXTRACT(MONTH FROM ${Expenses.date}) = ${month}
          `
        )
        .groupBy(Expenses.createdBy);

      console.log("Total Expenses:", result);
      setTotalExpenses(result[0] || { addedTotalExpenses: 0 });
    } catch (error) {
      console.error("Can't fetch total Expenses:", error);
    }
  };

  const getTotalTransactions = async (month = selectedMonth, year = selectedYear) => {
    try {
      console.log("Fetching Total Transactions for:", month, year);
      const result = await db
        .select({
          totalAmountAdded: sql`SUM(${Transactions.amountAdded}::NUMERIC)`.mapWith(Number),
        })
        .from(Transactions)
        .where(
          sql`
            ${eq(Transactions.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
            EXTRACT(YEAR FROM ${Transactions.date}) = ${year} AND
            EXTRACT(MONTH FROM ${Transactions.date}) = ${month}
          `
        )
        .groupBy(Transactions.createdBy);

      console.log("Total Transactions:", result);
      setTotalTransactions(result[0] || { totalAmountAdded: 0 });
    } catch (error) {
      console.error("Can't fetch total Transactions:", error);
    }
  };

  useEffect(() => {
    getTotalExpenses(selectedMonth, selectedYear);
    getTotalTransactions(selectedMonth, selectedYear);
  }, [user, selectedMonth, selectedYear]);

  const totalUtilization = (totalExpenses?.addedTotalExpenses || 0) + (totalTransactions?.totalAmountAdded || 0);
  const remainingAmount = totalIncome - totalUtilization;
  const percentage = totalIncome > 0 ? (totalUtilization / totalIncome) * 100 : 0;

  return (
    <div>
      {budgetList?.length > 0 || incomeList?.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Income Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 flex justify-between items-center shadow-lg 
                rounded-xl text-black bg-white border-2 border-fuchsia-800">
                  <div>
                    <h2 className="text-sm">Total Income</h2>
                    <h2 className="font-bold text-2xl">₹ {totalIncome}</h2>
                  </div>
                  <HandCoins className="p-3 h-12 w-12 bg-black text-white rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent >
                <h3 className="text-sm">Total earnings for this month</h3>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Budget Allotted Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 flex justify-between items-center shadow-lg 
                rounded-xl text-black bg-white border-2 border-fuchsia-800">
                  <div>
                    <h2 className="text-sm">Budget Allotted</h2>
                    <h2 className="font-bold text-2xl">₹ {totalBudget}</h2>
                  </div>
                  <Wallet className="p-3 h-12 w-12 bg-black rounded-full text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h3 className="text-sm">Planned spending for different categories in this month</h3>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Amount Utilized Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 flex justify-between items-center shadow-lg 
                rounded-xl text-black bg-white border-2 border-fuchsia-800">
                  <div>
                    <h2 className="text-sm">Amount Utilized</h2>
                    <h2 className="font-bold text-2xl">₹ {totalUtilization}</h2>
                  </div>
                  <Banknote className="p-3 h-12 w-12 bg-black text-white rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h3 className="text-sm">Total expenses recorded</h3>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Remaining Balance Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 flex justify-between items-center shadow-lg 
                rounded-xl text-black bg-white border-2 border-fuchsia-800">
                  <div>
                    <h2 className="text-sm">Remaining Balance</h2>
                    <h2 className="font-bold text-2xl">₹ {remainingAmount}</h2>
                  </div>
                  <PiggyBank className="p-3 h-12 w-12 bg-black rounded-full text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h2 className="text-sm">Unspent income after expenses incurred</h2>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Goals Amount Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 flex justify-between items-center shadow-lg 
                rounded-xl text-black bg-white border-2 border-fuchsia-800">
                  <div>
                    <h2 className="text-sm">Goals Amount</h2>
                    <h2 className="font-bold text-2xl">₹ {totalTransactions.totalAmountAdded}</h2>
                  </div>
                  <Wallet className="p-3 h-12 w-12 bg-black text-white rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h2 className="text-sm">Unspent income after expenses incurred</h2>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Pie Chart */}
          <div className="fixed top-4 right-4">
            <div className="relative w-24 h-24">
              <div className="absolute w-full h-full rounded-full bg-gray-200"></div>
              <div
                className="absolute w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(#ff9898 ${percentage}%, #61f0c0 ${percentage}% 100%)`,
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs text-center">Money Utilized</p>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item, index) => (
            <div
              key={index}
              className="h-[120px] w-full bg-slate-200 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardsInfo;
