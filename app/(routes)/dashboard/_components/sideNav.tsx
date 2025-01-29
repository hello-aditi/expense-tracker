import { UserButton } from '@clerk/nextjs'
import { LayoutGrid, PiggyBank, ReceiptText, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function SideNav() {

  const menuList =[
    {
      id:1,
      name: 'Dashboard',
      icon : LayoutGrid
    },
    {
      id:2,
      name: 'Budgets',
      icon : PiggyBank
    },
    {
      id:3,
      name: 'Expenses',
      icon : ReceiptText
    },
    {
      id:4,
      name: 'Upgrade',
      icon : ShieldCheck
    },
    {
      id:5,
      name: 'Dashboard',
      icon : LayoutGrid
    },

  ]

  return (
    <div className='h-screen p-5 border shadow-sm'>
      <Image 
      src={'./logo.svg'} 
      alt='logo'
      width={140}
      height={50}
      />

      <div className='mt-5'>
        {menuList.map((menu,index)=>(
          <h2 className='flex gap-1 items-center text-black 
          font-semibold p-5 cursor-pointer rounded-md hover:bg-violet-200'>
            <menu.icon/>
            {menu.name}
          </h2>
        ))}
      </div>
      <div className='fixed bottom-10 p-5 flex gap-2 items-center font-semibold cursor-pointer '>
        <UserButton/>
        Profile
      </div>

    </div>
  )
}

export default SideNav