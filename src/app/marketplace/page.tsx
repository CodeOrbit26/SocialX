"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { 
  Coins, Filter, ExternalLink, ShieldAlert, Award, 
  CheckCircle, Loader2, Sparkles, AlertCircle, Users, Heart, Eye, MessageCircle, ArrowRight, Image as ImageIcon
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
  owner: {
    username: string;
    reputationScore: number;
  };
}

function MarketplaceContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [emptyStateTab, setEmptyStateTab] = useState<string>("FOLLOW");
  const [requestSent, setRequestSent] = useState(false);
  
  const [targetLink, setTargetLink] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [mockData, setMockData] = useState<any>(null);
  const [imgError, setImgError] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "loading") {
      fetchTasks();
    }
  }, [status, filterType]);

  useEffect(() => {
    const injectedSlug = searchParams.get("injected");
    const injectedType = searchParams.get("type") || "FOLLOW";
    const injectedQuantity = parseInt(searchParams.get("quantity") || "100", 10);
    const injectedUrl = searchParams.get("url") || "";

    if (injectedSlug && status === "unauthenticated") {
      const newTask: Task = {
        id: "mock_task_" + Date.now(),
        taskType: injectedType,
        targetUsername: injectedSlug,
        targetUrl: injectedUrl || `https://instagram.com/${injectedSlug}`,
        reward: injectedType === "FOLLOW" ? 5 : 2,
        quantity: injectedQuantity,
        completedCount: 0,
        status: "ACTIVE",
        owner: {
          username: "guest_user",
          reputationScore: 100
        }
      };
      // We wait a tiny bit to ensure the regular fetch doesn't overwrite it if it's slow
      setTimeout(() => {
        setTasks(prev => {
          // Prevent duplicates
          if (prev.some(t => t.id.startsWith("mock_task_"))) return prev;
          return [newTask, ...prev];
        });
        setSuccessMsg("Campaign activated and live in the global marketplace!");
        
        // Clean up URL so it doesn't happen on refresh
        router.replace("/marketplace");
      }, 500);
    }
  }, [searchParams, status]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = filterType === "ALL" ? "/api/tasks" : `/api/tasks?type=${filterType}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (url: string, taskId: string) => {
    // Open target page externally
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

    // If guest or mock task, simulate completion for the demo
    if (status === "unauthenticated" || taskId.startsWith("mock_task_")) {
      setTimeout(() => {
        setSuccessMsg("Proof submitted successfully! It will be reviewed by the campaign owner.");
        setProofUrl("");
        setActiveTaskId(null);
        setTasks(tasks.filter(t => t.id !== taskId));
        setSubmittingId(null);
      }, 1000);
      return;
    }

    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, proofUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to submit proof.");
      } else {
        setSuccessMsg("Proof submitted successfully! It will be reviewed by the campaign owner.");
        setProofUrl("");
        setActiveTaskId(null);
        // Remove completed task from display list
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const userReputation = session?.user ? (session.user as any).reputationScore : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/3 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-pink-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-7 h-7 text-purple-500" />
            <span>SocialX Exchange Hub</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-0.5">Grow your socials or complete tasks to earn rewards.</p>
        </div>

        {/* Global reputation display or warnings */}
        {userReputation < 80 && (
          <div className="p-3 rounded-xl bg-yellow-950/20 border border-yellow-500/20 text-yellow-300 text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Reputation Score: {userReputation.toFixed(0)}%. Complete tasks honestly.</span>
          </div>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-2">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Grow Your Channel (Campaign Creator) - Width 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl bg-zinc-950/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-bl-full blur-2xl pointer-events-none" />
            
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Grow Your Channel</span>
            </h2>
            <p className="text-xs text-zinc-500 mb-6">Launch an engagement campaign. No login required.</p>

            {/* Campaign Options Switcher */}
            <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 mb-6 grid grid-cols-4 gap-1">
              {[
                { id: "FOLLOW", icon: Users, label: "Followers" },
                { id: "LIKE", icon: Heart, label: "Likes" },
                { id: "VIEW", icon: Eye, label: "Views" },
                { id: "COMMENT", icon: MessageCircle, label: "Comments" },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = emptyStateTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setEmptyStateTab(tab.id);
                      setTargetLink("");
                      setIsVerified(false);
                      setMockData(null);
                      setImgError(false);
                      setErrorMsg(null);
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg transition duration-200 cursor-pointer ${
                      isActive 
                        ? "bg-purple-950 border border-purple-500/30 text-white" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[9px] font-bold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Campaign Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  {emptyStateTab === "FOLLOW" ? "Target Profile Link / Username" : "Target Post / Reel Link"}
                </label>
                <input
                  type="text"
                  value={targetLink}
                  onChange={(e) => {
                    setTargetLink(e.target.value);
                    setIsVerified(false);
                    setMockData(null);
                    setImgError(false);
                    setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!isVerified) {
                        document.getElementById("verify-btn")?.click();
                      } else {
                        document.getElementById("send-btn")?.click();
                      }
                    }
                  }}
                  placeholder={emptyStateTab === "FOLLOW" ? "e.g. https://instagram.com/mr.abhay_26" : "e.g. https://instagram.com/p/..."}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  How many {emptyStateTab === "FOLLOW" ? "followers" : emptyStateTab === "LIKE" ? "likes" : emptyStateTab === "VIEW" ? "views" : "comments"} do you want?
                </label>
                <select
                  id="quantity-select"
                  defaultValue="100"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition appearance-none cursor-pointer"
                >
                  <option value="50">50</option>
                  <option value="100">100</option>
                  {emptyStateTab !== "FOLLOW" ? (
                    <option value="250">250</option>
                  ) : (
                    <>
                      <option value="250">250</option>
                      <option value="500">500</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-start space-x-3 text-xs text-amber-200/90 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-relaxed text-[10px]">
                  Make sure the account is set to <strong>Public</strong>. Private accounts cannot receive engagements.
                </p>
              </div>

              {isVerified && mockData && (
                <div className="mt-4 p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center space-x-4">
                  {emptyStateTab === "FOLLOW" ? (
                    <>
                      <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30 overflow-hidden">
                        {mockData.thumbnail && !imgError ? (
                          <img 
                            src={mockData.thumbnail} 
                            alt="Avatar" 
                            className="w-full h-full object-cover opacity-80" 
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <Users className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">@{mockData.username}</p>
                        <p className="text-[10px] text-zinc-500">{mockData.followers} Followers</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center">
                        {mockData.thumbnail && !imgError ? (
                          <img 
                            src={mockData.thumbnail} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover opacity-80" 
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white line-clamp-1">{mockData.caption}</p>
                        <p className="text-[10px] text-zinc-500">Public Post</p>
                      </div>
                    </>
                  )}
                  <div className="ml-auto text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!isVerified ? (
                <button
                  id="verify-btn"
                  onClick={async () => {
                    if (!targetLink) return;
                    
                    if (emptyStateTab !== "FOLLOW") {
                      if (!targetLink.includes('/p/') && !targetLink.includes('/reel/') && !targetLink.includes('/tv/')) {
                        setErrorMsg("Please enter a valid Instagram post or reel link.");
                        return;
                      }
                    } else {
                      if (targetLink.includes('/p/') || targetLink.includes('/reel/') || targetLink.includes('/tv/')) {
                        setErrorMsg("Please enter an Instagram profile username or link, not a post link.");
                        return;
                      }
                    }

                    setIsVerifying(true);
                    setErrorMsg(null);
                    try {
                      const res = await fetch("/api/verify-link", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ link: targetLink, type: emptyStateTab })
                      });
                      const result = await res.json();
                      
                      if (!res.ok) {
                        setErrorMsg(result.message || "Verification failed");
                        setIsVerifying(false);
                        return;
                      }
                      
                      setMockData(result.data);
                      setIsVerified(true);
                    } catch (err) {
                      setErrorMsg("Failed to connect to verification server.");
                    } finally {
                      setIsVerifying(false);
                    }
                  }}
                  disabled={isVerifying || !targetLink}
                  className="w-full group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Link...</span>
                    </>
                  ) : (
                    <span>Verify Link</span>
                  )}
                </button>
              ) : (
                <button
                  id="send-btn"
                  onClick={async () => {
                    const quantity = parseInt((document.getElementById("quantity-select") as HTMLSelectElement)?.value || "100", 10);
                    const slug = mockData.username || mockData.postId || "campaign";
                    
                    // Create task in backend first
                    try {
                      setErrorMsg(null);
                      const res = await fetch("/api/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          taskType: emptyStateTab,
                          targetUsername: mockData.username || mockData.postId || "user",
                          targetUrl: targetLink,
                          reward: emptyStateTab === "FOLLOW" ? 2.0 : 1.0,
                          quantity
                        })
                      });
                      const data = await res.json();
                      
                      if (!res.ok) {
                        setErrorMsg(data.message || "Failed to initiate campaign");
                        return;
                      }

                      // Redirect to the activation/follow-for-follow check
                      router.push(`/${slug}?type=${emptyStateTab}&quantity=${quantity}&url=${encodeURIComponent(targetLink)}&id=${data.id}`);
                    } catch (err) {
                      setErrorMsg("An unexpected error occurred. Please try again.");
                    }
                  }}
                  className="w-full group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-bold transition duration-200 cursor-pointer text-xs"
                >
                  <span>Send Request</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Column 2: Available Missions (Marketplace Feed) - Width 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              <span>Available Missions</span>
            </h2>

            {/* Filter types */}
            <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
              {["ALL", "FOLLOW", "LIKE", "VIEW", "COMMENT"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer ${
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

          {/* Missions List Container */}
          {loading ? (
            <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900 rounded-3xl">
              <Loader2 className="w-7 h-7 text-purple-500 animate-spin mx-auto mb-2" />
              <p className="text-zinc-500 text-xs">Fetching active campaigns...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-20 text-center bg-zinc-950/20 border border-zinc-900 rounded-3xl p-6">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-bold mb-1">No active missions found</p>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                All campaigns are complete. You can create your own growth campaign on the left to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between relative group hover:border-purple-500/30 transition duration-300 bg-zinc-950/20"
                >
                  <div>
                    {/* Badge & Reward */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold uppercase tracking-wider">
                        {task.taskType}
                      </span>
                      <div className="flex items-center text-[10px] font-bold text-yellow-400 bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-500/10">
                        <Award className="w-3 h-3 mr-1" />
                        <span>+{task.reward.toFixed(1)} Credits</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 truncate">Target: @{task.targetUsername}</h3>
                    <p className="text-[10px] text-zinc-500 mb-4">
                      By @{task.owner.username} (Rep: {task.owner.reputationScore.toFixed(0)}%)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 mt-2">
                    {activeTaskId !== task.id ? (
                      <button
                        onClick={() => {
                          handleStartTask(task.targetUrl, task.id);
                        }}
                        className="w-full bg-zinc-905 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>Complete Task</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <form onSubmit={(e) => handleSubmitProof(e, task.id)} className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Paste verification proof link
                          </label>
                          <input
                            type="text"
                            required
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-[10px] text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                            placeholder="Your post URL or username used"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveTaskId(null)}
                            className="w-1/3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white rounded-xl py-2 text-[10px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingId === task.id || !proofUrl}
                            className="w-2/3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-2 text-[10px] font-bold shadow-md shadow-purple-600/10 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1"
                          >
                            {submittingId === task.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
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

      </div>
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
