"use client"
import { useUser } from '@clerk/nextjs';
import { sql, and, eq } from 'drizzle-orm';
import React, { useState } from 'react';
import { db } from 'utils/dbConfig';
import { Incomes } from 'utils/schema';


function SavingsGoals() {

  const [totalIncome, setTotalIncome] = useState(0);
  const {user} = useUser();

const fetchTotalIncome = async () => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

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

  return (
    <div>SavingsGoals</div>
  )
}

export default SavingsGoals




