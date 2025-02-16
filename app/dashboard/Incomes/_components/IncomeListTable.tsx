import { eq } from 'drizzle-orm';
import { Trash } from 'lucide-react';
import moment from 'moment';
import React from 'react';
import { toast } from 'sonner';
import { db } from 'utils/dbConfig';
import { Incomes } from 'utils/schema';

function IncomeListTable({ incomeList, refreshData }) {

    const deleteIncome = async (income) => {
        try {
            await db.delete(Incomes).where(eq(Incomes.id, income.id)).returning();
            toast("Income Deleted!");
            refreshData();
        } catch (error) {
            console.error("Error deleting income:", error);
        }
    };

    return (
        <div className="overflow-hidden rounded-lg shadow-lg mt-3">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-fuchsia-300 text-black">
                    <tr>
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Amount</th>
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {incomeList.length > 0 ? (
                        incomeList.map((income, index) => (
                            <tr key={income.id} className={` border-b ${index % 2 === 0 ? "bg-fuchsia-100" : "bg-white"} hover:bg-fuchsia-50 transition duration-300`}>
                                <td className="py-3 px-6">{income.source}</td>
                                <td className="py-3 px-6">₹{income.amount}</td>
                                <td className="py-3 px-6">{moment(income.date).format("DD MMM YYYY")}</td>
                                <td className="py-3 px-6 text-center">
                                    <Trash className="text-red-600 cursor-pointer hover:scale-110 transition-transform" onClick={() => deleteIncome(income)} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">No incomes added yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default IncomeListTable;
