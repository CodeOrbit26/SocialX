"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Zap, ArrowRight, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong during registration.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success animation
  if (success) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center space-y-5 animate-in zoom-in-95 fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Account Created!</h3>
            <p className="text-sm text-zinc-400 mt-1">+100 credits added. Redirecting to login...</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-emerald-300">100.0 Credits Deposited</span>
          </div>
          <div className="w-32 h-1 bg-zinc-900 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md glass-panel p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex p-2.5 sm:p-3 bg-purple-500/10 rounded-2xl text-purple-400 mb-3 border border-purple-500/20">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Create your account</h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">Get 100 free credits immediately upon registration</p>
        </div>

        {error && (
          <div className="mb-5 p-3 sm:p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <User className="w-4 h-4" />
              </span>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="creatorname" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-purple-600/10 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 group">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Registering...</span></>
            ) : (
              <><span>Register Now</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
