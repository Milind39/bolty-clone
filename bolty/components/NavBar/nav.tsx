"use client";

import Link from "next/link";
import React from "react";
import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";

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

          {/* Corrected: Use SignedOut to show login button */}

          <SignInButton mode="modal">
            <button className="text-gray-200 hover:text-blue-400 font-medium transition cursor-pointer">
              Sign In
            </button>
          </SignInButton>

          {/* Corrected: Use SignedIn to show user profile and logout */}

          <UserButton />
          <SignOutButton>
            <button className="text-gray-200 hover:text-blue-400 font-medium transition cursor-pointer">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
