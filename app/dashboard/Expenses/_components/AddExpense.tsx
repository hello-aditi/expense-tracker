import { Input } from '@/components/ui/input';
import React, { useState } from 'react'

function AddExpense() {

  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  return (
    <div>
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
    </div>
  )
}

export default AddExpense