"use client"

import { Button } from '@/components/ui/button'
import { PenBoxIcon } from 'lucide-react'
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
  
import { Input } from '@/components/ui/input'
import EmojiPicker from 'emoji-picker-react'
import { useUser } from '@clerk/nextjs'
import { db } from 'utils/dbConfig'
import { Budgets } from 'utils/schema'
import { date } from 'drizzle-orm/mysql-core'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner'


function EditBudget({budgetInfo, refreshData}) {

    const [emojiIcon, setEmojiIcon] = useState();
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  
    const [name,setName] = useState();
    const [amount, setAmount] = useState();
  
    const {user} = useUser();

    useEffect(()=>{
        if(budgetInfo){
            setEmojiIcon(budgetInfo?.icon);
            setAmount(budgetInfo?.amount);
            setName(budgetInfo?.name)
        }
    })

    const onUpdateBudget = async ()=>{
        const result = await db.update(Budgets).set({
            name: name,
            amount : amount,
            // icon : emojiIcon
        }).where(eq(Budgets.id, budgetInfo.id))
        .returning();

        if(result){
            refreshData();
            toast("Budget Updated !");
        }
        
    }

  return (
    <div>
        
        <Dialog>
            <DialogTrigger asChild>
                <Button className = 'gap-2'><PenBoxIcon /> Edit</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader className={undefined}>
                    <DialogTitle>Update Your Budget</DialogTitle>
                    <DialogDescription>
                        Update the details of your budget.
                    </DialogDescription>
                </DialogHeader>

            <div className='mt-5'>

                <Button 
                    variant='outline'
                    size="lg"
                    onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                 >
                    {emojiIcon}
                </Button>

                <div className='absolute z-20'>
                    <EmojiPicker 
                        open={openEmojiPicker}
                        onEmojiClick={(e) => {
                            if (!emojiIcon) {  // Prevent changing emoji if already set
                                setEmojiIcon(e.emoji);
                            }
                            setOpenEmojiPicker(false);
                        }}
                    />
                </div>

                    <div className='mt-2'>
                    <h2 className='text-black font-medium my-1'>Budget Name</h2>
                    <Input placeholder="e.g. Food"
                    defaultValue = {budgetInfo?.name}
                    onChange = {(e)=>setName(e.target.value)}
                    />
                    </div>

                    <div className='mt-2'>
                    <h2 className='text-black font-medium my-1'>Budget Amount</h2>
                    <Input placeholder="e.g. ₹1000" type='number'
                    defaultValue = {budgetInfo?.amount}
                    onChange = {(e)=>setAmount(e.target.value)}
                    />
                    </div>
                    </div>

                <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                <Button 
                    disabled= {!(name&&amount)}
                    onClick={()=>onUpdateBudget()}
                    className="mt-5">Update Budget
                </Button>
                </DialogClose>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default EditBudget