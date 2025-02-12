import { eq } from 'drizzle-orm'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { db } from 'utils/dbConfig'
import { Expenses } from 'utils/schema'
// import { format } from "date-fns";
import moment from "moment";

function ExpenseListTable({expensesList, refreshData}) {

      const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

    const deleteExpense = async (expense) =>{

        const result = await db.delete(Expenses)
        .where(eq(Expenses.id, expense.id))
        .returning();

        if (result){
            toast("Expense Deleted !");
            refreshData();
        }
    }

  return (
    <div className='mt-3'>
        <div className='grid grid-cols-4 bg-fuchsia-200 p-2 font-bold'>
            <h2>Name</h2>
            <h2>Amount</h2>
            <h2>Date</h2>
            <h2>Action</h2>
        </div>
        {expensesList.map((expenses)=>(
            <div key={expenses.id} className='grid grid-cols-4 bg-fuchsia-100 p-2'>
                <h2>{expenses.name}</h2>
                <h2>{expenses.amount}</h2>
                <h2>{moment(expenses.date).format("DD MMM YYYY")}</h2>
                <h2>
                    <Trash className='text-red-600 cursor-pointer'
                    onClick={()=>deleteExpense(expenses)}
                    />
                </h2>
            </div>
        ))}
    </div>
  )
}

export default ExpenseListTable