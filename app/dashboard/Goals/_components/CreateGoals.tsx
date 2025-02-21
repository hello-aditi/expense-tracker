"use client"
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
} from "@/components/ui/dialog";

import EmojiPicker from "emoji-picker-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from 'utils/dbConfig'
import { Budgets, Goals, Incomes } from 'utils/schema'
import { toast } from "sonner";




function CreateGoals({ refreshData }) {

  console.log("GOALS PAGE")
  const { user } = useUser();

  const [createGoal, setCreateGoal] = useState([]);
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState();
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("");
  const [error, setError] = useState("");

  const onCreateGoal = async () => {

    console.log("Inserting Data in Goals");

    try {
      const result = await db
        .insert(Goals)
        .values({
          name: name,
          amount: amount,
          date: new Date(),
          completeBy: new Date(date + "T00:00:00Z"),
          priority: priority,
          icon: emojiIcon,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }).returning({ insertedId: Goals.id });

      console.log(result);
      setCreateGoal(result);

      if (result) {
        refreshData()
        toast("New Goal Added !!")
        setName(" ")
        setAmount(" ")
        setDate(" ")
        setPriority(" ")
      }
    }

    catch (error) {
      console.error(error)
    }
  }



  return (
    <div>
      <div className="mt-3">
        <div>
          {/* Dialog for add goal button  */}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="top-2 right-5 shadow-lg text-lg font-bold text-white"
              >
                + Add Goal
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader className={undefined}>
                <DialogTitle>Enter your Goal</DialogTitle>
                <DialogDescription>Fill the details below to create a goal.</DialogDescription>
              </DialogHeader>

              {/* Emoji Picker */}
              <div className="mt-5">
                <Button variant="outline" size="lg" onClick={() => setOpenEmojiPicker(!openEmojiPicker)}>
                  {emojiIcon}
                </Button>
                {openEmojiPicker && (
                  <div className="absolute z-20">
                    <EmojiPicker
                      onEmojiClick={(e) => {
                        setEmojiIcon(e.emoji);
                        setOpenEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Goal Name */}
              <div className="mt-2">
                <h2 className="text-black font-medium my-1">Goal Name</h2>
                <Input placeholder="e.g. Phone" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Amount */}
              <div className="mt-1">
                <h2 className="text-black font-medium my-1">Enter Goal Amount</h2>
                <Input
                  type="number"
                  placeholder="e.g. 10,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>


              {/* Deadline Date */}
              <div className="mt-1">
                <h2 className="text-black font-medium my-1">Complete Goal By</h2>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              {/* Priority Dropdown */}
              <div className="mt-1">
                <h2 className="text-black font-medium my-1">Priority Level</h2>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Goal Button */}
              <DialogFooter className={undefined}>
                <DialogClose asChild>
                  <Button disabled={!(name && amount && date && priority)} onClick={onCreateGoal} className="mt-5">
                    Add Goal
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>


      </div>
    </div>
  )
}

export default CreateGoals

