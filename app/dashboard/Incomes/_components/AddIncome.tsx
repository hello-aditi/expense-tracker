"use client";
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { db } from 'utils/dbConfig';
import { Incomes } from 'utils/schema';
import { and, eq, sql, desc } from 'drizzle-orm';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import IncomeListTable from './IncomeListTable';
import { toast } from 'sonner';
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

function AddIncome() {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);
    const [incomeList, setIncomeList] = useState([]);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const fetchTotalIncome = async () => {
        try {
            const result = await db
                .select({ sum: sql`SUM(amount)`.mapWith(Number) })
                .from(Incomes)
                .where(
                    and(
                        eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress),
                        sql`EXTRACT(YEAR FROM "date") = ${selectedYear}`,
                        sql`EXTRACT(MONTH FROM "date") = ${selectedMonth}`
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
                .where(
                    and(
                        eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress),
                        sql`EXTRACT(YEAR FROM "date") = ${selectedYear}`,
                        sql`EXTRACT(MONTH FROM "date") = ${selectedMonth}`
                    )
                )
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
    }, [user, selectedYear, selectedMonth]); // Re-fetch when filters change

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

    const isMonthDisabled = (monthIndex) => {
        if (selectedYear === currentYear) {
            // Disable months greater than the current month for the current year
            return monthIndex > currentMonth;
        }
        return false; // Enable all months for past years
    };

    return (
        <div className="p-10">
            <div className='flex justify-between'>
                <h1 className="font-bold text-3xl mb-2">My Incomes</h1>
                <div className='bg-slate-100 p-5 rounded-md items-center border-2 border-dashed
               hover:shadow-md text-right'>
                    Total Income: ₹{totalIncome}
                </div>
            </div>


            {/* FILTERS  */}
            <div className='flex justify-between'>
                {/* Year filter  */}
                <div className='flex space-x-4 mb-4'>
                    <select
                        className='border p-2 rounded-md'
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
                        className='border p-2 rounded-md'
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {months.map((month, index) => {
                            const monthIndex = index + 1; // Months are 1-indexed
                            return (
                                <option
                                    key={monthIndex}
                                    value={monthIndex}
                                    disabled={isMonthDisabled(monthIndex)} // Disable future months
                                >
                                    {month}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className='mt-3'>
                    <Dialog>
                        <DialogTrigger>
                            <Button className='top-2 right-5 shadow-lg text-lg font-bold text-white'>
                                + Add Income
                            </Button>
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

                </div>
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