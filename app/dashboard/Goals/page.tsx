"use client"
import { useUser } from '@clerk/nextjs'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import { db } from 'utils/dbConfig'
import { Budgets, Goals, Incomes } from 'utils/schema'
import CreateGoals from './_components/CreateGoals'
import GoalsItem from './_components/GoalsItem'


function GoalsPage() {

  console.log("GOALS PAGE")
  const { user } = useUser();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [totalIncome, setTotalIncome] = useState([]);
  const [totalBudget, setTotalBudget] = useState([]);
  const [goalsList, setGoalsList] = useState([]);


  useEffect(() => {
    if (user) {
      getTotalBudget();
      getTotalIncome();
      getGoalsList();
    }
  }, [user]);


  const getTotalIncome = async () => {
    try {
      console.log("Fetching Total Income")

      const result = await db
        .select({
          totalIncome: sql`SUM(${Incomes.amount}::NUMERIC)`.mapWith(Number)
        })
        .from(Incomes)
        .where(
          sql`${eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
        EXTRACT (YEAR FROM ${Incomes.date}) = ${currentYear} AND
        EXTRACT (MONTH FROM ${Incomes.date}) = ${currentMonth}
        `
        ).groupBy(Incomes.createdBy);

      console.log("Total Income ", result);
      setTotalIncome(result);
    }
    catch (error) {
      console.log(error);
    }
  }

  const getTotalBudget = async () => {

    console.log("Start")
    try {
      console.log("Fetching Total Budget Allocation")

      const result = await db
        .select({

          totalBudget: sql`SUM(${Budgets.amount}::NUMERIC)`.mapWith(Number)
        })
        .from(Budgets)
        .where(
          sql`${eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
        EXTRACT (YEAR FROM ${Budgets.date}) = ${currentYear} AND
        EXTRACT (MONTH FROM ${Budgets.date}) = ${currentMonth}
        `
        ).groupBy(Budgets.createdBy);

      console.log("Total Budget Allocation : ", result);
      setTotalBudget(result);
    }
    catch (error) {
      console.error("Cant fetch  total budget ", error);
    }
  };

  const getGoalsList = async () => {
    console.log("Fetching Goals Information");

    try {
      const result = await db
        .select({
          ...getTableColumns(Goals)
        })
        .from(Goals)
        .where(
          sql`${eq(Goals.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
          EXTRACT (YEAR FROM ${Goals.date}) = ${currentYear} AND
          EXTRACT (MONTH FROM ${Goals.date}) = ${currentMonth}
        `
        ).groupBy(Goals.id);

      console.log("Fetching Goals Data", result);
      setGoalsList(result);
    }
    catch (error) {
      console.error(error);
    }
  }


  const remainingAmount = (totalIncome[0]?.totalIncome || 0) - (totalBudget[0]?.totalBudget || 0);
  console.log("remainingAmount:", remainingAmount);


  return (

    <div>
      <div className='p-10'>
        <h1 className="font-bold text-3xl">My Goals</h1>
      </div>
      <div>
        <h2>{remainingAmount}</h2>
      </div>



        {/* Show "Create New Budget" ONLY for the current month */}
        {/* {selectedYear === currentYear && selectedMonth === currentMonth && ( */}
        <CreateGoals refreshData={() => getGoalsList()} />
        {/* )} */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Render Budget Items */}
        {goalsList?.length > 0 ? (
          goalsList.map((goalsList) => (
            <GoalsItem key={goalsList.id} goalsList={goalsList} />
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 mt-4">
            Data not available
          </div>
        )}
      </div>
    </div>
  )
}

export default GoalsPage;
