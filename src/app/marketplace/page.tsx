"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { 
  Coins, ExternalLink, Award, CheckCircle2, Loader2, Sparkles, AlertCircle
} from "lucide-react";

interface Task {
  id: string;
  taskType: string;
  targetUsername: string;
  targetUrl: string;
  reward: number;
  quantity: number;
  completedCount: number;
  status: string;
  createdAt: string;
  owner?: {
    username: string;
    reputationScore: number;
  };
}

function MarketplaceContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [marketplaceTasks, setMarketplaceTasks] = useState<Task[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  
  const [proofUrl, setProofUrl] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMarketplaceTasks = async () => {
    try {
      setMarketplaceLoading(true);
      const url = filterType === "ALL" ? "/api/tasks" : `/api/tasks?type=${filterType}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMarketplaceTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceTasks();
  }, [filterType]);

  const handleStartTask = (url: string, taskId: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setActiveTaskId(taskId);
    setProofUrl("");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmitProof = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!proofUrl) return;

    setSubmittingId(taskId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, proofUrl }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMsg(resData.message || "Failed to submit proof.");
      } else {
        setSuccessMsg("Proof submitted successfully! It will be reviewed by the campaign owner.");
        setProofUrl("");
        setActiveTaskId(null);
        // Remove completed task from display list
        setMarketplaceTasks(marketplaceTasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/3 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-pink-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-7 h-7 text-purple-500 animate-pulse" />
            <span>Missions Marketplace</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-0.5">
            Complete tasks, verify your follow actions, and earn instant credits to grow your own channels.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 self-start md:self-auto">
          {["ALL", "FOLLOW", "LIKE", "VIEW", "COMMENT"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                filterType === type
                  ? "bg-purple-950 border border-purple-500/30 text-purple-300 shadow-md"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-2">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-2 text-red-400" /> {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Task List Grid */}
      {marketplaceLoading ? (
        <div className="text-center py-40 bg-zinc-950/20 border border-zinc-900 rounded-3xl">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Fetching active marketplace missions...</p>
        </div>
      ) : marketplaceTasks.length === 0 ? (
        <div className="py-32 text-center bg-zinc-950/20 border border-zinc-900 rounded-3xl p-6">
          <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 text-base font-bold mb-1">No active missions found</p>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            All campaigns are complete. Please check back later or start your own growth campaign!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaceTasks.map((task) => (
            <div 
              key={task.id} 
              className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between relative group hover:border-purple-500/30 transition duration-300 bg-zinc-950/25"
            >
              <div>
                {/* Badge & Reward */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] px-2.5 py-1 rounded-md bg-purple-950 border border-purple-800 text-purple-300 font-bold uppercase tracking-wider">
                    {task.taskType}
                  </span>
                  <div className="flex items-center text-xs font-bold text-yellow-400 bg-yellow-950/20 px-2.5 py-1 rounded-md border border-yellow-500/10">
                    <Award className="w-3.5 h-3.5 mr-1" />
                    <span>+{task.reward.toFixed(1)} Credits</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 truncate">Target: @{task.targetUsername}</h3>
                <p className="text-xs text-zinc-500 mb-6">
                  By @{task.owner?.username} (Reputation: {task.owner?.reputationScore.toFixed(0)}%)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {activeTaskId !== task.id ? (
                  <button
                    onClick={() => {
                      handleStartTask(task.targetUrl, task.id);
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer hover:border-purple-500/20"
                  >
                    <span>Complete Task</span>
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                  </button>
                ) : (
                  <form onSubmit={(e) => handleSubmitProof(e, task.id)} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Paste verification proof URL / Username used
                      </label>
                      <input
                        type="text"
                        required
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                        placeholder="E.g. https://instagram.com/myusername"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTaskId(null)}
                        className="w-1/3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white rounded-xl py-3 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingId === task.id || !proofUrl}
                        className="w-2/3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-3 text-xs font-bold shadow-md shadow-purple-600/10 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {submittingId === task.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Submit Proof</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
