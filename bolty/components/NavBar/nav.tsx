"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Show, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";

const Nav = () => {
  const router = useRouter();

  return (
    <div>
      <nav className="w-full flex justify-between items-center px-8 py-3 bg-black bg-gradient-to-b-gray border-0 min-h-[48px]">
        <div className="text-2xl font-bold tracking-tight text-gray-100">
          <Link href="/">Bolty</Link>
        </div>

        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => router.push("/Pricing")}
            className="text-gray-200 hover:text-blue-400 font-medium transition"
          >
            Pricing
          </button>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-gray-200 hover:text-blue-400 font-medium transition cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
