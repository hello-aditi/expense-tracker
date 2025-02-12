"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { getTableColumns, sql, eq } from "drizzle-orm";
import { db } from "utils/dbConfig";
import { Budgets, Expenses } from "utils/schema";
import CardsInfo from "./_components/CardsInfo";
import BarChartDashboard from "./_components/BarChartDashboard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);

  useEffect(() => {
    console.log("User data:", user);
    if (user && user.primaryEmailAddress?.emailAddress) {
      getBudgetList();
    }
  }, [user]);

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
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .groupBy(Budgets.id);

      console.log("Budget List Result:", result);
      setBudgetList(result);
    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };

  return (
    <div>
      {budgetList?.length > 0 ? (
        <div className="p-5">
          <div>
            <h2 className="font-bold text-3xl">Hello, {user?.fullName}</h2>
            <p className="text-gray-500">
              Where's your money going? Let's have a look...
            </p>
          </div>

          <CardsInfo budgetList={budgetList} />

          <div className="grid grid-cols-2 md:grid-cols-2 mt-6">
            <div className="md:col-span-4">
              <BarChartDashboard budgetList={budgetList} />
            </div>
            <div>Other Content</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col mt-10 p-5">
          <h2 className="font-bold text-3xl">Hello, {user?.fullName}</h2>
          <h2 className="text-xl font-bold text-gray-600">No budget data found</h2>
          <p className="text-gray-500">Start by adding your first budget below.</p>
          <Button onClick={() => router.push("/dashboard/budgets")}>
            Add Budget
          </Button>
        </div>
      )}
    </div>
  );
}
