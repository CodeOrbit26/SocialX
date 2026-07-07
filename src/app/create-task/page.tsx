"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Coins, Sparkles, AlertCircle, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

function CreateTaskContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "FOLLOW";
  
  const [taskType, setTaskType] = useState(initialType);
  const [targetUsername, setTargetUsername] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [reward, setReward] = useState("2.0");
  const [quantity, setQuantity] = useState("10");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const userCredits = session?.user ? (session.user as any).credits : 0;
  const rewardVal = parseFloat(reward) || 0;
  const quantityVal = parseInt(quantity) || 0;
  const totalCost = rewardVal * quantityVal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totalCost > userCredits) {
      setError("Insufficient credits. Complete some tasks on the Marketplace to earn credits.");
      return;
    }

    if (rewardVal < 0.5) {
      setError("Minimum reward per action is 0.5 credits.");
      return;
    }

    if (quantityVal < 1) {
      setError("Minimum quantity is 1 completion.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType,
          targetUsername: targetUsername.trim(),
          targetUrl: targetUrl.trim(),
          reward: rewardVal,
          quantity: quantityVal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create task campaign.");
      } else {
        // Trigger session update to refresh credits balance
        await update();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      <Link href="/dashboard" className="inline-flex items-center text-xs text-zinc-400 hover:text-white mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles className="w-16 h-16 text-purple-500" />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Engagement Campaign</h1>
          <p className="text-zinc-400 text-sm mt-1">Publish a task for users to earn credits by engaging with your profiles.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Task Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { type: "FOLLOW", label: "Follow Profile" },
                { type: "LIKE", label: "Like Post" },
                { type: "VIEW", label: "View Content" },
                { type: "COMMENT", label: "Comment" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setTaskType(item.type)}
                  className={`py-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                    taskType === item.type
                      ? "bg-purple-950/60 border-purple-500 text-purple-300 shadow-lg shadow-purple-600/10"
                      : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Target Username */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Social Username
              </label>
              <input
                type="text"
                required
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="e.g. abhay_dev (without @)"
              />
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Target Action Link / URL
              </label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="e.g. https://instagram.com/p/..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Reward */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Reward per Engagement (credits)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                required
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="e.g. 2.0"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Actions Required (Quantity)
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          {/* Pricing breakdown summary */}
          <div className="bg-gradient-to-r from-purple-950/20 to-pink-950/20 p-4 rounded-xl border border-purple-500/10">
            <div className="flex justify-between items-center text-sm font-semibold text-zinc-400 mb-2">
              <span>Your Current Balance:</span>
              <span className="text-white flex items-center">
                <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                {userCredits.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-zinc-400 mb-3">
              <span>Campaign Cost:</span>
              <span className="text-purple-400">
                {rewardVal.toFixed(1)} &times; {quantityVal}
              </span>
            </div>
            <div className="border-t border-zinc-800/80 pt-2 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Deducted Cost:</span>
              <span className="text-lg font-bold text-white flex items-center">
                <Coins className="w-4 h-4 text-yellow-500 mr-1 animate-bounce" />
                {totalCost.toFixed(1)} Credits
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-purple-600/10 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Campaign...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Launch Campaign</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreateTaskPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    }>
      <CreateTaskContent />
    </Suspense>
  );
}
