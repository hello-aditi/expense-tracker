import React from 'react'
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts'

function BarChartDashboard({budgetList}) {
  return (
    <div className='rounded-lg p-5 shadow-lg bg-white border-2 border-fuchsia-800'>
        <h2 className='font-bold text-lg mb-1'>Activity</h2>
        <BarChart
        width = {620}
        height={320}
        data={budgetList}
        margin={{
            top: 7,
            right:5,
            left:5,
            bottom:5
        }}
        >
            <XAxis dataKey='name' tick={{ fill: "black" }}/>
            <YAxis tick={{ fill: "black" }}/>
            <Tooltip />
            <Legend/>
            <Bar dataKey = 'totalSpend' stackId = 'a' fill= '#ff9898'/>
            <Bar dataKey = 'amount' stackId = 'a' fill= '#61f0c0'/>
        </BarChart>
    </div>
  )
}

export default BarChartDashboard