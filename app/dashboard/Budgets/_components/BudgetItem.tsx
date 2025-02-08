import Link from 'next/link'
import React from 'react'

function BudgetItem({budget}) {

  return (
    <Link href={'/dashboard/Expenses/' + budget?.id} className='p-5 border rounded-lg hover:shadow-lg cursor-pointer'> 
        <div className='flex gap-2 items-center justify-between'>
            <div className='flex gap-2 items-center'>
                <h2 className='text-2xl p-3 px-4 bg-slate-100 rounded-full'>{budget?.icon}</h2>
                <div>
                    <h2 className='font-bold'>{budget.name}</h2>
                    <h2 className=' text-slate-500'>{budget.totalItem} Items</h2>
                </div>
            </div>
                <h2 className='font-bold text-fuchsia-800 text-lg'>₹{budget.amount}</h2>
        </div>
        <div className='mt-5'>
            <div className='flex items-center justify-between mb-3'>
                <h2 className='text-xs text-slate-500'>₹{budget.totalSpend?budget.totalSpend:0}</h2>
                <h2 className='text-xs text-slate-500'>₹{budget.amount - budget.totalSpend}</h2>
            </div>
            <div className='w-full bg-fuchsia-200 h-2 rounded-full'>
                <div className='w-[80%] bg-fuchsia-800 h-2 rounded-full'>

                </div>

            </div>
        </div>
    </Link>
  )
}

export default BudgetItem