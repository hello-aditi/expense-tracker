"use client";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Goal, LayoutGrid, PiggyBank, ShieldCheck, Menu, square-chevron-left } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function SideNav({ setPageName, isCollapsed, setIsCollapsed }) {


  const menuList = [
    { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { id: 2, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
    { id: 3, name: "Incomes", icon: ShieldCheck, path: "/dashboard/incomes" },
    { id: 4, name: "My Goals", icon: Goal, path: "/dashboard/goals" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen border shadow-md bg-white transition-all duration-300 
        ${isCollapsed ? "w-[80px]" : "w-[190px]"} p-3`
      }
    >

      <Image
        src={isCollapsed ? "/logo-collapsed.svg" : "/logo.svg"}
        alt="logo"
        width={isCollapsed ? 40 : 140}  // Adjust width based on state
        height={isCollapsed ? 40 : 50}  // Adjust height based on state
        className="mb-3 transition-all"
      />

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-2 p-1 rounded-md hover:bg-gray-200 transition-all"
      >
        <square-chevron-left className="w-8 h-6" />
      </button>

      {/* ✅ Navigation Menu */}
      <div className="mt-5 space-y-3">
        {menuList.map((menu) => (
          <Link key={menu.id} href={menu.path} passHref>
            <div
              onClick={() => setPageName && setPageName(menu.name)}
              className="flex gap-3 items-center text-black font-semibold p-3 cursor-pointer rounded-md hover:bg-violet-300 transition-all"
            >
              <menu.icon className="w-6 h-6" />
              {!isCollapsed && <span>{menu.name}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* ✅ Profile Section (Show only icon when collapsed) */}
      <div className="absolute bottom-10 p-5 flex items-center gap-3 font-semibold cursor-pointer">
        <UserButton />
        {!isCollapsed && <span>Profile</span>}
      </div>
    </div>
  );
}

export default SideNav;
