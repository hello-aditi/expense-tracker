import { Button } from '@/components/ui/button';
import { useParams } from "next/navigation";
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import { db } from 'utils/dbConfig';
import { Budgets, Expenses } from 'utils/schema';
import { toast } from 'sonner'
import moment from 'moment';

function AddExpense({user, refreshData}) {

  const params = useParams();
  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  const addNewExpense=async()=>{
    const result = await db.insert(Expenses).values({
      name: name,
      amount : amount,
      budgetId: params.id,
      createdAt :moment().format('')

    }).returning({insertedId : Budgets.id});

    console.log(result)

    if(result){
      refreshData()
      toast('New Expense Added !')
    }
  }

  return (
    <div className='border p-5 rounded-lg'>
      <h2 className='font-bold text-lg'>Add Expense</h2>
      <div className='mt-2'>
        <h2 className='text-black font-medium my-1'>Expense Name</h2>
          <Input placeholder="e.g. Pasta"
          onChange = {(e)=>setName(e.target.value)}
          />
      </div>

      <div className='mt-2'>
        <h2 className='text-black font-medium my-1'>Expense Amount</h2>
          <Input placeholder="e.g. 300"
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