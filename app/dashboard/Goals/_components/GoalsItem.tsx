"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "utils/dbConfig";
import { Expenses, Goals, Transactions } from "utils/schema";
import { eq, sql } from "drizzle-orm";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PartyPopper, Trash } from "lucide-react";

function GoalsItem({ refreshData, goalsList, remainingAmount }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const { user } = useUser();
    const completeByDate = new Date(goalsList.completeBy).toLocaleDateString();
    const [newAmount, setNewAmount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalAdded, setTotalAdded] = useState(0);
    const [isGoalAchieved, setIsGoalAchieved] = useState(false);

    useEffect(() => {
        getTransactions();
    }, []);

    const getTransactions = async () => {
        try {
            const result = await db
                .select()
                .from(Transactions)
                .where(eq(Transactions.goalId, goalsList.id))
                .orderBy(Transactions.date);

            setTransactions(result);

            const total = result.reduce(
                (sum, transaction) => sum + transaction.amountAdded,
                0
            );
            setTotalAdded(total);

            if (total >= goalsList.amount) {
                setIsGoalAchieved(true);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    const remainingAmount_ = goalsList.amount - totalAdded;

    const addNewTransaction = async (e) => {
        e.preventDefault();

        if (newAmount > remainingAmount) {
            toast.error("The amount you are trying to add exceeds the remaining amount.");
            return;
          }
          if (newAmount > remainingAmount_) {
            toast.error("The amount you are trying to add exceeds the Goal Limit.");
            return;
          }

        setIsLoading(true);
        try {
            const result = await db
                .insert(Transactions)
                .values({
                    goalId: goalsList.id,
                    amountAdded: newAmount,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    date: new Date(),
                })
                .returning();

            setTransactions([...transactions, result[0]]);
            const updatedTotal = totalAdded + newAmount;
            setTotalAdded(updatedTotal);
            setNewAmount(0);

            // Notify parent component about the new transaction
            // onTransactionAdded(newAmount);

            if (updatedTotal >= goalsList.amount && !isGoalAchieved) {
                setIsGoalAchieved(true);
                toast.success("Congratulations! You've achieved your goal! 🎉");
            } else {
                refreshData();
                toast("Amount Added!");
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
            toast("Failed to add amount. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteGoal = async (goalId) => {
        try {
          // Step 1: Delete all transactions associated with the goal
          const deleteTransactionsResult = await db
            .delete(Transactions)
            .where(eq(Transactions.goalId, goalId)) // Correct column reference
            .returning();
      
          console.log("Deleted Transactions:", deleteTransactionsResult);
      
          // Step 2: Delete the goal
          if (deleteTransactionsResult) {
            const deleteGoalResult = await db
              .delete(Goals)
              .where(eq(Goals.id, goalId)) // Correct column reference
              .returning();
      
            console.log("Deleted Goal:", deleteGoalResult);
          }

          toast("Goal and associated transactions deleted!");
          refreshData();
        } catch (error) {
          console.error("Error deleting goal:", error);
          toast("Failed to delete goal.");
        }
      };

    return (
        <div>
            <div className="mt-5">
                <div
                    className={`relative w-[350px] h-[300px] transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""
                        }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front Side */}
                    <Card
                        className={`absolute w-full h-full flex flex-col p-4 shadow-md rounded-2xl border hover:shadow-lg backface-hidden ${isFlipped ? "hidden" : ""
                            }`}
                    >
                        <div>
                            <div className="flex justify-between items-center">
                                <Badge
                                    className={`text-white px-3 py-1 rounded-md text-xs text-right ${goalsList.priority === "High"
                                        ? "bg-red-500"
                                        : goalsList.priority === "Medium"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                >
                                    {goalsList.priority}
                                </Badge>
                                <div className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger>
                                            <Trash className="text-red-600 cursor-pointer hover:scale-110 transition-transform" />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Are you absolutely sure?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete
                                                    your current goal record along with its savings.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    
                                                    onClick={() => {
                                                    deleteGoal(goalsList.id);
                                                    refreshData();
                                                }}>
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="text-2xl">{goalsList.icon}</span>
                                <div className="mt-2">
                                    <h3 className="text-lg font-semibold">{goalsList.name}</h3>
                                    <p className="text-gray-600 text-sm">₹{goalsList.amount}</p>
                                </div>
                            </div>
                        </div>

                        {/* <div>
                            <AlertDialog>
                                <AlertDialogTrigger>
                                        <Trash /> Delete
                                    
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone.
                                            This will permanently delete your current goal record along with its 
                                            savings.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteGoal()}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div> */}

                        {/* Goal Name & Amount */}
                        {/* <div className="mt-2 text-center">
                            <h3 className="text-lg font-semibold">{goalsList.name}</h3>
                            <p className="text-gray-600 text-sm">₹{goalsList.amount}</p>
                        </div> */}

                        {/* Progress Bar */}
                        <div className="w-full bg-fuchsia-200 h-2 rounded-full mt-5 mb-5">
                            <div
                                className="bg-fuchsia-800 h-2 rounded-full"
                                style={{
                                    width: `${(totalAdded / goalsList.amount) * 100}%`,
                                }}
                            ></div>
                            <div className="flex items-center justify-between mb-5 mt-2">
                                <h2 className="text-xs text-slate-500">₹{totalAdded} Added </h2>
                                <h2 className="text-xs text-slate-500">
                                    ₹{goalsList.amount - totalAdded} Remains
                                </h2>
                            </div>
                        </div>

                        {/* Add Money & Due Date */}
                        <div className="mt-4 flex flex-col">
                            <Button
                                variant="outline"
                                className="w-full"
                                // disabled={remainingAmount <= 0 || isGoalAchieved}
                            >
                                {isGoalAchieved ? ` Goal Achieved 🎉` : "Add Money"}
                            </Button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                🎯 Complete by: {completeByDate}
                            </p>
                        </div>

                    </Card>

                    {/* Back Side */}
                    <Card
                        className={`absolute w-full h-full flex flex-col p-4 shadow-md rounded-2xl border hover:shadow-lg backface-hidden transform rotate-y-180 ${isFlipped ? "" : "hidden"
                            }`}
                    >
                        <h3 className="text-lg font-semibold">Transactions</h3>
                        <div className="mt-2 flex-1 overflow-y-auto">
                            {transactions.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                        ₹{transaction.amountAdded} added on{" "}
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No transactions yet.</p>
                            )}
                        </div>

                        {/* Add Money Input */}
                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="number"
                                placeholder={`Max: ₹${remainingAmount}`}
                                value={newAmount}
                                onChange={(e) => setNewAmount(Number(e.target.value))}
                                className="w-full p-2 border rounded-md"
                                max={remainingAmount} // Restrict max input
                                onClick={(e) => e.stopPropagation()}
                                disabled={isGoalAchieved} // Disable input if goal is achieved
                            />
                            <Button
                                onClick={async (e) => {
                                    await addNewTransaction(e);
                                    refreshData();
                                }}
                                className="w-full mt-2"
                                // disabled={
                                //     newAmount <= 0 ||
                                //     newAmount > remainingAmount ||
                                //     isLoading ||
                                //     isGoalAchieved
                                // }
                            >
                                {isLoading ? "Adding..." : "Add Money"}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default GoalsItem;
