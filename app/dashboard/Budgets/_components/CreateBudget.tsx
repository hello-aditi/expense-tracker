"use Client"
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import EmojiPicker from 'emoji-picker-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from 'utils/dbConfig'
import { Budgets, Incomes } from 'utils/schema'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { sql, eq } from 'drizzle-orm'



function CreateBudget({refreshData}) {

  const [emojiIcon, setEmojiIcon] = useState('🥰');
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [totalIncome, setTotalIncome] = useState({ totalIncome: 0 });
  const [totalBudget, setTotalBudget] = useState({ totalBudget: 0 });

  const [name,setName] = useState();
  const [amount, setAmount] = useState();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;


  const {user} = useUser();

  // Used To create New Budget 

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
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getTotalIncome();
      getTotalBudget();
    }
  }, [user]);

  const onCreateBudget = async() =>{

    const currentBudgetAmount = parseFloat(amount);
    const totalBudgetAllocation = totalBudget.totalBudget + currentBudgetAmount;

    const result = await db.insert(Budgets)
    .values({
      name: name,
      amount : amount,
      createdBy : user?.primaryEmailAddress?.emailAddress,
      icon: emojiIcon
    }).returning({insertedId:Budgets.id})

    if(result){
      refreshData()
      if (currentBudgetAmount > totalIncome.totalIncome || totalBudgetAllocation > totalIncome.totalIncome) {
        toast.warning("Your allocated budget exceeds your total income. Be mindful of your spending!");
      }
      toast("New Budget Created !!")
    }

  }

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
      } catch (error) {
        console.error("Cant fetch total budget ", error);
      }
    };


  return (
    <div>
       <Dialog>
        <DialogTrigger asChild>
          <div className='bg-white p-10 rounded-md items-center flex flex-col border-2 border-dashed
              cursor-pointer hover:shadow-md'>
                  <h2 className='text-3xl'>+</h2>
                  <h2>Create New Budget</h2>
            </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className={undefined}>
            <DialogTitle>Decide Your Budget</DialogTitle>
            <DialogDescription>
            Fill in the details below to create your budget.
            </DialogDescription>
          </DialogHeader>

          <div className='mt-5'>
                <Button variant='outline'
                size="lg"
                onClick = {()=>setOpenEmojiPicker(!openEmojiPicker)}
                >{emojiIcon}</Button>
                <div className='absolute z-20'>
                  <EmojiPicker 
                  open={openEmojiPicker}
                  onEmojiClick={(e)=>{
                    setEmojiIcon(e.emoji)
                    setOpenEmojiPicker(false)
                  }}
                  />
                </div>
                
                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Budget Name</h2>
                  <Input placeholder="e.g. Food"
                   onChange = {(e)=>setName(e.target.value)}
                  />
                </div>

                <div className='mt-2'>
                  <h2 className='text-black font-medium my-1'>Budget Amount</h2>
                  <Input placeholder="e.g. ₹1000" type='number'
                  onChange = {(e)=>setAmount(e.target.value)}
                  />
                </div>
                {amount && (parseFloat(amount) > totalIncome.totalIncome || (totalBudget.totalBudget + parseFloat(amount)) > totalIncome.totalIncome) && (
              <p className="text-red-500 text-sm mt-2">
                Your allocated budget exceeds your total income. Be mindful of your spending!
              </p>
            )}
                </div>

            <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
            <Button 
                disabled= {!(name&&amount)}
                onClick={()=>onCreateBudget()}
                className="mt-5">Create Budget
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CreateBudget