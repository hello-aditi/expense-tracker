import { Button } from '@/components/ui/button';
import { useParams } from "next/navigation";
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react'
import { db } from 'utils/dbConfig';
import { Budgets, Expenses, Incomes, Transactions } from 'utils/schema';
import { toast } from 'sonner'
import moment from 'moment';
import { date } from 'drizzle-orm/mysql-core';
import { eq, sql } from 'drizzle-orm';


function AddExpense({ user, refreshData }) {

  const params = useParams();
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [totalIncome, setTotalIncome] = useState({ totalIncome: 0 });
  const [totalExpenses, setTotalExpenses] = useState({ addedTotalExpenses: 0 });
  const [totalTransactions, setTotalTransactions] = useState({ totalAmountAdded: 0 });


  useEffect(() => {
    if (user) {
      getTotalIncome();
      getTotalTransactions();
      getTotalExpenses();
    }
  }, [user]);

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


  const addNewExpense = async () => {
    try {

      const newAmount = Number(amount);

      const remainingAmount =
        (totalIncome?.totalIncome || 0) -
        (totalExpenses?.addedTotalExpenses || 0) -
        (totalTransactions?.totalAmountAdded || 0);
      // Fetch current budget and total spent amount

      if (newAmount > remainingAmount) {
        toast.error("You don’t have enough income to make this expense. Adjust your income.");
        return;
      }

      const [budgetData] = await db
        .select({
          totalSpend: sql`COALESCE(SUM(${Expenses.amount}::NUMERIC), 0)`.mapWith(Number),
          budgetLimit: Budgets.amount,
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.id, params.id))
        .groupBy(Budgets.amount);

      if (!budgetData) {
        toast.error("Budget not found!");
        return;
      }

      const { totalSpend, budgetLimit } = budgetData;
      // const newAmount = Number(amount);

      // Check if the new expense exceeds the budget
      if (totalSpend + newAmount > budgetLimit) {
        toast.error("Your budget is already over for this month. Edit your budget to continue.");
        return;
      }

      // If within budget, insert the expense
      const result = await db.insert(Expenses).values({
        name,
        amount: newAmount,
        budgetId: params.id,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      if (result) {
        refreshData();
        toast.success("New Expense Added!");

        setName("");
        setAmount("");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Try again.");
    }
  };



  return (
    <div className='p-5 rounded-lg border-2 border-fuchsia-800 bg-white'>
      <h2 className='font-bold text-lg'>Add Expense</h2>
      <div className='mt-2'>
        <h2 className='text-black font-medium my-1'>Expense Name</h2>
        <Input placeholder="e.g. Pasta" value={name} className='border-2 border-fuchsia-800'
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className='mt-2'>
        <h2 className='text-black font-medium my-1'>Expense Amount</h2>
        <Input placeholder="e.g. 300" value={amount} className='border-2 border-fuchsia-800'
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button
        disabled={!(name && amount)}
        className='mt-3 w-full'
        onClick={() => addNewExpense()}
      >Add Expense</Button>
    </div>
  )
}

export default AddExpense