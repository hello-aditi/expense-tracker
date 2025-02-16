import { Button } from '@/components/ui/button';
import { useParams } from "next/navigation";
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import { db } from 'utils/dbConfig';
import { Budgets, Expenses } from 'utils/schema';
import { toast } from 'sonner'
import moment from 'moment';
import { date } from 'drizzle-orm/mysql-core';
import { eq, sql } from 'drizzle-orm';

function AddExpense({user, refreshData}) {

  const params = useParams();
  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  // const addNewExpense=async()=>{
  //   const result = await db.insert(Expenses).values({
  //     name: name,
  //     amount : amount,
  //     budgetId: params.id,
  //     createdBy : user?.primaryEmailAddress?.emailAddress

  //   }).returning({insertedId : Budgets.id});

  //   if ()

  //   console.log(result)

  //   if(result){
  //     refreshData()
  //     toast('New Expense Added !')
  //   }
  // }

  const addNewExpense = async () => {
    try {
      // Fetch current budget and total spent amount
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
      const newAmount = Number(amount);
  
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
    <div className='border p-5 rounded-lg'>
      <h2 className='font-bold text-lg'>Add Expense</h2>
      <div className='mt-2'>
        <h2 className='text-black font-medium my-1'>Expense Name</h2>
          <Input placeholder="e.g. Pasta" value={name}
          onChange = {(e)=>setName(e.target.value)}
          />
      </div>

      <div className='mt-2'>
        <h2 className='text-black font-medium my-1'>Expense Amount</h2>
          <Input placeholder="e.g. 300" value={amount}
          onChange = {(e)=>setAmount(e.target.value)}
          />
      </div>
      <Button 
      disabled={!(name&&amount)} 
      className='mt-3 w-full'
      onClick = {()=>addNewExpense()}
      >Add Expense</Button>
    </div>
  )
}

export default AddExpense