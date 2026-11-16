// frontend-user/src/components/layout/Header.js

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router"; 
import Navbar from "./Navbar";
import { useUI } from "@/contexts/UIContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCart } from "@/contexts/CartContext"; 

export default function Header({ showSidebarToggle = false }) {
  const router = useRouter();
  const { toggleSidebar } = useUI();
  const { isLoggedIn } = useAuth();
  const { unread, refreshUnread } = useNotifications();
  const { cartItemCount } = useCart(); 

  const [searchQuery, setSearchQuery] = useState("");

  // NEW → slide-down search toggle
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    if (isLoggedIn) refreshUnread();
  }, [isLoggedIn, refreshUnread]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?searchTerm=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false); // auto-close after search
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ========================= MOBILE ROW 1 ========================= */}
        <div className="flex md:hidden items-center justify-between h-16">
          
          {showSidebarToggle && (
            <button onClick={toggleSidebar} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <svg className="h-6 w-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <Link href="/" className="text-xl font-bold text-blue-600">Fashion Book</Link>

          <div className="flex items-center space-x-3">

            {/* --- toggle search bar --- */}
            <button 
              onClick={() => setShowMobileSearch(prev => !prev)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-5 w-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>

            <Link href="/account?view=profile" className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <svg className="h-5 w-5" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" 
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <Link href="/cart" className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <svg className="h-5 w-5" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" 
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>

              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 rounded-full min-w-[16px] text-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

          </div>
        </div>

        {/* ========================= MOBILE SEARCH BAR ========================= */}
        {showMobileSearch && (
          <div className="md:hidden w-full py-2 flex gap-2 items-center">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              placeholder="Search products..."
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded-md px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-blue-600 text-white text-[12px] rounded-md"
            >
              Go
            </button>
          </div>
        )}

        {/* ========================= MOBILE ROW 2 ========================= */}
        <div className="md:hidden flex items-center justify-between border-t py-2 px-1">
          <div className="flex items-center space-x-4 text-[11.5px] font-medium overflow-x-auto">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/products?sortBy=newest">New Arrivals</Link>
            <Link href="/products?category=Accessories">Accessories</Link>
          </div>

          <div className="flex items-center space-x-3">

            <Link href="/wishlist" className="text-gray-700">
              <svg className="h-5 w-5" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" 
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Link>

            <Link href="/account?view=notifications" className="relative text-gray-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 24a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 24Zm8-6v-5c0-3.07-1.64-5.64-4.5-6.32V6a3.5 3.5 0 1 0-7 0v.68C5.63 7.36 4 9.92 4 13v5l-1.29 1.29A1 1 0 0 0 3 21h18a1 1 0 0 0 .71-1.71L20 18Z" />
              </svg>

              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full min-w-[16px] text-center">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ========================= DESKTOP NAVIGATION ========================= */}
        <div className="hidden md:flex items-center justify-between h-16">

          <div className="flex items-center flex-shrink-0">
            {showSidebarToggle && (
              <button onClick={toggleSidebar} className="text-gray-700 hover:bg-gray-100 p-2 rounded-md mr-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link href="/" className="text-2xl font-bold text-blue-600">Fashion Book</Link>
          </div>

          <Navbar />

          <div className="flex items-center space-x-4">

            <div className="relative">
              <input 
                type="search" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="hidden sm:block w-56 sm:w-64 md:w-72 border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" 
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 hidden sm:block"
              >
                <svg className="h-4 w-4" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </button>
            </div>

            {/* Profile / Notifications / Wishlist / Cart */}
            {isLoggedIn ? (
               <div className="flex items-center space-x-4">

                  <Link href="/account?view=profile" className="block text-gray-700 hover:text-blue-600">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                  </Link>
                  <Link href="/account?view=notifications" className="relative text-gray-700 hover:text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 24a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 24Zm8-6v-5c0-3.07-1.64-5.64-4.5-6.32V6a3.5 3.5 0 1 0-7 0v.68C5.63 7.36 4 9.92 4 13v5l-1.29 1.29A1 1 0 0 0 3 21h18a1 1 0 0 0 .71-1.71L20 18Z" />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full min-w-[16px] text-center">{unread}</span>
                    )}
                  </Link>

                  <Link href="/wishlist" className="text-gray-700 hover:text-blue-600">
                    <svg className="h-6 w-6" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </Link>

                  <Link href="/cart" className="relative text-gray-700 hover:text-blue-600">
                    <svg className="h-6 w-6" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>

                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full min-w-[16px] text-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
               </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>
    </header>
  );
}
