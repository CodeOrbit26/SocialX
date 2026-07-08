"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { 
  Coins, ExternalLink, Award, CheckCircle2, Loader2, Sparkles, AlertCircle,
  Users, Heart, Eye, MessageCircle, Lock, ShieldAlert, CheckCircle, ShieldCheck
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
  completed?: boolean;
  verifying?: boolean;
  started?: boolean;
  actionCompleted?: boolean;
  logs?: string[];
}

function MarketplaceContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  // Custom burner account link states
  const [burnerAccount, setBurnerAccount] = useState("");
  const [burnerPassword, setBurnerPassword] = useState("");
  const [savePassword, setSavePassword] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Inbuilt browser popup simulator
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserState, setBrowserState] = useState<"login" | "loading" | "success" | "task">("login");
  const [activeBrowserTask, setActiveBrowserTask] = useState<Task | null>(null);
  const [taskCompletedInBrowser, setTaskCompletedInBrowser] = useState(false);
  const [expandedTaskLogs, setExpandedTaskLogs] = useState<Record<string, boolean>>({});

  // Shared account pools
  const [sharedAccount, setSharedAccount] = useState<{ username: string; password: string } | null>(null);
  const [fetchingShared, setFetchingShared] = useState(true);
  
  // Verified burner session details
  const [linkedBurner, setLinkedBurner] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Fetch active shared accounts
  useEffect(() => {
    async function checkSharedAccount() {
      try {
        setFetchingShared(true);
        const res = await fetch("/api/instagram/link");
        if (res.ok) {
          const data = await res.json();
          // If already linked, set details
          if (data && !data.message) {
            setLinkedBurner(data.username);
            setBurnerAccount(data.username);
            setFollowersCount(data.followersCount);
            setProfilePic(data.profilePic);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch account status", err);
      } finally {
        setFetchingShared(false);
      }
    }
    
    // Fetch shared account credentials too
    async function fetchShared() {
      try {
        const res = await fetch("/api/instagram/link");
        if (res.ok) {
          const data = await res.json();
          if (data && data.isFake) {
            setSharedAccount(data);
          }
        }
      } catch (err) {}
    }
    checkSharedAccount();
    fetchShared();
  }, []);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const url = filterType === "ALL" ? "/api/tasks" : `/api/tasks?type=${filterType}`;
      const res = await fetch(url);
      if (res.ok) {
        const dbTasks = await res.json();
        setTasks(dbTasks.map((t: any) => ({
          ...t,
          completed: false,
          verifying: false,
          logs: []
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filterType]);

  const handleInstagramLogin = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const user = customUser || burnerAccount;
    const pass = customPass || burnerPassword;

    if (!user.trim() || !pass.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);
    setBrowserState("loading");
    setShowBrowser(true);

    try {
      const res = await fetch("/api/instagram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          password: pass,
          isFake: true,
          savePassword: savePassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Failed to link account. Please check your credentials.");
        setBrowserState("login");
        setShowBrowser(false);
      } else {
        setBurnerAccount(data.account.username);
        setLinkedBurner(data.account.username);
        setFollowersCount(data.account.followersCount);
        setProfilePic(data.account.profilePic);
        setBrowserState("success");
        setTimeout(() => {
          setShowBrowser(false);
        }, 1500);
      }
    } catch (err) {
      setLoginError("Failed to connect to verification API. Please check your internet connection.");
      setBrowserState("login");
      setShowBrowser(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const performTaskAction = (task: Task) => {
    if (!linkedBurner) {
      setLoginError("You must link a burner account first before starting tasks.");
      return;
    }
    setActiveBrowserTask(task);
    setTaskCompletedInBrowser(false);
    setBrowserState("task");
    setShowBrowser(true);

    const targetUrl = task.targetUrl && task.targetUrl.startsWith("http")
      ? task.targetUrl
      : task.taskType === "FOLLOW"
        ? `https://instagram.com/${task.targetUsername.replace("@", "")}`
        : `https://instagram.com/p/${task.targetUsername}`;

    const popup = window.open(targetUrl, "instagramPopup", "width=500,height=600,scrollbars=yes");

    if (popup) {
      const checkTimer = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkTimer);
          setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, actionCompleted: true } : t));
          setShowBrowser(false);
          verifyTaskAction(task.id, task.targetUsername, task.taskType, true);
        }
      }, 1000);
    }

    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, started: true } : t)));
  };

  const handleCloseBrowser = () => {
    setShowBrowser(false);
    if (activeBrowserTask) {
      verifyTaskAction(activeBrowserTask.id, activeBrowserTask.targetUsername, activeBrowserTask.taskType, false);
    }
  };

  const verifyTaskAction = async (taskId: string, target: string, taskType: string, forceVerify: boolean = false) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask?.verifying || targetTask?.completed) return;

    setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: true, logs: ["Connecting to authentication API..."] } : t)));
    
    if (!forceVerify && !targetTask?.actionCompleted) {
      setTimeout(() => {
        const errorLogs = [
          "Checking Instagram API security handshake...",
          `✕ Relationship check failed: Account is NOT following @${target.replace("@", "")}.`,
          "Please click the action button and click Follow inside the Instagram simulated window."
        ];
        
        let currentLogIndex = 0;
        const interval = setInterval(() => {
          setTasks(prevTasks => prevTasks.map((t) => {
            if (t.id === taskId) {
              const nextLogs = [...(t.logs || []), errorLogs[currentLogIndex]];
              return { ...t, logs: nextLogs };
            }
            return t;
          }));
          
          currentLogIndex++;
          if (currentLogIndex >= errorLogs.length) {
            clearInterval(interval);
            setTimeout(() => {
              setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: false } : t)));
            }, 400);
          }
        }, 550);
      }, 550);
      return;
    }

    try {
      const res = await fetch("/api/tasks/complete-auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          burnerAccount: linkedBurner
        })
      });

      const data = await res.json();
      const serverLogs = data.logs || ["Handshake failed", "Connection verification error"];

      let currentLogIndex = 0;
      const interval = setInterval(() => {
        setTasks(prevTasks => prevTasks.map((t) => {
          if (t.id === taskId) {
            const nextLogs = [...(t.logs || []), serverLogs[currentLogIndex]];
            return { ...t, logs: nextLogs };
          }
          return t;
        }));
        
        currentLogIndex++;
        if (currentLogIndex >= serverLogs.length) {
          clearInterval(interval);
          setTimeout(() => {
            setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: false, completed: data.verified } : t)));
          }, 400);
        }
      }, 550);
      
    } catch (err) {
      setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: false, completed: false, logs: ["✕ Connection verification failed. Please try again."] } : t)));
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case "FOLLOW": return <Users className="w-5 h-5" />;
      case "LIKE": return <Heart className="w-5 h-5 text-pink-400" />;
      case "VIEW": return <Eye className="w-5 h-5 text-blue-450" />;
      default: return <Coins className="w-5 h-5 text-purple-400" />;
    }
  };

  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case "FOLLOW": return "Follow Profile";
      case "LIKE": return "Like Post";
      case "COMMENT": return "Write Comment";
      default: return "Complete Action";
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
            <Coins className="w-7 h-7 text-purple-500" />
            <span>Missions Marketplace</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-0.5">
            Complete tasks, verify actions, and earn instant credits to grow your own channels.
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

      {/* Burner Link / Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        
        {/* Left Column: Account Link Setup (Mockup Matching) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden bg-zinc-950/20 text-left">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-bl-full blur-2xl pointer-events-none" />
            
            {linkedBurner ? (
              // Linked Status Card
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-white text-base">
                      {linkedBurner.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">@{linkedBurner}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Burner Account</p>
                  </div>
                </div>
                
                <div className="p-3.5 bg-purple-950/25 border border-purple-500/10 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Total Followers Checked:</span>
                  <span className="font-extrabold text-purple-400">{followersCount}</span>
                </div>

                <button
                  onClick={() => {
                    setLinkedBurner(null);
                    setBurnerAccount("");
                  }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-850 rounded-xl py-3 text-xs font-bold transition cursor-pointer"
                >
                  Unlink Account
                </button>
              </div>
            ) : (
              // Linking form
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-white">Burner Profile Link</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                    Authenticate your profile to enable real-time action verification in the network.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[10px] leading-relaxed flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Shared Account Option */}
                  <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Shared Community Account</label>
                    {fetchingShared ? (
                      <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl py-3 text-center text-xs text-zinc-550 flex items-center justify-center space-x-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>Checking pool...</span>
                      </div>
                    ) : status !== "authenticated" ? (
                      <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-450 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 text-xs transition cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Register/Login to use Shared Account</span>
                      </button>
                    ) : sharedAccount ? (
                      <button
                        type="button"
                        disabled={isLoggingIn}
                        onClick={() => handleInstagramLogin(undefined, sharedAccount.username, sharedAccount.password)}
                        className="w-full bg-gradient-to-r from-purple-950/40 to-pink-955/40 hover:from-purple-900/50 hover:to-pink-900/50 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 py-3 rounded-xl font-bold transition flex items-center justify-center space-x-2 text-xs cursor-pointer shadow-md"
                      >
                        <Users className="w-3.5 h-3.5 text-pink-400" />
                        <span>Use Shared System Account</span>
                      </button>
                    ) : (
                      <div className="w-full bg-zinc-950 border border-zinc-900 text-zinc-650 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 text-xs opacity-60">
                        <Users className="w-3.5 h-3.5" />
                        <span>No Shared Accounts Available</span>
                      </div>
                    )}
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center">
                    <div className="flex-1 h-[1px] bg-zinc-900" />
                    <span className="px-3 text-[8px] text-zinc-600 font-black tracking-wider uppercase">OR USE YOUR OWN</span>
                    <div className="flex-1 h-[1px] bg-zinc-900" />
                  </div>

                  {/* Custom Login Form */}
                  <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Verify with your own account</label>
                    <button
                      type="button"
                      onClick={() => {
                        setBrowserState("login");
                        setShowBrowser(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-bold transition text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-600/10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verify Profile in secure window</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 mt-4">
                  <div className="p-3 bg-purple-950/20 border-l-2 border-l-purple-500 border-y-zinc-900 border-r-zinc-900 rounded-r-xl text-purple-300 text-[9px] leading-relaxed flex gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Burner Safety</strong>: Always use a burner/fake profile. Your password will only be saved in the database if you permit it, helping the community pool.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mission Checklist (Mockup Matching) */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Active Marketplace Tasks</span>
          </h2>

          {loadingTasks ? (
            <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900 rounded-3xl">
              <Loader2 className="w-7 h-7 text-purple-500 animate-spin mx-auto mb-2" />
              <p className="text-zinc-500 text-xs">Fetching active campaigns...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-20 text-center bg-zinc-950/20 border border-zinc-900 rounded-3xl p-6">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-bold mb-1">No active missions found</p>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                All campaigns are complete. You can create your own growth campaign to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-5 rounded-2xl border transition duration-300 flex flex-col gap-4 ${
                    task.completed 
                      ? "bg-emerald-950/10 border-emerald-500/20" 
                      : "bg-zinc-900/30 border-zinc-850 hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${task.completed ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-950/40 text-purple-400"}`}>
                        {getTaskIcon(task.taskType)}
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-white">
                          @{task.targetUsername.replace("@", "")}
                        </h3>
                        <p className="text-xs text-zinc-550 flex items-center gap-1.5">
                          <span>{getTaskLabel(task.taskType)}</span>
                          <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/5 border border-yellow-500/10 px-1.5 py-0.5 rounded">
                            +{task.reward.toFixed(1)} Credits
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      {task.completed ? (
                        <div className="flex items-center text-emerald-400 text-xs font-bold gap-1 animate-in fade-in duration-300">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      ) : task.verifying ? (
                        <button
                          disabled
                          className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                          <span>Verifying...</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => performTaskAction(task)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/15"
                        >
                          <span>
                            {task.taskType === "FOLLOW"
                              ? "Follow Profile"
                              : task.taskType === "LIKE"
                                ? "Like Post"
                                : task.taskType === "COMMENT"
                                  ? "Write Comment"
                                  : "Open Link"}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verification Log Console Toggle */}
                  {task.logs && task.logs.length > 0 && (
                    <div className="text-left">
                      <button
                        type="button"
                        onClick={() => setExpandedTaskLogs(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/40 hover:bg-zinc-900/60 border border-zinc-900/50 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white transition cursor-pointer select-none"
                      >
                        <MessageCircle className="w-3 h-3 text-purple-400" />
                        <span>{expandedTaskLogs[task.id] ? "Hide Verification Log Details ▲" : "Show Verification Log Details ▼"}</span>
                      </button>
                    </div>
                  )}

                  {/* Verification Log Console */}
                  {task.logs && task.logs.length > 0 && expandedTaskLogs[task.id] && (
                    <div className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl p-3 font-mono text-[9px] text-zinc-400 space-y-1.5 text-left animate-in fade-in slide-in-from-top-1 duration-200 mt-2">
                      <p className="text-[8px] text-zinc-650 font-bold uppercase tracking-wider mb-1">IG Verification Log Console</p>
                      {task.logs?.map((log: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {idx === (task.logs?.length ?? 0) - 1 && task.verifying ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400 shrink-0" />
                          ) : (
                            <span className="text-purple-550 shrink-0">→</span>
                          )}
                          <span className={log.includes("✕") ? "text-red-400" : log.includes("verified") ? "text-emerald-450 font-bold" : "text-zinc-350"}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Browser Popup Simulator */}
      {showBrowser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Top Browser Bar */}
            <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-905">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] text-zinc-400 font-mono flex items-center justify-center gap-1.5 bg-zinc-950/80 px-4 py-1.5 rounded-lg border border-zinc-800">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>instagram.com/auth</span>
              </span>
              <button 
                onClick={handleCloseBrowser}
                className="text-zinc-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Browser Content */}
            <div className="p-6">
              {browserState === "login" && (
                <form onSubmit={handleInstagramLogin} className="space-y-4 text-left">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-serif italic text-white my-1">Instagram</h3>
                    <p className="text-[10px] text-zinc-500">Sign in using secondary burner profile</p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Phone number, username, or email"
                      value={burnerAccount}
                      onChange={(e) => setBurnerAccount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={burnerPassword}
                      onChange={(e) => setBurnerPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={savePassword}
                        onChange={(e) => setSavePassword(e.target.checked)}
                        className="rounded border-zinc-800 text-purple-600 bg-zinc-900 focus:ring-0"
                      />
                      <span>Save credential in database pool</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-3.5 text-xs font-bold transition shadow-lg shadow-purple-600/10 cursor-pointer disabled:opacity-50"
                  >
                    Log In
                  </button>
                </form>
              )}

              {browserState === "loading" && (
                <div className="py-12 space-y-4">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Connecting Secure Tunnel</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Establishing handshake with profile resolver...</p>
                  </div>
                </div>
              )}

              {browserState === "success" && (
                <div className="py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Login Verified!</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Successfully linked @{burnerAccount}
                    </p>
                  </div>
                </div>
              )}

              {browserState === "task" && activeBrowserTask && (
                <div className="w-full text-left space-y-6">
                  <div className="flex flex-col gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-[10px] w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>Session active:</span>
                        <strong className="text-white">@{burnerAccount}</strong>
                      </div>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Inbuilt Session</span>
                    </div>

                    <div className="border-t border-zinc-855 pt-2.5 space-y-1.5">
                      <p className="text-[9px] text-zinc-400 leading-relaxed">
                        A real Instagram popup window has opened. If you need to log in there, copy these active credentials:
                      </p>
                      <div className="flex gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(burnerAccount)}
                          className="flex-1 bg-zinc-950 hover:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between text-zinc-350 hover:text-white transition cursor-pointer font-mono"
                        >
                          <span className="truncate max-w-[90px]">@{burnerAccount}</span>
                          <span className="text-[8px] text-purple-400 font-bold tracking-wide">Copy User</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(burnerPassword || sharedAccount?.password || "")}
                          className="flex-1 bg-zinc-950 hover:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between text-zinc-350 hover:text-white transition cursor-pointer font-mono"
                        >
                          <span>••••••••</span>
                          <span className="text-[8px] text-pink-400 font-bold tracking-wide">Copy Pass</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5 w-full">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px] shrink-0">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-white text-lg select-none">
                          {activeBrowserTask.targetUsername.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap justify-start">
                          <h3 className="text-sm font-bold text-white leading-none">
                            @{activeBrowserTask.targetUsername.replace("@", "")}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-450 border border-blue-500/20 text-[8px] font-bold uppercase">
                            Verified Target
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] text-zinc-550 mt-1">
                          <span><strong>1.4K</strong> posts</span>
                          <span><strong>2.8M</strong> followers</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400 border-t border-zinc-900 pt-4 text-left">
                      <h4 className="font-bold text-white text-[11px]">Official Partner Campaign</h4>
                      <p className="text-[10px] leading-relaxed text-zinc-500">
                        This account is registered on the SocialX network for direct follows. Complete the action below to verify connection and claim credits.
                      </p>
                    </div>

                    <div className="pt-2">
                      {taskCompletedInBrowser ? (
                        <button
                          disabled
                          className="w-full bg-zinc-900 border border-zinc-800 text-emerald-450 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition duration-300 animate-in zoom-in-95"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Follow Action Confirmed</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTaskCompletedInBrowser(true);
                            setTasks(prevTasks => prevTasks.map(t => t.id === activeBrowserTask.id ? { ...t, actionCompleted: true } : t));
                            setTimeout(() => {
                              setShowBrowser(false);
                              verifyTaskAction(activeBrowserTask.id, activeBrowserTask.targetUsername, activeBrowserTask.taskType, true);
                            }, 1200);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition cursor-pointer shadow-lg shadow-emerald-600/15"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span>Confirm Follow Action Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
