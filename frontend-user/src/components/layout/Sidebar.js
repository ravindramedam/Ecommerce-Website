// src/components/layout/Sidebar.js
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useUI } from "@/contexts/UIContext";
import { useAuth } from "@/contexts/AuthContext";

// Child Components
import Profile from "../sidebar/ProfileSummary";
import QuickLinks from "../sidebar/QuickLinks";
import SidebarNotifications from "../sidebar/Notifications";
import Orders from "../sidebar/Orders";

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { isLoggedIn, logout } = useAuth();

  // Prevent scroll on mobile when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  return (
    <>
      {/* BACKDROP (Mobile & Tablet) */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden
          ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={toggleSidebar}
      />

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px] bg-white shadow-2xl z-40
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-5 pt-20">
          
          {isLoggedIn ? (
            /* ---------------------------------- */
            /* LOGGED IN VIEW */
            /* ---------------------------------- */
            <div className="space-y-6">
              {/* Components */}
              <Profile />
              <Orders />
              <QuickLinks />
              <SidebarNotifications />

              <hr className="border-gray-100" />

              {/* Settings Link */}
              <Link
                href="/account?view=info"
                onClick={toggleSidebar}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              >
                {/* Settings Icon */}
                <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="font-medium text-sm">Account Settings</span>
              </Link>
            </div>
          ) : (
            /* ---------------------------------- */
            /* GUEST VIEW */
            /* ---------------------------------- */
            <div className="flex flex-col h-full">
              
              {/* Welcome Banner */}
              <div className="bg-blue-50 p-4 rounded-xl mb-6 text-center border border-blue-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-2xl">
                  👋
                </div>
                <h3 className="font-bold text-gray-800">Welcome!</h3>
                <p className="text-xs text-gray-500 mt-1">Sign in to track orders & view your profile.</p>
              </div>

              <nav className="space-y-3">
                 {/* Login Button */}
                <Link
                  href="/auth/login"
                  onClick={toggleSidebar}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  Sign in
                </Link>

                 {/* Register Button */}
                <Link
                  href="/auth/register"
                  onClick={toggleSidebar}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  Create Account
                </Link>
              </nav>

              <hr className="my-6 border-gray-100" />

              {/* Guest Settings Link */}
              <Link
                href="/auth/login"
                onClick={toggleSidebar}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          )}
        </div>

        {/* BOTTOM FIXED LOGOUT (Only for Logged In) */}
        {isLoggedIn && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                logout();
                toggleSidebar();
              }}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign Out
            </button>
          </div>
        )}

      </aside>
    </>
  );
}