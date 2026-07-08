import Link from "next/link";
import { BookOpen, Coins, Users, ShieldCheck, Zap, ArrowRight, CheckCircle, Sparkles, TrendingUp, Award } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-purple-300 mb-4">
          <BookOpen className="w-3 h-3" />
          <span>DOCUMENTATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          How <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">SocialX</span> Works
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          SocialX is a decentralized engagement marketplace where creators help each other grow organically through a credit-based system.
        </p>
      </div>

      {/* Getting Started */}
      <section className="mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Getting Started
        </h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Create an Account", desc: "Register with your email and get 100 free credits instantly. No payment required." },
            { step: "2", title: "Link a Burner Profile", desc: "Connect a secondary Instagram account for secure task verification. Never use your main account." },
            { step: "3", title: "Complete Tasks", desc: "Browse the Marketplace for available missions — follow profiles, like posts, and earn credits." },
            { step: "4", title: "Launch Campaigns", desc: "Spend your earned credits on the Grow page to get real followers and engagement on your own content." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-4 sm:p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl hover:border-purple-500/20 transition">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Concepts */}
      <section className="mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          Core Concepts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <Coins className="w-5 h-5" />, title: "Credits", desc: "The internal currency of SocialX. Earn by completing tasks, spend to create campaigns. 1 credit ≈ 1 engagement action.", color: "text-yellow-400" },
            { icon: <Users className="w-5 h-5" />, title: "Campaigns", desc: "A campaign is a request for engagement on your content. Set a target, specify reward per action, and let the community deliver.", color: "text-blue-400" },
            { icon: <ShieldCheck className="w-5 h-5" />, title: "Verification", desc: "All task completions are verified through live Instagram API handshakes. Fake completions are automatically rejected.", color: "text-emerald-400" },
            { icon: <TrendingUp className="w-5 h-5" />, title: "Reputation", desc: "Your reputation score reflects your reliability. Higher scores unlock better tasks and higher rewards.", color: "text-purple-400" },
          ].map((item) => (
            <div key={item.title} className="p-5 sm:p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl hover:border-purple-500/20 transition">
              <div className={`p-2.5 rounded-xl bg-zinc-900/60 inline-block ${item.color} mb-3`}>
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Task Types */}
      <section className="mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Task Types
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-3 px-4 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Type</th>
                <th className="py-3 px-4 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Action</th>
                <th className="py-3 px-4 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Avg Reward</th>
                <th className="py-3 px-4 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {[
                { type: "FOLLOW", action: "Follow a profile", reward: "2.0 credits", verify: "API handshake" },
                { type: "LIKE", action: "Like a post", reward: "1.0 credit", verify: "Engagement check" },
                { type: "COMMENT", action: "Comment on a post", reward: "3.0 credits", verify: "Content scan" },
                { type: "VIEW", action: "View a story/reel", reward: "0.5 credits", verify: "View count" },
              ].map((row) => (
                <tr key={row.type} className="hover:bg-zinc-950/40 transition">
                  <td className="py-3 px-4 font-bold text-purple-300">{row.type}</td>
                  <td className="py-3 px-4 text-zinc-300">{row.action}</td>
                  <td className="py-3 px-4 text-yellow-400 font-bold">{row.reward}</td>
                  <td className="py-3 px-4 text-zinc-400">{row.verify}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            { q: "Is SocialX free to use?", a: "Yes. You get 100 free credits upon registration. Earn more by completing marketplace tasks." },
            { q: "Why do I need a burner account?", a: "For security. Burner accounts protect your main Instagram from any risk. We strongly advise never linking your primary profile." },
            { q: "How are follows verified?", a: "We use live Instagram API queries to check the follower/following count changes. The system detects increases in real-time." },
            { q: "Can I withdraw credits?", a: "Credits are internal and cannot be withdrawn. They are used exclusively for launching campaigns within the platform." },
          ].map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                {item.q}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 ml-6 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center p-8 sm:p-12 bg-gradient-to-br from-purple-950/30 to-pink-950/20 border border-purple-500/10 rounded-3xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to start growing?</h3>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6">Join thousands of creators using SocialX to grow organically.</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/15 transition group"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
