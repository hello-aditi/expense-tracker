import { Trash } from 'lucide-react'
import React from 'react'

function ExpenseListTable({expensesList}) {
  return (
    <div className='mt-3'>
        <div className='grid grid-cols-4 bg-fuchsia-200 p-2 font-bold'>
            <h2>Name</h2>
            <h2>Amount</h2>
            <h2>Date</h2>
            <h2>Action</h2>
        </div>
        {expensesList.map((expenses,index)=>(
            <div className='grid grid-cols-4 bg-fuchsia-100 p-2'>
                <h2>{expenses.name}</h2>
                <h2>{expenses.amount}</h2>
                <h2>{expenses.date}</h2>
                <h2>
                    <Trash className='text-red-600'/>
                </h2>
            </div>
        ))}
    </div>
  )
}

export default ExpenseListTable