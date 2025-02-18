"use client"
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
import React, { useEffect, useState } from 'react'
import { db } from 'utils/dbConfig'
import { Budgets, Goals, Incomes } from 'utils/schema'




function CreateGoals({ totalIncome, totalBudget, remainingAmount }) {

  console.log("GOALS PAGE")
  const { user } = useUser();

  const [createGoal, setCreateGoal] = useState([]);
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
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
          date: new Date(), // Ensure the date column is populated
          completeBy: new Date(date + "T00:00:00Z"),
          priority: priority,
          icon: emojiIcon,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }).returning({ insertedId: Goals.id });

      console.log(result);
      setCreateGoal(result);
    }

    catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div>
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
                  onChange={(e) => setAmount(e.target.value) }  
                />
              </div>

              {/* <div className="mt-1">
                <h2 className="text-black font-medium my-1">Enter Amount</h2>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  value={currentAmount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > remainingAmount) {
                      setError(`Amount cannot exceed ${remainingAmount}`);
                    } else {
                      setError("");
                      setcurrentAmount(value);
                    }
                  }}
                  max={remainingAmount}
                />
                {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
              </div> */}

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
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
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


// function CreateGoals() {


//   const { user } = useUser();
//   const [totalIncome, setTotalIncome] = useState(0);
//   const [allocatedBudget, setAllocatedBudget] = useState(0);
//   const [remainingSavings, setRemainingSavings] = useState(0);

//   // Goal State Variables
//   const [name, setName] = useState("");
//   const [amount, setAmount] = useState("");
//   const [date, setDate] = useState("");
//   const [priority, setPriority] = useState("");
//   const [emojiIcon, setEmojiIcon] = useState("😀");
//   const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

//   // Get current month & year
//   const getCurrentMonth = () => new Date().getMonth() + 1;
//   const getCurrentYear = () => new Date().getFullYear();

//   const getIncomeList = async () => {
//     try {
//       console.log("Fetching income...");
//       const result = await db
//         .select({ totalIncome: sql`COALESCE(SUM(amount), 0)`.mapWith(Number) })
//         .from(Incomes)
//         .where(
//           sql`
//             EXTRACT(MONTH FROM ${Incomes.date}::DATE) = ${getCurrentMonth()}
//             AND EXTRACT(YEAR FROM ${Incomes.date}::DATE) = ${getCurrentYear()}
//             AND ${Incomes.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
//           `
//         );

//       console.log("Income fetched:", result);
//       setTotalIncome(result[0]?.totalIncome || 0);
//     } catch (error) {
//       console.error("Error fetching income:", error);
//     }
//   };

//   const getBudgetList = async () => {
//     try {
//       console.log("Fetching budget...");
//       const result = await db
//         .select({
//           totalSpend: sql`COALESCE(SUM(${Expenses.amount}::NUMERIC), 0)`.mapWith(Number),
//         })
//         .from(Budgets)
//         .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
//         .where(
//           sql`
//             EXTRACT(MONTH FROM ${Budgets.date}::DATE) = ${getCurrentMonth()}
//             AND EXTRACT(YEAR FROM ${Budgets.date}::DATE) = ${getCurrentYear()}
//             AND ${Budgets.createdBy} = ${user?.primaryEmailAddress?.emailAddress}
//           `
//         );

//       console.log("Budget fetched:", result);
//       setAllocatedBudget(result[0]?.totalSpend || 0);
//     } catch (error) {
//       console.error("Error fetching budget:", error);
//     }
//   };

//   // Fetch Income & Budget Allocation on Component Mount
//   useEffect(() => {
//     async function fetchData() {
//       await getIncomeList();
//       await getBudgetList();
//     }
//     fetchData();
//   }, [user]); // Fetch when user data is available

//   // Update remaining savings after fetching data
//   useEffect(() => {
//     setRemainingSavings(totalIncome - allocatedBudget);
//   }, [totalIncome, allocatedBudget]);

//   // Handle Goal Creation
//   const onCreateGoal = async () => {
//     if (!name || !amount || !date || !priority) return;
//     console.log("Goal adding");

//     try {
//       await db.insert(Goals).values({
//           name,
//           amount,
//           date: new Date(), // Ensure the date column is populated
//           completeBy: new Date(date + "T00:00:00Z"),
//           priority,
//           icon: emojiIcon,
//           createdBy: user?.primaryEmailAddress?.emailAddress,

//       });

//       console.log("Inserting:", { name, amount, completeBy: new Date(date + "T00:00:00Z"), priority, icon: emojiIcon, createdBy: user?.primaryEmailAddress?.emailAddress });


//       console.log("goal added");
//       // Reset form fields
//       setName("");
//       setAmount("");
//       setDate("");
//       setPriority("");
//     } catch (error) {
//       console.error("Error adding goal:", error);
//     }
//   };

//   return (
//     <div>
//       {/* Remaining Savings Banner */}
//       <div className="absolute top-2 right-5 bg-[#86198f] text-white p-4 rounded-lg shadow-lg text-lg font-bold">
//         Remaining Amount: ₹{remainingSavings}
//       </div>

//       {/* Add Goal Button */}
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button
//             className="top-2 right-5 shadow-lg text-lg font-bold text-white"
//             disabled={remainingSavings <= 0}
//           >
//             + Add Goal
//           </Button>
//         </DialogTrigger>

//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter your Goal</DialogTitle>
//             <DialogDescription>Fill the details below to create a goal.</DialogDescription>
//           </DialogHeader>

//           {/* Emoji Picker */}
//           <div className="mt-5">
//             <Button variant="outline" size="lg" onClick={() => setOpenEmojiPicker(!openEmojiPicker)}>
//               {emojiIcon}
//             </Button>
//             {openEmojiPicker && (
//               <div className="absolute z-20">
//                 <EmojiPicker
//                   onEmojiClick={(e) => {
//                     setEmojiIcon(e.emoji);
//                     setOpenEmojiPicker(false);
//                   }}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Goal Name */}
//           <div className="mt-2">
//             <h2 className="text-black font-medium my-1">Goal Name</h2>
//             <Input placeholder="e.g. Laptop" value={name} onChange={(e) => setName(e.target.value)} />
//           </div>

//           {/* Amount */}
//           <div className="mt-1">
//             <h2 className="text-black font-medium my-1">Enter Amount</h2>
//             <Input
//               type="number"
//               placeholder="e.g. 3500"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               max={remainingSavings}
//             />
//           </div>

//           {/* Deadline Date */}
//           <div className="mt-1">
//             <h2 className="text-black font-medium my-1">Complete By</h2>
//             <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
//           </div>

//           {/* Priority Dropdown */}
//           <div className="mt-1">
//             <h2 className="text-black font-medium my-1">Priority Level</h2>
//             <Select value={priority} onValueChange={setPriority}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select priority" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="high">High</SelectItem>
//                 <SelectItem value="medium">Medium</SelectItem>
//                 <SelectItem value="low">Low</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Add Goal Button */}
//           <DialogFooter>
//             <DialogClose asChild>
//               <Button disabled={!(name && amount && date && priority)} onClick={onCreateGoal} className="mt-5">
//                 Add Goal
//               </Button>
//             </DialogClose>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <div>
//             <GoalsList />
//       </div>
//     </div>

//   );
// }

// export default CreateGoals;