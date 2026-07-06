import Link from "next/link";
import React from "react";

const Nav = () => {
  return (
    <div>
      <nav className="w-full flex justify-between items-center px-8 py-3 bg-gradient-to-b from-[#10151c]/80 via-[#10151c]/60 to-transparent backdrop-blur-lg shadow-lg border-0 min-h-[48px]">
        <div className="text-2xl font-bold tracking-tight text-gray-100">
          <Link href="/">Bolty</Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link
            href="/Pricing"
            className="text-gray-200 hover:text-blue-400 font-medium transition"
          >
            Pricing
          </Link>
          <a
            href="#signin"
            className="text-gray-200 hover:text-blue-400 font-medium transition"
          >
            Sign In
          </a>
          <a
            href="#signout"
            className="text-gray-200 hover:text-blue-400 font-medium transition"
          >
            Sign Out
          </a>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
