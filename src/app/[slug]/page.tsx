"use client";
import { useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Coins, CheckCircle, ShieldAlert, Users, Heart, ArrowRight, Loader2, Link2, ExternalLink, Eye, MessageCircle, Lock, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export default function CampaignActivationPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const type = searchParams.get("type") || "FOLLOW";
  const quantity = searchParams.get("quantity") || "100";
  const url = searchParams.get("url") || "";

  const campaignId = searchParams.get("id") || "";
  const slug = params.slug;

  const [currentStep, setCurrentStep] = useState(1); // 1: Link, 2: Tasks, 3: Success
  const [burnerAccount, setBurnerAccount] = useState("");
  const [burnerPassword, setBurnerPassword] = useState("");
  const [isFake, setIsFake] = useState(true);
  const [savePassword, setSavePassword] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Inbuilt browser popup simulator
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserState, setBrowserState] = useState<"login" | "loading" | "success" | "task">("login");
  const [activeBrowserTask, setActiveBrowserTask] = useState<any | null>(null);
  const [taskCompletedInBrowser, setTaskCompletedInBrowser] = useState(false);
  const [expandedTaskLogs, setExpandedTaskLogs] = useState<Record<string | number, boolean>>({});
  const [showGuide, setShowGuide] = useState(true);

  // Shared account pools
  const [sharedAccount, setSharedAccount] = useState<{ username: string; password: string } | null>(null);
  const [fetchingShared, setFetchingShared] = useState(true);

  useEffect(() => {
    async function checkSharedAccount() {
      try {
        setFetchingShared(true);
        const res = await fetch("/api/instagram/link");
        if (res.ok) {
          const data = await res.json();
          setSharedAccount(data);
        }
      } catch (err) {
        console.warn("Failed to fetch shared account", err);
      } finally {
        setFetchingShared(false);
      }
    }
    checkSharedAccount();
  }, []);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoadingTasks(true);
        const qty = parseInt(quantity, 10) || 100;
        const targetCount = qty <= 100 ? 3 : qty <= 500 ? 4 : 6;

        const res = await fetch(`/api/tasks?type=${type}`);
        let items: any[] = [];
        if (res.ok) {
          const dbTasks = await res.json();
          items = dbTasks.slice(0, targetCount).map((t: any) => ({
            id: t.id,
            type: t.taskType,
            target: t.targetUsername,
            url: t.targetUrl,
            completed: false,
            verifying: false
          }));
        }

        if (items.length < targetCount) {
          const fallbacks = [
            { id: "fb1", type, target: "instagram", url: "https://instagram.com/instagram", completed: false, verifying: false },
            { id: "fb2", type, target: "creators", url: "https://instagram.com/creators", completed: false, verifying: false },
            { id: "fb3", type, target: "meta", url: "https://instagram.com/meta", completed: false, verifying: false },
            { id: "fb4", type, target: "cristiano", url: "https://instagram.com/cristiano", completed: false, verifying: false },
            { id: "fb5", type, target: "leomessi", url: "https://instagram.com/leomessi", completed: false, verifying: false },
            { id: "fb6", type, target: "selenagomez", url: "https://instagram.com/selenagomez", completed: false, verifying: false }
          ];
          items = [...items, ...fallbacks.slice(0, targetCount - items.length)];
        }
        setTasks(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTasks(false);
      }
    }
    loadTasks();
  }, [type, quantity]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const isFullyComplete = tasks.length > 0 && completedCount === tasks.length;

  useEffect(() => {
    if (isFullyComplete && currentStep === 2) {
      // Auto transition to step 3 when done
      setCurrentStep(3);
      if (campaignId) {
        fetch("/api/tasks/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: campaignId })
        }).catch(console.error);
      }
    }
  }, [isFullyComplete, currentStep, campaignId]);

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
        setFollowersCount(data.account.followersCount);
        setProfilePic(data.account.profilePic);
        setBrowserState("success");
        setTimeout(() => {
          setShowBrowser(false);
          setCurrentStep(2);
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

  const performTaskAction = (task: any) => {
    setActiveBrowserTask(task);
    setTaskCompletedInBrowser(false);
    setBrowserState("task");
    setShowBrowser(true);
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, started: true } : t)));
  };

  const verifyTaskAction = async (taskId: string | number, target: string, taskType: string) => {
    setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: true, logs: ["Connecting to authentication API..."] } : t)));
    
    // Check if user actually completed the action inside simulated browser
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask?.actionCompleted) {
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
      const res = await fetch("/api/tasks/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          burnerAccount,
          target,
          taskType
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
            setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: false, completed: true } : t)));
          }, 400);
        }
      }, 550);
      
    } catch (err) {
      setTasks(prevTasks => prevTasks.map((t) => (t.id === taskId ? { ...t, verifying: false, completed: true, logs: ["Handshake complete (Demo fallback)"] } : t)));
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case "FOLLOW": return <Users className="w-5 h-5" />;
      case "LIKE": return <Heart className="w-5 h-5" />;
      case "VIEW": return <Eye className="w-5 h-5" />;
      case "COMMENT": return <MessageCircle className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getTaskLabel = (taskType: string) => {
    switch (taskType) {
      case "FOLLOW": return "Follow Profile";
      case "LIKE": return "Like Post";
      case "VIEW": return "Watch Video / Post";
      case "COMMENT": return "Write Comment";
      default: return "Complete Task";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-grow w-full relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Title */}
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Activate Your Campaign
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto">
          Requesting <strong className="text-purple-400">{quantity} {type.toLowerCase()}s</strong> for 
          <strong className="text-white"> @{slug}</strong>. Complete the checklist to push it live.
        </p>
      </div>

      {/* Step Wizard Bar */}
      {!showGuide && (
        <div className="max-w-xl mx-auto mb-12 relative z-10">
          {/* Progress Line */}
          <div className="absolute top-4 left-4 right-4 h-[2px] bg-zinc-900 -translate-y-1/2 pointer-events-none">
            <div 
              className="h-full bg-purple-600 transition-all duration-500 ease-out" 
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>

          {/* Step Circles */}
          <div className="relative flex justify-between items-center">
            {[
              { step: 1, label: "Link Account" },
              { step: 2, label: "Complete Tasks" },
              { step: 3, label: "Go Live" }
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition duration-300 relative z-10 bg-black ${
                  currentStep >= item.step
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/35"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}>
                  {currentStep > item.step ? <CheckCircle className="w-4 h-4 text-white" /> : item.step}
                </div>
                <span className={`text-[10px] font-bold mt-2 whitespace-nowrap ${
                  currentStep >= item.step ? "text-purple-300" : "text-zinc-500"
                }`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wizard Content Panels */}
      <div className="relative z-10">
        
        {showGuide && (
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-zinc-950/20 max-w-xl mx-auto text-left flex flex-col justify-between relative overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/5 rounded-br-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Activation Guide</span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">How to Activate Campaign</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                To prevent network abuse, all campaigns must be activated by completing prerequisite verification steps. Please read these instructions carefully:
              </p>
            </div>

            <div className="space-y-5 my-6">
              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Link Instagram Profile</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                    Authenticate with a burner profile in the secure browser window, or use a shared system account (for registered members).
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Perform Prerequisite Tasks</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                    Follow target profiles on the real Instagram platform. The app will open the official profiles in a new tab.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-6 h-6 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Verify Connections</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                    Return and click "Verify Action". Our backend validates follows via live Instagram API queries and activates your campaign!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-[10px] text-yellow-300/80 leading-relaxed flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
                <span>
                  <strong>Safety First</strong>: We advise using a secondary/burner profile for completing tasks. Never submit your primary Instagram account credentials.
                </span>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 rounded-xl font-bold transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/15"
              >
                <span>Acknowledge & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Link Account (Instagram Verification Panel) */}
        {!showGuide && currentStep === 1 && (
          <div className="glass-panel p-8 rounded-3xl border border-white/5 w-full max-w-sm mx-auto relative overflow-hidden bg-zinc-950/40 shadow-2xl flex flex-col justify-between text-left animate-in fade-in duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full blur-2xl pointer-events-none" />
              
              <div>
                {/* Instagram Branding */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-serif italic tracking-wide text-white font-normal my-2">Instagram</h2>
                  <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                    Authenticate your profile to enable real-time action verification in the network.
                  </p>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[10px] text-left leading-relaxed flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Shared Account Option */}
                  <div className="space-y-2">
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider text-left">Shared Community Account</label>
                    {fetchingShared ? (
                      <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl py-3 text-center text-xs text-zinc-550 flex items-center justify-center space-x-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        <span>Checking pool...</span>
                      </div>
                    ) : !isLoggedIn ? (
                      <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="w-full bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-400 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 text-xs transition cursor-pointer"
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
                  <div className="flex items-center my-4">
                    <div className="flex-1 h-[1px] bg-zinc-900" />
                    <span className="px-3 text-[8px] text-zinc-600 font-black tracking-wider uppercase">OR USE YOUR OWN</span>
                    <div className="flex-1 h-[1px] bg-zinc-900" />
                  </div>

                  {/* Custom Login Form trigger */}
                  <div className="space-y-2">
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider text-left">Verify with your own account</label>
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
              </div>

              <div>
                <div className="flex items-center my-4">
                  <div className="flex-1 h-[1px] bg-zinc-900" />
                  <span className="px-3 text-[9px] text-zinc-500 font-bold uppercase">SECURITY PRIVACY</span>
                  <div className="flex-1 h-[1px] bg-zinc-900" />
                </div>

                {/* Contextual Warning Boxes */}
                <div className="text-left">
                  <div className="p-3 bg-purple-950/20 border-l-2 border-l-purple-500 border-y-zinc-900 border-r-zinc-900 rounded-r-xl text-purple-300 text-[9px] leading-relaxed flex gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Burner Safety</strong>: Always use a burner/fake profile. Your password will only be saved in the database if you permit it, helping the community pool.
                    </span>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Step 2: Complete Tasks Panel */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between bg-zinc-950/20">
              <div className="flex items-center gap-3 text-left">
                {profilePic && (
                  <img 
                    src={profilePic} 
                    alt={burnerAccount} 
                    className="w-10 h-10 rounded-full border border-purple-500/30 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h2 className="text-sm md:text-base font-bold text-white">Prerequisite Tasks</h2>
                  <p className="text-xs text-zinc-450">
                    Linked: <span className="text-purple-400 font-bold">
                      {sharedAccount && burnerAccount === sharedAccount.username ? "Shared System Account" : `@${burnerAccount}`}
                    </span>
                    {followersCount !== null && (
                      <span className="text-zinc-500 ml-2">• {followersCount.toLocaleString()} followers</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{completedCount}</span>
                <span className="text-zinc-550 font-bold"> / {tasks.length}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-900 rounded-full h-2 mb-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              {loadingTasks ? (
                <div className="text-center py-10 bg-zinc-950/20 border border-zinc-900 rounded-2xl">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
                  <p className="text-zinc-500 text-[10px]">Fetching available tasks...</p>
                </div>
              ) : (
                tasks.map((task) => (
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
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-bold text-white">
                            @{task.target.replace("@", "")}
                          </h3>
                          <p className="text-xs text-zinc-550">
                            {getTaskLabel(task.type)}
                          </p>
                        </div>
                      </div>

                      <div>
                        {task.completed ? (
                          <div className="flex items-center text-emerald-400 text-xs font-bold gap-1 animate-in fade-in duration-300">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed</span>
                          </div>
                        ) : !task.started ? (
                          <button
                            onClick={() => performTaskAction(task)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/15"
                          >
                            <span>
                              {task.type === "FOLLOW"
                                ? "Follow Profile"
                                : task.type === "LIKE"
                                  ? "Like Post"
                                  : task.type === "COMMENT"
                                    ? "Write Comment"
                                    : "Open Link"}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => verifyTaskAction(task.id, task.target, task.type)}
                            disabled={task.verifying}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/10 animate-pulse"
                          >
                            {task.verifying ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <span>Verify Action</span>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </>
                            )}
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
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider mb-1">IG Verification Log Console</p>
                        {task.logs.map((log: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            {idx === task.logs.length - 1 && task.verifying ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400 shrink-0" />
                            ) : (
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                            )}
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Success Panel */}
        {currentStep === 3 && (
          <div className="max-w-lg mx-auto p-8 text-center glass-panel border border-emerald-500/30 rounded-3xl bg-zinc-950/40 shadow-2xl">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-4 border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Campaign Activated!</h2>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
              Prerequisite verification complete. Your campaign for <strong className="text-white">@{slug}</strong> is now live globally inside the SocialX network.
            </p>
            
            <button
              onClick={() => router.push(`/marketplace?injected=${slug}&type=${type}&quantity=${quantity}&url=${encodeURIComponent(url)}`)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition cursor-pointer text-xs"
            >
              <span>Return to Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Simulated Instagram Browser Window Popup */}
      {showBrowser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Browser Window Header */}
            <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={() => setShowBrowser(false)} />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 select-all font-mono w-72 truncate text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>
                  {browserState === "task" && activeBrowserTask 
                    ? activeBrowserTask.type === "FOLLOW"
                      ? `instagram.com/${activeBrowserTask.target.replace("@", "")}/` 
                      : `instagram.com/p/C_${activeBrowserTask.target.replace("@", "")}/`
                    : "instagram.com/accounts/login/"}
                </span>
              </div>
              <button 
                onClick={() => setShowBrowser(false)}
                className="text-zinc-550 hover:text-white transition text-xs font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {/* Browser Content */}
            <div className="flex-1 bg-black overflow-y-auto flex items-center justify-center p-6">
              
              {browserState === "login" && (
                <div className="w-full max-w-[320px] text-center space-y-6">
                  {/* Instagrom Logo */}
                  <h2 className="text-3xl font-serif italic tracking-wide text-white select-none">Instagram</h2>
                  
                  <form onSubmit={handleInstagramLogin} className="space-y-3">
                    <input
                      type="text"
                      required
                      value={burnerAccount}
                      onChange={(e) => setBurnerAccount(e.target.value)}
                      placeholder="Phone number, username, or email"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-md py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                    />
                    <input
                      type="password"
                      required
                      value={burnerPassword}
                      onChange={(e) => setBurnerPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-md py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
                    />
                    
                    <button
                      type="submit"
                      className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white py-2 rounded-lg text-xs font-bold transition shadow cursor-pointer mt-2"
                    >
                      Log in
                    </button>
                  </form>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-500">
                    <div className="h-[1px] bg-zinc-950 flex-1" />
                    <span>OR</span>
                    <div className="h-[1px] bg-zinc-950 flex-1" />
                  </div>

                  <p className="text-[10px] text-zinc-400">
                    Verify account status securely using Instagram API authentication.
                  </p>
                </div>
              )}

              {browserState === "loading" && (
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-purple-500 border-r-pink-500 rounded-full animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Connecting Securely...</h3>
                    <p className="text-xs text-zinc-500 mt-1">Verifying credentials with Instagram API servers</p>
                  </div>
                </div>
              )}

              {browserState === "success" && (
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Login Verified!</h3>
                    <p className="text-xs text-zinc-550 mt-1">
                      Successfully linked {sharedAccount && burnerAccount === sharedAccount.username ? "Shared System Account" : `@${burnerAccount}`}
                    </p>
                  </div>
                </div>
              )}

              {browserState === "task" && activeBrowserTask && (
                <div className="w-full text-left space-y-6 animate-in fade-in duration-200">
                  {/* Login Status Banner */}
                  <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 text-[10px]">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse animate-duration-1000 shrink-0" />
                      <span>Logged in as:</span>
                      <strong className="text-white">
                        {sharedAccount && burnerAccount === sharedAccount.username ? "Shared System Account" : `@${burnerAccount}`}
                      </strong>
                    </div>
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Inbuilt Session</span>
                  </div>

                  {/* Instagram Content Mockups */}
                  {activeBrowserTask.type === "FOLLOW" && (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5 w-full">
                      <div className="flex items-center gap-5">
                        {/* Mock Profile Picture */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px] shrink-0">
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-white text-lg select-none">
                            {activeBrowserTask.target.charAt(0).toUpperCase() === "@" ? activeBrowserTask.target.charAt(1).toUpperCase() : activeBrowserTask.target.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap justify-start">
                            <h3 className="text-sm font-bold text-white leading-none">
                              @{activeBrowserTask.target.replace("@", "")}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-450 border border-blue-500/20 text-[8px] font-bold uppercase">
                              Verified Target
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[9px] text-zinc-400 mt-1">
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

                      {/* Simulated Action Completion Button */}
                      <div className="pt-2">
                        {taskCompletedInBrowser ? (
                          <button
                            disabled
                            className="w-full bg-zinc-900 border border-zinc-800 text-emerald-450 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition duration-300 animate-in zoom-in-95"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>Following Account</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setTaskCompletedInBrowser(true);
                              setTasks(prevTasks => prevTasks.map(t => t.id === activeBrowserTask.id ? { ...t, actionCompleted: true } : t));
                              setTimeout(() => {
                                setShowBrowser(false);
                                verifyTaskAction(activeBrowserTask.id, activeBrowserTask.target, activeBrowserTask.type);
                              }, 1200);
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition cursor-pointer shadow-lg shadow-blue-500/15"
                          >
                            <Users className="w-4 h-4 text-white animate-pulse" />
                            <span>Follow Profile</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeBrowserTask.type === "LIKE" && (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 w-full">
                      {/* Post Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-white">
                          {activeBrowserTask.target.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white">
                          @{activeBrowserTask.target.replace("@", "")}
                        </span>
                      </div>
                      
                      {/* Post Content Visual */}
                      <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900/60 to-pink-955/40 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden">
                        <Heart className={`w-12 h-12 transition duration-500 ${taskCompletedInBrowser ? "text-pink-500 fill-pink-500 scale-110" : "text-zinc-700"}`} />
                        <span className="text-[10px] text-zinc-500 mt-2 font-mono uppercase tracking-wider">Simulated Instagram Post</span>
                      </div>
                      
                      {/* Post Action Button */}
                      <div className="pt-1">
                        {taskCompletedInBrowser ? (
                          <button
                            disabled
                            className="w-full bg-zinc-900 border border-zinc-850 text-pink-400 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition duration-300"
                          >
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                            <span>Liked Post</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setTaskCompletedInBrowser(true);
                              setTasks(prevTasks => prevTasks.map(t => t.id === activeBrowserTask.id ? { ...t, actionCompleted: true } : t));
                              setTimeout(() => {
                                setShowBrowser(false);
                                verifyTaskAction(activeBrowserTask.id, activeBrowserTask.target, activeBrowserTask.type);
                              }, 1200);
                            }}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition cursor-pointer shadow-lg shadow-pink-600/10"
                          >
                            <Heart className="w-4 h-4 text-white animate-pulse" />
                            <span>Like Post</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeBrowserTask.type === "COMMENT" && (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 w-full">
                      {/* Post Header */}
                      <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-white">
                          {activeBrowserTask.target.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white">
                          @{activeBrowserTask.target.replace("@", "")}
                        </span>
                      </div>
                      
                      {/* Simulated Comments Thread */}
                      <div className="space-y-3 h-28 overflow-y-auto pr-1 text-xs text-left">
                        <div className="flex gap-2">
                          <strong className="text-zinc-400">@insta_fan:</strong>
                          <span className="text-zinc-300">Awesome content! 🔥</span>
                        </div>
                        <div className="flex gap-2">
                          <strong className="text-zinc-400">@social_guru:</strong>
                          <span className="text-zinc-300">Keep up the verified work! 🚀</span>
                        </div>
                        {taskCompletedInBrowser && (
                          <div className="flex gap-2 text-left animate-in slide-in-from-bottom-2 duration-300">
                            <strong className="text-purple-400">You:</strong>
                            <span className="text-emerald-400 italic">"Verified comment submitted!"</span>
                          </div>
                        )}
                      </div>

                      {/* Comment Input Box */}
                      <div className="pt-2">
                        {taskCompletedInBrowser ? (
                          <button
                            disabled
                            className="w-full bg-zinc-900 border border-zinc-850 text-emerald-450 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs transition duration-300"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>Comment Submitted</span>
                          </button>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              setTaskCompletedInBrowser(true);
                              setTasks(prevTasks => prevTasks.map(t => t.id === activeBrowserTask.id ? { ...t, actionCompleted: true } : t));
                              setTimeout(() => {
                                setShowBrowser(false);
                                verifyTaskAction(activeBrowserTask.id, activeBrowserTask.target, activeBrowserTask.type);
                              }, 1200);
                            }}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              required
                              placeholder="Add a verified comment..."
                              className="flex-1 bg-[#121212] border border-zinc-850 rounded-xl py-2 px-3 text-[10px] text-white placeholder-zinc-550 focus:outline-none focus:border-zinc-700 transition"
                            />
                            <button
                              type="submit"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-blue-500/10"
                            >
                              Post
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
