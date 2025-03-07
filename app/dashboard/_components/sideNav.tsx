"use client";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Goal, LayoutGrid, PiggyBank, ShieldCheck, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function SideNav({ setPageName, isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  const menuList = [
    { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { id: 2, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
    { id: 3, name: "Incomes", icon: ShieldCheck, path: "/dashboard/incomes" },
    { id: 4, name: "My Goals", icon: Goal, path: "/dashboard/goals" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen border shadow-lg transition-all duration-300 bg-fuchsia-50 p-4
        ${isCollapsed ? "w-[80px]" : "w-[200px]"} p-4`} 
    >
      <div className="flex justify-center mb-3">
        <Image
          src={isCollapsed ? "/logo_only.png" : "/logo.svg"}
          alt="logo"
          width={isCollapsed ? 40 : 140}
          height={isCollapsed ? 40 : 50}
          className="transition-all duration-300 ease-in-out" 
        />
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-3 p-2 rounded-full bg-fuchsia-100 hover:bg-fuchsia-200 transition-all shadow-md flex justify-center items-center" // Updated styling for the collapse button
      >
        <Menu className="w-6 h-6 text-fuchsia-700" /> {/* Added text-fuchsia-600 for the icon */}
      </button>

      <div className="mt-5 space-y-4 font-bold"> 
        {menuList.map((menu) => {
          const isActive = pathname === menu.path;

          return (
            <Link key={menu.id} href={menu.path} passHref>
              <div
                onClick={() => setPageName && setPageName(menu.name)}
                className={`flex gap-3 items-center text-gray-800 font-medium p-3 cursor-pointer rounded-lg transition-all 
                  ${isActive ? 
                    "bg-fuchsia-600 text-white font-bold" : "hover:bg-fuchsia-100 hover:scale-105 hover:shadow-lg"}`} // Updated styling: text-gray-800, bg-fuchsia-600, hover effects
              >
                <menu.icon className={`w-6 h-6 ${isActive ? "text-white" : "text-fuchsia-700"}`} /> {/* Added conditional icon color */}
                {!isCollapsed && <span>{menu.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div
        className="absolute bottom-11 p-3 flex items-center gap-3 font-semibold cursor-pointer bg-white rounded-lg shadow-md border border-fuchsia-200 hover:bg-fuchsia-50 transition-all" // Updated styling for profile section
      >
        <UserButton />
        {!isCollapsed && <span className="text-gray-800">Profile</span>} {/* Added text-gray-800 */}
      </div>
    </div>
  );
}

export default SideNav;