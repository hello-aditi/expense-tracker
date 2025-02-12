import { PiggyBank, ReceiptText, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

function CardsInfo({ budgetList }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    if (budgetList && budgetList.length > 0) {
      calculateCardInfo();
    }
  }, [budgetList]); // ✅ Runs when budgetList updates

  const calculateCardInfo = () => {
    console.log("Budget List:", budgetList);

    let totalBudget_ = 0;
    let totalSpend_ = 0;
    budgetList.forEach((element) => {
      totalBudget_ += Number(element.amount); // ✅ Ensure it's a number
      totalSpend_ += element.totalSpend;
    });

    console.log("Total Budget:", totalBudget_, "Total Spend:", totalSpend_);
    setTotalBudget(totalBudget_); // ✅ Updating state 
    setTotalSpend(totalSpend_);
  };

  return (
    <div>
    {budgetList?.length>0?(
    <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="p-7 border rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm">Total Budget</h2>
          <h2 className="font-bold text-2xl">{totalBudget}</h2> {/* ✅ Display updated budget */}
        </div>
        <PiggyBank className="p-3 h-12 w-12 bg-purple-400 rounded-full" />
      </div>

      <div className="p-7 border rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm">Total Spending</h2>
          <h2 className="font-bold text-2xl">{totalSpend}</h2> {/* ✅ Display updated spend */}
        </div>
        <ReceiptText className="p-3 h-12 w-12 bg-purple-400 rounded-full" />
      </div>

      <div className="p-7 border rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm">Remaining Budget</h2>
          <h2 className="font-bold text-2xl">{totalBudget - totalSpend}</h2> {/* ✅ Display remaining */}
        </div>
        <Wallet className="p-3 h-12 w-12 bg-purple-400 rounded-full" />
      </div>

      <div className="p-7 border rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm">Total Budget</h2>
          <h2 className="font-bold text-2xl">{budgetList?.length}</h2> {/* ✅ Display remaining */}
        </div>
        <Wallet className="p-3 h-12 w-12 bg-purple-400 rounded-full" />
      </div>
    </div>
    )
    :
    (
    <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
         {[1,2,3,4].map((item,index)=>(
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
