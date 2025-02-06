"use client";
import { UserButton } from '@clerk/nextjs'
import { LayoutGrid, PiggyBank, ReceiptText, ShieldCheck } from 'lucide-react'
import Image from 'next/image';
import Link from "next/link";  // ✅ Correct Next.js import
import React from 'react'

function SideNav({ setPageName }) {
  const menuList = [
    { id: 1, name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 2, name: 'Budgets', icon: PiggyBank, path: '/dashboard/budgets' },
    { id: 3, name: 'Expenses', icon: ReceiptText, path: '/dashboard/expenses' },
    { id: 4, name: 'Upgrade', icon: ShieldCheck, path: '/dashboard/upgrade' }
  ];

  return (
    <div className='h-screen p-5 border shadow-sm w-50'>
      <Image src={'/logo.svg'} alt='logo' width={140} height={50} />
      <div className='mt-5'>
        {menuList.map((menu) => (
          <Link key={menu.id} href={menu.path} passHref>
            <div onClick={() => setPageName(menu.name)} className='flex gap-1 items-center text-black font-semibold p-5 cursor-pointer rounded-md hover:bg-violet-300'>
              <menu.icon />
              <span>{menu.name}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className='fixed bottom-10 p-5 flex gap-2 items-center font-semibold cursor-pointer '>
        <UserButton />
        Profile
      </div>
    </div>
  );
}

export default SideNav;
