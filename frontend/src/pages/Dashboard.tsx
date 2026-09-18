import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

interface TestResult {
  endpoint: string;
  roleName: string;
  success: boolean;
  message: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const testRoleAccess = async (
    endpoint: string,
    roleName: string
  ): Promise<TestResult> => {
    try {
      const response = await axios.get(endpoint);
      return {
        endpoint,
        roleName,
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        endpoint,
        roleName,
        success: false,
        message: error.response?.data?.message || "Request failed",
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests = [
      { endpoint: "/api/protected/student", name: "Student Route" },
      { endpoint: "/api/protected/admin", name: "Admin Route" },
      { endpoint: "/api/protected/coordinator", name: "Coordinator Route" },
      { endpoint: "/api/protected/profile", name: "Profile Route" },
    ];

    const results: TestResult[] = [];
    for (const test of tests) {
      const result = await testRoleAccess(test.endpoint, test.name);
      results.push(result);
      setTestResults([...results]);
    }

    setTesting(false);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-50 text-rose-700 ring-rose-600/20";
      case "PLACEMENT_COORDINATOR":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default:
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "👑";
      case "PLACEMENT_COORDINATOR":
        return "📋";
      default:
        return "��";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Bypass Notice */}
      <div className="bg-amber-400 text-amber-900 px-4 py-2 text-center text-sm font-medium">
        🔓 Development Mode — Authentication Bypassed
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-slate-900">
                  IntelliView
                </span>
              </div>

              <nav className="hidden md:flex items-center space-x-1">
                <a
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg"
                >
                  Dashboard
                </a>
                <a
                  href="/interview-prep"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Interview Prep
                </a>
                <a
                  href="#"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Analytics
                </a>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              <div className="h-8 w-px bg-slate-200"></div>

              <div className="flex items-center space-x-3">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full ring-2 ring-white"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="ml-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Logout"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "there"}!
              </h1>
              <p className="mt-2 text-slate-500">
                Here's what's happening with your interview preparation today.
              </p>
            </div>
            <button className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Interview
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Interviews
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Start your first interview
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No completed sessions yet
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average Score
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">—</p>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Complete interviews to see score
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Time Practiced
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">0h</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Track your practice time
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Content - 2 columns */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Get started with your interview preparation
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="group flex flex-col items-center p-6 bg-slate-50 hover:bg-indigo-50 rounded-xl border-2 border-transparent hover:border-indigo-200 transition-all">
                    <div className="h-14 w-14 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                      <svg
                        className="h-7 w-7 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Mock Interview
                    </h3>
                    <p className="text-sm text-slate-500 text-center">
                      Practice with AI
                    </p>
                  </button>

                  <button className="group flex flex-col items-center p-6 bg-slate-50 hover:bg-purple-50 rounded-xl border-2 border-transparent hover:border-purple-200 transition-all">
                    <div className="h-14 w-14 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                      <svg
                        className="h-7 w-7 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Upload Resume
                    </h3>
                    <p className="text-sm text-slate-500 text-center">
                      Get personalized Qs
                    </p>
                  </button>

                  <button className="group flex flex-col items-center p-6 bg-slate-50 hover:bg-emerald-50 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all">
                    <div className="h-14 w-14 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                      <svg
                        className="h-7 w-7 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      View Analytics
                    </h3>
                    <p className="text-sm text-slate-500 text-center">
                      Track progress
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* RBAC Test Panel */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    RBAC Test Panel
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Test role-based access control endpoints
                  </p>
                </div>
                <button
                  onClick={runTests}
                  disabled={testing}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    testing
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  }`}
                >
                  {testing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="-ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Run Tests
                    </>
                  )}
                </button>
              </div>

              <div className="p-6">
                {testResults.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          result.success
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              result.success ? "bg-emerald-100" : "bg-rose-100"
                            }`}
                          >
                            {result.success ? (
                              <svg
                                className="h-5 w-5 text-emerald-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5 text-rose-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {result.roleName}
                            </p>
                            <p className="text-sm text-slate-500 font-mono">
                              {result.endpoint}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            result.success
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {result.success ? "Granted" : "Denied"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="h-8 w-8 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1">
                      No tests run yet
                    </h3>
                    <p className="text-sm text-slate-500">
                      Click "Run Tests" to check RBAC endpoints
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Profile
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="h-20 w-20 rounded-full ring-4 ring-slate-100 mb-4"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-slate-100 mb-4">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${getRoleBadgeStyle(
                      user?.role || ""
                    )}`}
                  >
                    {getRoleIcon(user?.role || "")} {user?.role}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <span className="text-sm text-slate-500">User ID</span>
                    <span className="text-sm font-mono text-slate-700">
                      {user?.id?.slice(0, 12)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                      <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-6 w-6 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">No recent activity</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your activity will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 IntelliView. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
