"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Coins, LogOut, ShieldAlert, Sparkles, User as UserIcon, Menu, X, BarChart3, PlusCircle, Zap } from "lucide-react";

export function Navbar() {
  const { data: session, status, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(100);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Poll for credits update dynamically
  useEffect(() => {
    if (session?.user) {
      setCredits((session.user as any).credits ?? 100);
      const interval = setInterval(() => {
        update();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [session, update]);

  const userRole = session?.user ? (session.user as any).role : "USER";

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  const isActive = (href: string) => pathname === href;

  const navLinkClass = (href: string) =>
    `flex items-center space-x-1.5 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg ${
      isActive(href)
        ? "text-white bg-purple-500/10 border border-purple-500/20"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
    }`;

  return (
    <>
      {/* Logout Overlay Animation */}
      {loggingOut && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white">Signing out...</p>
            <p className="text-[10px] text-zinc-500 font-mono">clearing_session_tokens</p>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 shadow-lg bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center space-x-2 group">
                <span className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md group-hover:shadow-purple-500/20 transition-shadow">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </span>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  <span className="text-white">Social</span>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">X</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {status === "authenticated" ? (
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/grow" className={navLinkClass("/grow")}>
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  <span>Grow</span>
                </Link>
                <Link href="/marketplace" className={navLinkClass("/marketplace")}>
                  <Coins className="w-4 h-4" />
                  <span>Marketplace</span>
                </Link>

                {userRole === "ADMIN" && (
                  <Link href="/admin" className={navLinkClass("/admin")}>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Credits Badge */}
                <div className="flex items-center bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-500/20 ml-2">
                  <Coins className="w-3.5 h-3.5 text-yellow-400 mr-1.5" />
                  <span className="text-xs font-bold text-purple-200">{credits.toFixed(1)}</span>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-xs text-zinc-300 font-medium hidden lg:block max-w-[100px] truncate">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/grow" className={navLinkClass("/grow")}>
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  <span>Grow</span>
                </Link>
                <Link href="/marketplace" className={navLinkClass("/marketplace")}>
                  <Coins className="w-4 h-4" />
                  <span>Marketplace</span>
                </Link>
                <Link
                  href="/login"
                  className="text-zinc-300 hover:text-white text-sm font-medium transition px-3.5 py-2 rounded-xl hover:bg-zinc-900/50 ml-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold transition px-4.5 py-2 rounded-xl shadow-lg shadow-purple-600/15 cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {status === "authenticated" && (
                <div className="flex items-center bg-purple-950/40 px-2 py-1 rounded-full border border-purple-500/20">
                  <Coins className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-[10px] font-bold text-purple-200">{credits.toFixed(1)}</span>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900/50 focus:outline-none transition"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-zinc-900 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-3 space-y-1">
              {status === "authenticated" ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-3 mb-2 bg-zinc-950/60 rounded-xl border border-zinc-900">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive("/dashboard") ? "bg-purple-500/10 text-white border border-purple-500/20" : "text-zinc-300 hover:text-white hover:bg-zinc-900"}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/grow"
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive("/grow") ? "bg-purple-500/10 text-white border border-purple-500/20" : "text-zinc-300 hover:text-white hover:bg-zinc-900"}`}
                  >
                    <PlusCircle className="w-4 h-4 text-purple-400" />
                    <span>Grow</span>
                  </Link>
                  <Link
                    href="/marketplace"
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive("/marketplace") ? "bg-purple-500/10 text-white border border-purple-500/20" : "text-zinc-300 hover:text-white hover:bg-zinc-900"}`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Marketplace</span>
                  </Link>
                  {userRole === "ADMIN" && (
                    <Link
                      href="/admin"
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive("/admin") ? "bg-purple-500/10 text-white border border-purple-500/20" : "text-purple-400 hover:text-purple-300 hover:bg-zinc-900"}`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <div className="border-t border-zinc-900 my-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 text-red-400 hover:bg-red-950/20 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/grow"
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive("/grow") ? "bg-purple-500/10 text-white border border-purple-500/20" : "text-zinc-300 hover:text-white hover:bg-zinc-900"}`}
                  >
                    <PlusCircle className="w-4 h-4 text-purple-400" />
                    <span>Grow</span>
                  </Link>
                  <Link
                    href="/marketplace"
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive("/marketplace") ? "bg-purple-500/10 text-white border border-purple-500/20" : "text-zinc-300 hover:text-white hover:bg-zinc-900"}`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Marketplace</span>
                  </Link>
                  <div className="border-t border-zinc-900 my-2 pt-2 grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="text-zinc-300 hover:text-white text-center hover:bg-zinc-900 block px-3 py-2.5 rounded-xl text-sm font-medium border border-zinc-800"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center block px-3 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-600/15"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
