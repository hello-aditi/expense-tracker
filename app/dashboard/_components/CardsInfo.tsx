import { PiggyBank, ReceiptText, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

function CardsInfo({ budgetList, incomeList }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    if (budgetList && budgetList.length > 0) {
      calculateCardInfo();
    }
    if (incomeList && incomeList.length > 0) {
      calculateIncome();
    }
  }, [budgetList, incomeList]); 

  const calculateCardInfo = () => {
    let totalBudget_ = 0;
    let totalSpend_ = 0;

    budgetList.forEach((element) => {
      totalBudget_ += Number(element.amount);
      totalSpend_ += element.totalSpend;
    });

    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
  };

  const calculateIncome = () => {
    let totalIncome_ = incomeList.reduce((sum, income) => sum + Number(income.totalIncome || 0), 0);
    setTotalIncome(totalIncome_);
  };
  

  // ✅ Utilization percentage calculation
  const utilization = totalIncome ? ((totalSpend / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div>
      {budgetList?.length > 0 || incomeList?.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Total Income Card */}
          <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
            <div>
              <h2 className="text-sm">Total Income</h2>
              <h2 className="font-bold text-2xl">{totalIncome}</h2>
            </div>
            <PiggyBank className="p-3 h-12 w-12 bg-green-400 rounded-full" />
          </div>

          {/* Total Budget */}
          <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
            <div>
              <h2 className="text-sm">Total Budget</h2>
              <h2 className="font-bold text-2xl">{totalBudget}</h2>
            </div>
            <Wallet className="p-3 h-12 w-12 bg-purple-400 rounded-full" />
          </div>

          {/* Total Spending */}
          <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
            <div>
              <h2 className="text-sm">Total Spending</h2>
              <h2 className="font-bold text-2xl">{totalSpend}</h2>
            </div>
            <ReceiptText className="p-3 h-12 w-12 bg-red-400 rounded-full" />
          </div>

          {/* Remaining Budget */}
          <div className="p-7 border flex justify-between items-center shadow-md rounded-xl">
            <div>
              <h2 className="text-sm">Remaining Balance</h2>
              <h2 className="font-bold text-2xl">{totalIncome - totalSpend}</h2>
            </div>
            <Wallet className="p-3 h-12 w-12 bg-blue-400 rounded-full" />
          </div>

          {/* Utilization Percentage (Top Right Corner) */}
          <div className="absolute top-2 right-5">
            <h2 className="text-sm text-gray-500">Utilization</h2>
            <h2 className="font-bold text-lg text-red-500">{utilization}%</h2>
          </div>

        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item, index) => (
            <div
              key={index}
              className="h-[120px] w-full bg-slate-200 animate-pulse rounded-lg">
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardsInfo;
