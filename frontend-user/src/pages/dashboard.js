// frontend-user/src/pages/dashboard.js

"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import DashboardContainer from "@/components/dashboard/DashboardContainer";

export default function DashboardPage() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking authentication...
      </div>
    );
  }

  // User NOT logged in → Show friendly message (NO redirect)
  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            You must be signed in to view your dashboard.
          </h2>

          <Link
            href="/auth/login"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign in
          </Link>
        </div>
      </Layout>
    );
  }

  // Logged-in user → Show dashboard normally
  return (
    <Layout>
      <DashboardContainer />
    </Layout>
  );
}
