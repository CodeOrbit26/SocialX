"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Coins, LogOut, ShieldAlert, Sparkles, User as UserIcon, Menu, X, CheckSquare, BarChart3, PlusCircle } from "lucide-react";

export function Navbar() {
  const { data: session, status, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(100);

  // Poll for credits update dynamically
  useEffect(() => {
    if (session?.user) {
      setCredits((session.user as any).credits ?? 100);
      // Fetch latest stats / updates every 10s to keep credits current
      const interval = setInterval(() => {
        update();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [session, update]);

  const userRole = session?.user ? (session.user as any).role : "USER";

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 shadow-lg bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-purple-300 to-pink-400 bg-clip-text text-transparent tracking-wider">
                SocialX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {status === "authenticated" ? (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-zinc-300 hover:text-white flex items-center space-x-1.5 text-sm font-medium transition">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/marketplace" className="text-zinc-300 hover:text-white flex items-center space-x-1.5 text-sm font-medium transition">
                <Coins className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
              <Link href="/create-task" className="text-zinc-300 hover:text-white flex items-center space-x-1.5 text-sm font-medium transition">
                <PlusCircle className="w-4 h-4" />
                <span>Create Task</span>
              </Link>

              {userRole === "ADMIN" && (
                <Link href="/admin" className="text-purple-400 hover:text-purple-300 flex items-center space-x-1.5 text-sm font-medium transition">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Credits Widget */}
              <div className="flex items-center bg-gradient-to-r from-purple-950/40 to-pink-950/40 px-3 py-1.5 rounded-full border border-purple-500/25 glow-purple">
                <Coins className="w-4 h-4 text-yellow-400 mr-2 animate-bounce" />
                <span className="text-sm font-bold text-white mr-1">
                  {credits.toFixed(1)}
                </span>
                <span className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">Credits</span>
              </div>

              {/* User Dropdown / Profile */}
              <div className="flex items-center space-x-4 border-l border-zinc-800 pl-6">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white block max-w-[120px] truncate">
                      {session?.user?.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
                      Rep: {((session?.user as any)?.reputationScore ?? 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-900/50 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/marketplace" className="text-zinc-300 hover:text-white flex items-center space-x-1.5 text-sm font-medium transition mr-2">
                <Coins className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
              <Link
                href="/login"
                className="text-zinc-300 hover:text-white text-sm font-medium transition px-3.5 py-2 rounded-xl hover:bg-zinc-900/50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition px-4.5 py-2.5 rounded-xl shadow-lg shadow-purple-600/15 cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {status !== "authenticated" ? (
              <div className="flex items-center bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800 mr-3">
                <Coins className="w-3.5 h-3.5 text-yellow-400 mr-1.5" />
                <span className="text-xs font-bold text-white">100.0</span>
              </div>
            ) : (
              <div className="flex items-center bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800 mr-3">
                <Coins className="w-3.5 h-3.5 text-yellow-400 mr-1.5" />
                <span className="text-xs font-bold text-white">{credits.toFixed(1)}</span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900/50 focus:outline-none transition"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/5 bg-black/95">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-300 hover:text-white hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/marketplace"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-300 hover:text-white hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium"
                >
                  Marketplace
                </Link>
                <Link
                  href="/create-task"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-300 hover:text-white hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium"
                >
                  Create Task
                </Link>
                {userRole === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="text-purple-400 hover:text-purple-300 hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-zinc-800 my-2 pt-2">
                  <div className="flex items-center px-3 py-2 text-zinc-400">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{session?.user?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full text-left text-red-400 hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 p-2">
                <Link
                  href="/marketplace"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-300 hover:text-white hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium"
                >
                  Marketplace
                </Link>
                <div className="border-t border-zinc-800 my-2 pt-2 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-300 hover:text-white text-center hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-base font-medium border border-zinc-800"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-center block px-3 py-2.5 rounded-xl text-base font-bold shadow-lg shadow-purple-600/15"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
