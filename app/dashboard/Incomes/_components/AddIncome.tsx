"use client"
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { db } from 'utils/dbConfig'
import { Incomes } from 'utils/schema'
import { and, eq, sql, desc } from 'drizzle-orm'

import { useUser } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import IncomeListTable from './IncomeListTable'
import { toast } from 'sonner'

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

function AddIncome() {

    const { user } = useUser();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);
    const [incomeList, setIncomeList] = useState([]);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentYear);


    const fetchTotalIncome = async () => {
        try {

            const result = await db
                .select({ sum: sql`SUM(amount)`.mapWith(Number) })
                .from(Incomes)
                .where(
                    and(
                        eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress),
                        sql`EXTRACT(YEAR FROM "date") = ${currentYear}`,
                        sql`EXTRACT(MONTH FROM "date") = ${currentMonth}`
                    )
                );

            setTotalIncome(result?.[0]?.sum || 0);
        } catch (error) {
            console.error("Error fetching total income:", error);
        }
    };

    const getIncomeList = async () => {
        try {
            const result = await db
                .select()
                .from(Incomes)
                .where(eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(Incomes.date));

            setIncomeList(result);
        } catch (error) {
            console.error("Error fetching income list:", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTotalIncome();
            getIncomeList();
        }
    }, [user]);

    const onCreateIncome = async () => {
        if (!name || !amount) return;

        try {
            await db.insert(Incomes)
                .values({
                    source: name,
                    amount: parseInt(amount) || 0,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    date: new Date()
                });

            setName('');
            setAmount('');
            toast("Income added!");

            // Refresh data
            fetchTotalIncome();
            getIncomeList();
        } catch (error) {
            console.error("Error adding income:", error);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="relative p-5">
            {/* Total Income Display - Styled & Animated */}
            {/* <div className="absolute top-2 right-5 bg-[#86198f] text-white p-4 rounded-lg shadow-lg text-l font-bold">
                Total Income: ₹{totalIncome}
            </div> */}

            {/* Add Income Button */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button className='top-2 right-5 shadow-lg text-l font-bold text-white'> + Add Income ----
                        Total Income: ₹{totalIncome}
                    </Button>
                    {/* <div className="absolute top-2 right-5 bg-[#86198f] text-white p-4 rounded-lg shadow-lg text-l font-bold">
                        Total Income: ₹{totalIncome}
                    </div> */}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter your Income</DialogTitle>
                        <DialogDescription>Fill the details below to create income.</DialogDescription>
                    </DialogHeader>

                    <div className="mt-2">
                        <h2 className="text-black font-medium my-1">Income Name</h2>
                        <Input
                            placeholder="e.g. Pocket Money"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mt-1">
                        <h2 className="text-black font-medium my-1">Enter Amount</h2>
                        <Input
                            type="number"
                            placeholder="e.g. 3500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button disabled={!(name && amount)} onClick={onCreateIncome} className="mt-5">
                                Add Income
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* FILTERS  */}
            <div>
                {/* Year filter  */}
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>

                {/* Month Filter  */}
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                    {months.map((month, index) =>
                        <option
                            value="index"
                            key={index + 1}>
                            {month}
                        </option>
                    )}

                </select>

            </div>

            {/* Income List */}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Latest Incomes</h2>
                <IncomeListTable incomeList={incomeList} refreshData={() => { getIncomeList(); fetchTotalIncome(); }} />
            </div>
        </div>
    );
}

export default AddIncome;
