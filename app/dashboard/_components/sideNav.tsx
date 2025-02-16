"use client";
import { UserButton } from "@clerk/nextjs";
import { Goal, LayoutGrid, PiggyBank, ReceiptText, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function SideNav({ setPageName }) {
  const menuList = [
    { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { id: 2, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
    { id: 3, name: "Incomes", icon: ShieldCheck, path: "/dashboard/incomes" },
    { id: 4, name: "My Goals", icon: Goal, path: "/dashboard/goals" },
  ];

  return (
    <div className="h-screen p-5 border shadow-sm w-[200px]"> {/* ✅ Fixed width */}
      {/* ✅ Logo */}
      <Image src={"/logo.svg"} alt="logo" width={140} height={50} />
      
      {/* ✅ Navigation Menu */}
      <div className="mt-5">
        {menuList.map((menu) => (
          <Link key={menu.id} href={menu.path} passHref>
            <div
              onClick={() => setPageName && setPageName(menu.name)} // ✅ Check if setPageName exists
              className="flex gap-3 items-center text-black font-semibold p-3 cursor-pointer rounded-md hover:bg-violet-300 transition-all"
            >
              <menu.icon className="w-5 h-5" /> 
              <span>{menu.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ✅ Profile Section */}
      <div className="absolute bottom-10 p-5 flex gap-2 items-center font-semibold cursor-pointer">
        <UserButton />
        <span>Profile</span>
      </div>
    </div>
  );
}

export default SideNav;
