"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { db } from 'utils/dbConfig';
import { Transactions } from 'utils/schema';
import { eq } from 'drizzle-orm';

function GoalsItem({ goalsList }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const { user } = useUser();
    const completeByDate = new Date(goalsList.completeBy).toLocaleDateString();
    const [newAmount, setNewAmount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    // Fetch transactions when the component mounts
    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    // Fetch transactions for the goal
    const fetchTransactions = async () => {
        try {
            const result = await db
                .select()
                .from(Transactions)
                .where(eq(Transactions.goalId, goalsList.id));

            setTransactions(result.map(t => t.amountAdded)); // Update state with fetched transactions
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    // Add a new transaction
    const addNewTransaction = async (e) => {
        e.stopPropagation(); // Prevent the card flip
        console.log("Adding New Transaction !");

        if (newAmount > 0) {
            setIsLoading(true);
            try {
                const result = await db
                    .insert(Transactions)
                    .values({
                        goalId: goalsList.id,
                        amountAdded: newAmount,
                        createdBy: user?.primaryEmailAddress?.emailAddress,
                        date: new Date()
                    }).returning({ insertedId: Transactions.id });

                console.log("Transaction added:", result);
                setTransactions([...transactions, newAmount]); // Update state with the new transaction
                setNewAmount(0); // Reset input

                if (result) {
                    toast("Amount Added !");
                }
            } catch (error) {
                console.error("Error adding transaction:", error);
                toast("Failed to add amount. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div>
            <div className='mt-5'>
                <div
                    className={`relative w-[350px] h-[250px] transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    onClick={() => setIsFlipped(!isFlipped)} // Toggle flip on card click
                >
                    {/* Front Side of the Card */}
                    <Card
                        className={`absolute w-full h-full flex flex-col p-4 shadow-md rounded-2xl border hover:shadow-lg backface-hidden ${isFlipped ? 'hidden' : ''
                            }`}
                    >
                        {/* Top Section */}
                        <div className="flex justify-between items-center">
                            <span className="text-2xl">{goalsList.icon}</span>
                            <Badge
                                className={`text-white px-3 py-1 rounded-md ${goalsList.priority === "high"
                                    ? "bg-red-500"
                                    : goalsList.priority === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                    }`}
                            >
                                {goalsList.priority}
                            </Badge>
                        </div>

                        {/* Goal Name & Amount */}
                        <div className="mt-2">
                            <h3 className="text-lg font-semibold">{goalsList.name}</h3>
                            <p className="text-gray-600 text-sm">₹{goalsList.amount}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 mt-1">Progress: Pending</p>
                        </div>

                        {/* Add Money Button & Due Date */}
                        <div className="mt-4 flex flex-col">
                            <Button variant="outline" className="w-full">
                                Add Money
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                                🎯 Complete by: {completeByDate}
                            </p>
                        </div>
                    </Card>

                    {/* Back Side of the Card */}
                    <Card
                        className={`absolute w-full h-full flex flex-col p-4 shadow-md rounded-2xl border hover:shadow-lg backface-hidden transform rotate-y-180 ${isFlipped ? '' : 'hidden'
                            }`}
                    >
                        <h3 className="text-lg font-semibold">Transactions</h3>
                        <div className="mt-2 flex-1 overflow-y-auto">
                            {transactions.length > 0 ? (
                                transactions.map((amount, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                        ₹{amount} added
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
                                placeholder="Enter amount"
                                value={newAmount}
                                onChange={(e) => setNewAmount(Number(e.target.value))}
                                className="w-full p-2 border rounded-md"
                                onClick={(e) => e.stopPropagation()} // Prevent card flip
                            />
                            <Button
                                onClick={(e) => addNewTransaction(e)}
                                className="w-full mt-2"
                                disabled={newAmount <= 0 || isLoading}
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