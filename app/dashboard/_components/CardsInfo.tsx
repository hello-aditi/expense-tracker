"use client"
import { PiggyBank, ReceiptText, Wallet } from "lucide-react";
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



function CardsInfo({ budgetList, incomeList }) {

  const {user} = useUser();
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState({ addedTotalExpenses: 0 });
  const [totalTransactions, setTotalTransactions] = useState({ totalAmountAdded: 0 });
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

    const getTotalTransactions = async () => {
    console.log("Start");
    try {
      console.log("Fetching Total Budget Allocation");

      const result = await db
        .select({
          totalAmountAdded: sql`SUM(${Transactions.amountAdded}::NUMERIC)`.mapWith(Number),
        })
        .from(Transactions)
        .where(
          sql`${eq(Transactions.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
        EXTRACT (YEAR FROM ${Transactions.date}) = ${currentYear} AND
        EXTRACT (MONTH FROM ${Transactions.date}) = ${currentMonth}
        `
        )
        .groupBy(Transactions.createdBy);

      console.log("Total Transactions : ", result);
      setTotalTransactions(result[0] || { totalAmountAdded: 0 });
      // updateRemainingAmount(totalIncome[0]?.totalIncome || 0, result[0]?.totalBudget || 0);
    } catch (error) {
      console.error("Cant fetch total Transactions ", error);
    }
  };

    const getTotalExpenses = async () => {
    console.log("Start Fetching Expenses");
    try {
      console.log("Fetching Total Expenses ");

      const result = await db
        .select({
          addedTotalExpenses: sql`SUM(${Expenses.amount}::NUMERIC)`.mapWith(Number),
        })
        .from(Expenses)
        .where(
          sql`${eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
        EXTRACT (YEAR FROM ${Expenses.date}) = ${currentYear} AND
        EXTRACT (MONTH FROM ${Expenses.date}) = ${currentMonth}
        `
        )
        .groupBy(Expenses.createdBy);

      console.log("Total Expenses : ", result);
      setTotalExpenses(result[0] || { addedTotalExpenses: 0 });
      // updateRemainingAmount(totalIncome[0]?.totalIncome || 0, result[0]?.totalBudget || 0);
    } catch (error) {
      console.error("Cant fetch total Expenses ", error);
    }
  };

  useEffect (()=>{
    getTotalExpenses();
    getTotalTransactions();
  },[user])

  const totalUtilization = totalExpenses?.addedTotalExpenses + totalTransactions?.totalAmountAdded

  const remainingAmount = incomeList?.totalIncome - totalUtilization


  // ✅ Utilization percentage calculation
  const utilization = totalIncome ? ((totalSpend / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div>
      {budgetList?.length > 0 || incomeList?.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Income Card */}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
                  <div>
                    <h2 className="text-sm">Total Income</h2>
                    <h2 className="font-bold text-2xl">{incomeList?.totalIncome}</h2>
                  </div>
                  <PiggyBank className="p-3 h-12 w-12 bg-green-400 rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h3 className="text-sm">Total earnings for this month</h3>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
                  <div>
                    <h2 className="text-sm">Budget Allotted</h2>
                    <h2 className="font-bold text-2xl">{budgetList?.totalBudget}</h2>
                  </div>
                  <Wallet className="p-3 h-12 w-12 bg-purple-400 rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h3 className="text-sm">Planned spending for different categories in this month</h3>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
                  <div>
                    <h2 className="text-sm">Amount Utilized</h2>
                    <h2 className="font-bold text-2xl">{totalUtilization}</h2>
                  </div>
                  <ReceiptText className="p-3 h-12 w-12 bg-red-400 rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h3 className="text-sm">Total expenses recorded</h3>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
                  <div>
                    <h2 className="text-sm">Remaining Balance</h2>
                    <h2 className="font-bold text-2xl">{remainingAmount}</h2>
                  </div>
                  <Wallet className="p-3 h-12 w-12 bg-blue-400 rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h2 className="text-sm">Unspent income after expenses incurred</h2>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
                  <div>
                    <h2 className="text-sm">Goals Amount</h2>
                    <h2 className="font-bold text-2xl">{totalTransactions.totalAmountAdded}</h2>
                  </div>
                  <Wallet className="p-3 h-12 w-12 bg-blue-400 rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <h2 className="text-sm">Unspent income after expenses incurred</h2>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>




          {/* Utilization Percentage (Top Right Corner) */}
          <div className="absolute top-2 right-5">
            <h2 className="text-sm text-gray-500">Utilization</h2>
            <h2 className="font-bold text-lg text-red-500">{utilization}%</h2>
          </div>

        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item, index) => (
            <div
              key={index}
              className="h-[120px] w-full bg-slate-200 animate-pulse rounded-lg">
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default CardsInfo;
