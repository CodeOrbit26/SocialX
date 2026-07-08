"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  ArrowRight, Coins, ShieldCheck, Sparkles, TrendingUp, Users, Heart, Eye, 
  MessageCircle, Zap, Award, CheckCircle, ExternalLink, Loader2
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-8rem)] bg-[#070b14]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-[2px] mx-auto mb-4 animate-spin animate-duration-3000">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
              <Coins className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Securing connection...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden flex flex-col justify-center min-h-[calc(100vh-8rem)] bg-[#070b14]">
      {/* Background Glowing Ambiance */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 relative z-10 w-full">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          {/* Animated Feature Badge */}
          <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-500/30 px-4 py-2 rounded-full text-xs font-bold text-purple-300 mb-8 animate-bounce shadow-lg shadow-purple-900/10">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>GUEST MODE ACTIVE • NO LOGIN REQUIRED</span>
          </div>

          {/* Hero Copy */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-[1.05]">
            Get Real Followers & Likes <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Without Spending a Dime
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed">
            The ultimate collaborative growth network for creators. Complete simple engagement tasks to earn credits, then launch your own campaigns to boost your Instagram organically.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/marketplace"
              className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-purple-600/25 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Grow Your Profile Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-8 py-4 rounded-2xl font-bold transition duration-200 flex items-center justify-center cursor-pointer"
            >
              <span>See How it Works</span>
            </a>
          </div>
        </div>

        {/* INTERACTIVE MOCK DASHBOARD */}
        <div className="relative max-w-5xl mx-auto mb-12 sm:mb-28">
          {/* Decorative Floating Elements */}
          <div className="absolute -top-6 -left-6 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 shadow-xl hidden sm:flex items-center space-x-3 animate-bounce pointer-events-none z-20">
            <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
              <Heart className="w-5 h-5 fill-pink-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Latest Activity</p>
              <p className="text-xs font-black text-white">+250 Likes Sent</p>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 shadow-xl hidden sm:flex items-center space-x-3 animate-pulse pointer-events-none z-20">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Campaign Live</p>
              <p className="text-xs font-black text-white">Prerequisites Complete</p>
            </div>
          </div>

          {/* Core Mock Screen */}
          <div className="glass-panel rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl relative overflow-hidden bg-zinc-950/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
            
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <span className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <span className="text-[10px] text-zinc-600 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">
                app.socialx.io/marketplace
              </span>
              <div className="w-12" />
            </div>

            {/* Mock Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
              
              {/* Creator Card */}
              <div className="md:col-span-5 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-850 space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LAUNCH CAMPAIGN</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Target profile or post link</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300">
                      https://instagram.com/mr.abhay_26
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Engagements wanted</label>
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-300">
                      100 Followers
                    </div>
                  </div>
                  
                  {/* Verified Indicator */}
                  <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30 overflow-hidden">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white">@mr.abhay_26</p>
                      <p className="text-[8px] text-zinc-500">Verified • 1.2K Followers</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-purple-400 ml-auto" />
                  </div>

                  <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-bold text-[10px] text-center flex items-center justify-center gap-1 shadow-md shadow-purple-600/10">
                    <span>Send Request</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Feed Card */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-purple-400" /> Live Missions
                  </span>
                  <div className="flex space-x-1">
                    <span className="text-[8px] px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold">ALL</span>
                    <span className="text-[8px] px-2 py-0.5 rounded text-zinc-600">FOLLOW</span>
                    <span className="text-[8px] px-2 py-0.5 rounded text-zinc-600">LIKE</span>
                  </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-3">
                  {[
                    { target: "instagram_creator", type: "FOLLOW", reward: "2.0" },
                    { target: "p/C9Hj1k1N72s", type: "LIKE", reward: "1.0" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[7px] px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-900 text-purple-400 font-bold uppercase">{item.type}</span>
                          <span className="text-[9px] font-bold text-white">@{item.target}</span>
                        </div>
                        <p className="text-[7px] text-zinc-600">Launched by anonymous guest</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-bold text-yellow-500">+{item.reward} Cr</span>
                        <div className="bg-zinc-800 text-white px-2.5 py-1 rounded text-[8px] font-bold border border-zinc-700">
                          Complete
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* WORKFLOW STEPS ("HOW IT WORKS") */}
        <div id="how-it-works" className="mb-32 relative scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How SocialX Works</h2>
            <p className="text-zinc-500 text-xs mt-2">A fair, collaborative circle built to boost growth without bots.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: <Coins className="w-5 h-5 text-purple-400" />,
                title: "Complete Target Tasks",
                desc: "Check the live marketplace and complete simple social tasks from other creators to earn execution credits."
              },
              {
                step: "2",
                icon: <ShieldCheck className="w-5 h-5 text-pink-400" />,
                title: "Paste URL Proof",
                desc: "Paste the verification link or screenshot. Our backend will cross-verify the engagement to keep the network clean."
              },
              {
                step: "3",
                icon: <Zap className="w-5 h-5 text-indigo-400" />,
                title: "Launch Your Campaign",
                desc: "Use your credits to request followers, likes, or comments. Watch real community members boost your profiles."
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="glass-panel p-8 rounded-3xl border border-white/5 text-left relative overflow-hidden glass-panel-hover bg-zinc-950/20"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 font-black text-sm text-zinc-400 relative">
                  <span className="absolute -top-2 -left-2 w-5 h-5 bg-purple-600/10 rounded-full flex items-center justify-center text-[9px] font-black text-purple-400 border border-purple-500/20">
                    {item.step}
                  </span>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CORE APP STATISTICS */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 max-w-4xl mx-auto mb-32 bg-zinc-950/20 backdrop-blur-xl grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-black text-white tracking-tight">10K+</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Total Users</p>
          </div>
          <div className="border-x border-zinc-900">
            <p className="text-3xl font-black text-white tracking-tight">250K+</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Actions Verified</p>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-400 tracking-tight">100%</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Real & Safe</p>
          </div>
        </div>

        {/* FEATURE DETAILS */}
        <div className="mb-32">
          <div className="grid md:grid-cols-4 gap-8 text-left">
            {[
              {
                icon: <Heart className="w-6 h-6 text-pink-500" />,
                title: "Organic Likes",
                desc: "Boost your post visibility with engagements from active profiles."
              },
              {
                icon: <Users className="w-6 h-6 text-purple-500" />,
                title: "Permanent Followers",
                desc: "Grow your follower count with real users who browse your profile."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
                title: "100% Safe",
                desc: "We never ask for your Instagram account password. Authenticate securely."
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
                title: "Algorithmic Growth",
                desc: "Get an initial interaction spike to trigger organic recommendation loops."
              }
            ].map((feat, idx) => (
              <div key={idx} className="p-4 bg-zinc-950/20 rounded-2xl border border-zinc-900/50">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl w-fit mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA BANNER */}
        <div className="glass-panel p-10 md:p-14 rounded-3xl border border-white/5 text-center relative overflow-hidden bg-gradient-to-r from-purple-950/10 via-zinc-950/40 to-pink-950/10 max-w-5xl mx-auto shadow-2xl">
          <div className="absolute top-0 left-0 w-44 h-44 bg-purple-500/5 rounded-br-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-44 h-44 bg-pink-500/5 rounded-tl-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to Supercharge Your Social Media?
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Link your campaign, complete your prerequisites, and launch your channel live inside the SocialX network today.
          </p>
          
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-purple-600/25 transition duration-200 cursor-pointer text-xs"
          >
            <span>Launch Free Campaign</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
