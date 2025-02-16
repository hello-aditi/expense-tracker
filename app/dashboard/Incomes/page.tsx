import React from 'react'
import AddIncome from './_components/AddIncome';

function IncomePage() {
  return (
    <div>
        <div className="p-10">
        <h1 className="font-bold text-3xl mb-2">My Incomes</h1>
        <AddIncome/>
        </div>
    </div>
  )
}

export default IncomePage;