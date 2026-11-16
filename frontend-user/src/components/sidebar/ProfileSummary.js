// src/components/sidebar/ProfileSummary.js

"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-4 bg-white rounded-lg shadow animate-pulse">Loading profile...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-bold text-lg mb-2">Welcome!</h3>
        <p className="text-sm mb-2">Please log in to view your profile.</p>
        <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
          Sign in or Sign up &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold text-lg mb-2">Profile Summary</h3>
      {user ? (
        <div className="text-sm space-y-1">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          
          <div className="flex items-center space-x-1">
            <span className="font-semibold flex-shrink-0">Email:</span>
            <span className="truncate min-w-0" title={user.email}>{user.email}</span>
          </div>

          <div className="pt-2">
            <Link 
              href="/account" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              View Full Profile &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-red-500">Could not load user data.</p>
      )}
    </div>
  );
}