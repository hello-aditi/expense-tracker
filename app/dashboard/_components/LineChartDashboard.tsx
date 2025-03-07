import { sql, eq } from "drizzle-orm";
import React, { useState, useEffect } from "react";
import { db } from "utils/dbConfig";
import { Expenses, Transactions } from "utils/schema";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useUser } from "@clerk/nextjs";

const LineChartDashboard = ({ selectedMonth, selectedYear }) => {
  const [totalTransactions, setTotalTransactions] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      getTotalTransactions();
      getTotalExpenses();
    }
  }, [user, selectedMonth, selectedYear]);

  const getTotalTransactions = async () => {
    console.log("Fetching Transactions for Past Months");
    try {
      // Calculate the start date: 12 months before the selected month/year
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      startDate.setMonth(startDate.getMonth() - 11); // Go back 12 months

      const result = await db
        .select({
          month: sql`EXTRACT(MONTH FROM ${Transactions.date})`.mapWith(Number),
          year: sql`EXTRACT(YEAR FROM ${Transactions.date})`.mapWith(Number),
          totalAmountAdded: sql`SUM(${Transactions.amountAdded}::NUMERIC)`.mapWith(Number),
        })
        .from(Transactions)
        .where(
          sql`
            ${eq(Transactions.createdBy, user?.primaryEmailAddress?.emailAddress)} AND 
            ${Transactions.date} >= ${startDate.toISOString()} AND 
            ${Transactions.date} <= ${new Date(selectedYear, selectedMonth, 0).toISOString()}
          `
        )
        .groupBy(sql`EXTRACT(MONTH FROM ${Transactions.date}), EXTRACT(YEAR FROM ${Transactions.date})`)
        .orderBy(sql`EXTRACT(YEAR FROM ${Transactions.date}), EXTRACT(MONTH FROM ${Transactions.date})`);

      console.log("Transactions Data:", result);
      setTotalTransactions(result || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const getTotalExpenses = async () => {
    console.log("Fetching Expenses for Past Months");
    try {
      // Calculate the start date: 12 months before the selected month/year
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      startDate.setMonth(startDate.getMonth() - 11);

      const result = await db
        .select({
          month: sql`EXTRACT(MONTH FROM ${Expenses.date})`.mapWith(Number),
          year: sql`EXTRACT(YEAR FROM ${Expenses.date})`.mapWith(Number),
          addedTotalExpenses: sql`SUM(${Expenses.amount}::NUMERIC)`.mapWith(Number),
        })
        .from(Expenses)
        .where(
          sql`
            ${eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress)} AND 
            ${Expenses.date} >= ${startDate.toISOString()} AND 
            ${Expenses.date} <= ${new Date(selectedYear, selectedMonth, 0).toISOString()}
          `
        )
        .groupBy(sql`EXTRACT(MONTH FROM ${Expenses.date}), EXTRACT(YEAR FROM ${Expenses.date})`)
        .orderBy(sql`EXTRACT(YEAR FROM ${Expenses.date}), EXTRACT(MONTH FROM ${Expenses.date})`);

      console.log("Expenses Data:", result);
      setTotalExpenses(result || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Prepare data for the chart
  const data = [];
  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  startDate.setMonth(startDate.getMonth() - 11); // Start from 12 months back

  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const month = monthDate.getMonth() + 1;
    const year = monthDate.getFullYear();

    const transaction = totalTransactions.find(
      (t) => t.month === month && t.year === year
    ) || { totalAmountAdded: 0 };
    const expense = totalExpenses.find(
      (e) => e.month === month && e.year === year
    ) || { addedTotalExpenses: 0 };

    data.push({
      month: monthNames[month - 1] + " " + year,
      investments: transaction.totalAmountAdded,
      expenses: expense.addedTotalExpenses,
    });
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold">📉 Expenses: ₹{payload[0].value}</p>
          <p className="text-sm font-semibold">📈 Investments: ₹{payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-xl shadow-lg bg-white border-2 border-fuchsia-800">
      <h2 className="text-fuchsia-700 text-xl font-semibold mb-4">Monthly Financial Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip active={undefined} payload={undefined} />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#4b5563", fontSize: 14 }} />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 6, fill: "#ef4444" }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="investments"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 6, fill: "#10b981" }}
            name="Investments"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartDashboard;