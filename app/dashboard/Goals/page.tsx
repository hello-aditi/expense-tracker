"use client";
import { useUser } from '@clerk/nextjs';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import { db } from 'utils/dbConfig';
import { Budgets, Expenses, Goals, Incomes, Transactions } from 'utils/schema';
import CreateGoals from './_components/CreateGoals';
import GoalsItem from './_components/GoalsItem';
import { toast } from 'sonner';
// import React from 'react';

function GoalsPage() {
  console.log("GOALS PAGE");
  const { user } = useUser();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [totalIncome, setTotalIncome] = useState({ totalIncome: 0 });
  const [totalBudget, setTotalBudget] = useState({ totalBudget: 0 });
  const [goalsList, setGoalsList] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState({ totalAmountAdded: 0 });
  const [totalExpenses, setTotalExpenses] = useState({ addedTotalExpenses: 0 });

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedPriority, setSelectedPriority] = useState("All"); // Priority filter
  const [selectedStatus, setSelectedStatus] = useState("All"); // Status filter

  useEffect(() => {
    if (user) {
      getTotalBudget();
      getTotalIncome();
      getGoalsList();
      getTotalTransactions();
      getTotalExpenses();
    }
  }, [user, selectedYear, selectedMonth, selectedPriority, selectedStatus]);

  useEffect(() => {
    const remainingAmount_ =
      (totalIncome?.totalIncome || 0) -
      (totalExpenses?.addedTotalExpenses || 0) -
      (totalTransactions?.totalAmountAdded || 0);

    setRemainingAmount(remainingAmount_);
  }, [totalIncome.totalIncome, totalExpenses.addedTotalExpenses, totalTransactions.totalAmountAdded])

  const getTotalIncome = async () => {
    try {
      console.log("Fetching Total Income");

      const result = await db
        .select({
          totalIncome: sql`SUM(${Incomes.amount}::NUMERIC)`.mapWith(Number),
        })
        .from(Incomes)
        .where(
          sql`${eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
        EXTRACT (YEAR FROM ${Incomes.date}) = ${currentYear} AND
        EXTRACT (MONTH FROM ${Incomes.date}) = ${currentMonth}
        `
        )
        .groupBy(Incomes.createdBy);

      console.log("Total Income ", result);

      setTotalIncome(result[0] || { totalIncome: 0 });
      // updateRemainingAmount(result[0]?.totalIncome || 0, totalBudget[0]?.totalBudget || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalBudget = async () => {
    console.log("Start");
    try {
      console.log("Fetching Total Budget Allocation");

      const result = await db
        .select({
          totalBudget: sql`SUM(${Budgets.amount}::NUMERIC)`.mapWith(Number),
        })
        .from(Budgets)
        .where(
          sql`${eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
        EXTRACT (YEAR FROM ${Budgets.date}) = ${currentYear} AND
        EXTRACT (MONTH FROM ${Budgets.date}) = ${currentMonth}
        `
        )
        .groupBy(Budgets.createdBy);

      console.log("Total Budget Allocation : ", result);
      setTotalBudget(result[0] || { totalBudget: 0 });
      // updateRemainingAmount(totalIncome[0]?.totalIncome || 0, result[0]?.totalBudget || 0);
    } catch (error) {
      console.error("Cant fetch total budget ", error);
    }
  };

  const getGoalsList = async () => {
    console.log("Fetching Goals Information");

    try {
      const result = await db
        .select({
          ...getTableColumns(Goals),
        })
        .from(Goals)
        .where(
          sql`${eq(Goals.createdBy, user?.primaryEmailAddress?.emailAddress)} AND
          EXTRACT (YEAR FROM ${Goals.date}) = ${currentYear} AND
          EXTRACT (MONTH FROM ${Goals.date}) = ${currentMonth} AND
          (${selectedPriority} = 'All' OR ${Goals.priority} = ${selectedPriority})
        `
        )
        .groupBy(Goals.id);

      console.log("Fetching Goals Data", result);
      setGoalsList(result);
    } catch (error) {
      console.error(error);
    }
  };

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



  const calculateStatus = (goal) => {
    const currentDate = new Date();
    const completeByStatus = new Date(goal.completeBy);

    if (currentDate > completeByStatus) {
      return 'Expired';
    }
    if (totalTransactions.totalAmountAdded >= goal.amount) {
      return "Achieved";
    }
    return "Active";
  };

  const goalListStatus = goalsList.map((goal) => ({
    ...goal,
    status: calculateStatus(goal)
  }));


  const filteredGoalsList = goalListStatus.filter((goal) => {
    const matchesPriority =
      selectedPriority === "All" || goal.priority === selectedPriority;

    const matchesStatus =
      selectedStatus === "All" || goal.status === selectedStatus;

    return matchesPriority && matchesStatus;
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isMonthDisabled = (monthIndex) => {
    if (selectedYear === currentYear) {
      // Disable months greater than the current month for the current year
      return monthIndex > currentMonth;
    }
    return false; // Enable all months for past years
  };



  return (
    <div className='p-10'>
      <div className='flex justify-between'>
        <h1 className="font-bold text-3xl">My Goals</h1>
        <div className='bg-slate-100 p-5 rounded-md items-center border-2 border-dashed
               hover:shadow-md text-right'>
          <h2>Remaining Amount: ₹{remainingAmount}</h2>
        </div>
        {/* <button onClick={() => {
          getTotalIncome();
          getTotalBudget();
          getGoalsList();
          getTotalTransactions();
          getTotalExpenses();
        }}>
          Refresh Data
        </button> */}
      </div>

      <div className='flex justify-between'>
        <div className='flex space-x-4 mb-4'>
          <select
            className='border p-2 rounded-md'
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          {/* Month Filter  */}
          <select
            className='border p-2 rounded-md'
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((month, index) => {
              const monthIndex = index + 1; // Months are 1-indexed
              return (
                <option
                  key={monthIndex}
                  value={monthIndex}
                  disabled={isMonthDisabled(monthIndex)} // Disable future months
                >
                  {month}
                </option>
              );
            })}
          </select>

          <select
            className="border p-2 rounded-md"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            className="border p-2 rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Achieved">Achieved</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Show "Create New Budget" ONLY for the current month */}
        <CreateGoals refreshData={() => getGoalsList()} />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Render Budget Items */}
        {filteredGoalsList?.length > 0 ? (
          filteredGoalsList.map((goal) => (
            <GoalsItem
              refreshData={() => {
                getTotalIncome();
                getTotalBudget();
                getTotalTransactions();
                getTotalExpenses();
                getGoalsList()
              }}
              key={goal.id}
              goalsList={goal}
              // totalIncome ={totalIncome}
              // totalExpenses ={totalExpenses}
              // totalTransactions ={totalTransactions}
              remainingAmount ={remainingAmount}
              
              />
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 mt-4">
            Data not available
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalsPage;