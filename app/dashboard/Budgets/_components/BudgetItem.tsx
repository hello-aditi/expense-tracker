import Link from 'next/link'
import React from 'react'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


function BudgetItem({ budget }) {

    const calculateProgressPercent = () => {
        const percent = (budget.totalSpend / budget.amount) * 100;
        return percent.toFixed(2);
    }


    return (

        <div>
            <div className='p-5 rounded-lg hover:shadow-lg cursor-pointer h-[170px] bg-white border-2 border-fuchsia-800'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href={'/dashboard/Expenses/' + budget?.id}>
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
                                        <h2 className='text-xs text-slate-500'>₹{budget.totalSpend ? budget.totalSpend : 0} Spent </h2>
                                        <h2 className='text-xs text-slate-500'>₹{budget.amount - budget.totalSpend} Remains</h2>
                                    </div>
                                    <div className='w-full bg-fuchsia-300 h-2 rounded-full'>
                                        <div className=' bg-fuchsia-800 h-2 rounded-full'

                                            style={{
                                                width: `${calculateProgressPercent()}%`
                                            }}
                                        >

                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent {...({} as any)}>
                            <h3 className="text-sm text-white">Click to add Expenses</h3>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>

    )
}

export default BudgetItem