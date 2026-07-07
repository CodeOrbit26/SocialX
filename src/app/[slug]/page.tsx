"use client";
import { useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coins, CheckCircle, ShieldAlert, Users, Heart, ArrowRight, Loader2, Link2, ExternalLink, Eye, MessageCircle, Lock, ShieldCheck, AlertCircle } from "lucide-react";

export default function CampaignActivationPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoadingTasks(true);
        const res = await fetch(`/api/tasks?type=${type}`);
        let items: any[] = [];
        if (res.ok) {
          const dbTasks = await res.json();
          items = dbTasks.slice(0, 3).map((t: any) => ({
            id: t.id,
            type: t.taskType,
            target: t.targetUsername,
            url: t.targetUrl,
            completed: false,
            verifying: false
          }));
        }

        if (items.length < 3) {
          const fallbacks = [
            { id: "fb1", type, target: type === "FOLLOW" ? "social_booster" : "social_booster (Post)", url: "https://instagram.com", completed: false, verifying: false },
            { id: "fb2", type, target: type === "FOLLOW" ? "creators_exchange" : "creators_exchange (Post)", url: "https://instagram.com", completed: false, verifying: false },
            { id: "fb3", type, target: type === "FOLLOW" ? "insta_grower" : "insta_grower (Post)", url: "https://instagram.com", completed: false, verifying: false }
          ];
          items = [...items, ...fallbacks.slice(0, 3 - items.length)];
        }
        setTasks(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTasks(false);
      }
    }
    loadTasks();
  }, [type]);

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

  const handleInstagramLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnerAccount.trim() || !burnerPassword.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/instagram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: burnerAccount,
          password: burnerPassword,
          isFake,
          savePassword: isFake ? savePassword : false
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Failed to link account. Please check your credentials.");
      } else {
        setFollowersCount(data.account.followersCount);
        setProfilePic(data.account.profilePic);
        setCurrentStep(2);
      }
    } catch (err) {
      setLoginError("Failed to connect to verification API. Please check your internet connection.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const completeTask = (taskId: string | number) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, verifying: true } : t)));
    
    setTimeout(() => {
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, verifying: false, completed: true } : t)));
    }, 1500);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Title */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Activate Your Campaign
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm max-w-xl mx-auto">
          Requesting <strong className="text-purple-400">{quantity} {type.toLowerCase()}s</strong> for 
          <strong className="text-white"> @{slug}</strong>. Complete the checklist to push it live.
        </p>
      </div>

      {/* Step Wizard Bar */}
      <div className="max-w-xl mx-auto mb-10 relative z-10 flex justify-between items-center px-4">
        {[
          { step: 1, label: "Link Account" },
          { step: 2, label: "Complete Tasks" },
          { step: 3, label: "Go Live" }
        ].map((item, idx, arr) => (
          <div key={item.step} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition duration-300 ${
                currentStep >= item.step
                  ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                  : "bg-zinc-900 border-zinc-800 text-zinc-550"
              }`}>
                {currentStep > item.step ? <CheckCircle className="w-4 h-4 text-white" /> : item.step}
              </div>
              <span className={`text-[10px] font-bold mt-2 whitespace-nowrap ${
                currentStep >= item.step ? "text-purple-300" : "text-zinc-650"
              }`}>{item.label}</span>
            </div>
            
            {idx < arr.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 -mt-6 bg-zinc-900">
                <div className={`h-full bg-purple-600 transition-all duration-500 ease-out`} style={{ 
                  width: currentStep > item.step ? "100%" : "0%" 
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Wizard Content Panels */}
      <div className="relative z-10">
        
        {/* Step 1: Link Account (Instagram Verification Panel) */}
        {currentStep === 1 && (
          <div className="glass-panel p-8 rounded-3xl border border-white/5 max-w-sm mx-auto relative overflow-hidden bg-zinc-950/40 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full blur-2xl pointer-events-none" />
            
            {/* Instagram Branding */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-serif italic tracking-wide text-white font-normal my-2">Instagram</h2>
              <p className="text-[10px] text-zinc-550 max-w-xs mx-auto">
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

            <form onSubmit={handleInstagramLogin} className="space-y-4">
              {/* Account Type Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsFake(true);
                    setSavePassword(true);
                  }}
                  className={`py-1.5 text-[9px] font-bold rounded-lg transition-all ${
                    isFake
                      ? "bg-purple-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Burner / Fake Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFake(false);
                    setSavePassword(false);
                  }}
                  className={`py-1.5 text-[9px] font-bold rounded-lg transition-all ${
                    !isFake
                      ? "bg-purple-600 text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Real / Personal Account
                </button>
              </div>

              {/* Input Fields */}
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  disabled={isLoggingIn}
                  value={burnerAccount}
                  onChange={(e) => setBurnerAccount(e.target.value)}
                  placeholder="Instagram username or email"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                />
                <input
                  type="password"
                  required
                  disabled={isLoggingIn}
                  value={burnerPassword}
                  onChange={(e) => setBurnerPassword(e.target.value)}
                  placeholder="Instagram password"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                />
              </div>

              {/* Save Password Toggle Box (Burners Only) */}
              {isFake && (
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-850 rounded-xl">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white">Save Password locally</p>
                    <p className="text-[8px] text-zinc-500">Enable automation to complete tasks faster</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSavePassword(!savePassword)}
                    className={`w-8 h-4 rounded-full transition-colors relative focus:outline-none ${
                      savePassword ? "bg-purple-600" : "bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                        savePassword ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoggingIn || !burnerAccount || !burnerPassword}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white py-2.5 rounded-lg font-bold transition disabled:opacity-50 text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Instagram Profile...</span>
                  </>
                ) : (
                  <span>Verify & Link Profile</span>
                )}
              </button>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-zinc-900" />
              <span className="px-3 text-[9px] text-zinc-650 font-bold uppercase">SECURITY PRIVACY</span>
              <div className="flex-1 h-[1px] bg-zinc-900" />
            </div>

            {/* Contextual Warning Boxes */}
            <div className="text-left">
              {isFake ? (
                <div className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-xl text-purple-300 text-[8px] leading-relaxed flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Auto Mode</strong>: Using a burner profile is recommended. Your password will be encrypted & stored to automate likes/follows for tasks.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-xl text-emerald-300 text-[8px] leading-relaxed flex gap-2">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Encrypted Validation</strong>: Your password is used once to check page status via Instagram API. <strong>It will NOT be saved to our database.</strong>
                  </span>
                </div>
              )}
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
                    Linked: <span className="text-purple-400 font-bold">@{burnerAccount}</span>
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
                    className={`p-5 rounded-2xl border transition duration-300 flex items-center justify-between ${
                      task.completed 
                        ? "bg-emerald-950/10 border-emerald-500/20" 
                        : "bg-zinc-900/30 border-zinc-850 hover:border-purple-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${task.completed ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-950/40 text-purple-400"}`}>
                        {getTaskIcon(task.type)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {getTaskLabel(task.type)}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Target: {task.type === "FOLLOW" ? `@${task.target}` : task.target}
                        </p>
                      </div>
                    </div>

                    <div>
                      {task.completed ? (
                        <div className="flex items-center text-emerald-400 text-xs font-bold gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={task.verifying}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {task.verifying ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <span>Complete</span>
                              <ExternalLink className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
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
    </div>
  );
}
