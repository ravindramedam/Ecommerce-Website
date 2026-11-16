// src/pages/auth/login.js
"use client";

import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm"; 

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600">
          Login to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-700">
            register a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <LoginForm />
      </div>
    </div>
  );
}