import { Shield, Eye, Database, Lock, Users, Globe, AlertTriangle, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-purple-300 mb-4">
          <Shield className="w-3 h-3" />
          <span>PRIVACY POLICY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Privacy <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Policy</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Last updated: July 2026. Your privacy is fundamental to our platform.
        </p>
      </div>

      <div className="space-y-8">
        {/* Sections */}
        {[
          {
            icon: <Database className="w-5 h-5" />,
            color: "text-blue-400",
            title: "Information We Collect",
            content: [
              "Account information: username, email address, and hashed password.",
              "Linked Instagram account data: username, follower/following counts, and profile picture URL. Passwords are only stored if you opt-in to the community shared pool.",
              "Usage data: task completions, credit transactions, and campaign activity.",
              "Technical data: IP address, browser type, and device information for security purposes.",
            ]
          },
          {
            icon: <Eye className="w-5 h-5" />,
            color: "text-purple-400",
            title: "How We Use Your Data",
            content: [
              "To operate and maintain the SocialX platform and verify task completions.",
              "To process credit transactions and manage campaign delivery.",
              "To prevent fraud, abuse, and ensure the integrity of the engagement network.",
              "To communicate important updates, security alerts, and service changes.",
            ]
          },
          {
            icon: <Lock className="w-5 h-5" />,
            color: "text-emerald-400",
            title: "Data Security",
            content: [
              "All passwords are hashed using industry-standard bcrypt encryption.",
              "Database connections are encrypted and access is restricted to authenticated services only.",
              "Instagram credentials for shared pools are stored with additional encryption layers.",
              "We conduct regular security reviews and monitoring for unauthorized access.",
            ]
          },
          {
            icon: <Users className="w-5 h-5" />,
            color: "text-pink-400",
            title: "Data Sharing",
            content: [
              "We do NOT sell your personal data to third parties.",
              "Task completion data (username only) is visible to campaign owners for verification.",
              "Aggregated, anonymized statistics may be used for platform improvements.",
              "We may disclose information if required by law or to protect user safety.",
            ]
          },
          {
            icon: <Globe className="w-5 h-5" />,
            color: "text-cyan-400",
            title: "Third-Party Services",
            content: [
              "We use RapidAPI's Instagram endpoints for profile verification and follow detection.",
              "Authentication is handled through NextAuth.js with secure JWT token management.",
              "No advertising or tracking SDKs are embedded in the platform.",
            ]
          },
          {
            icon: <AlertTriangle className="w-5 h-5" />,
            color: "text-yellow-400",
            title: "Your Rights",
            content: [
              "You can request deletion of your account and all associated data at any time.",
              "You can unlink your Instagram profile and remove stored credentials.",
              "You can export your transaction history and task completion records.",
              "You can opt-out of the shared credential pool without affecting your account.",
            ]
          },
        ].map((section, idx) => (
          <div key={idx} className="p-5 sm:p-7 bg-zinc-950/40 border border-zinc-900 rounded-2xl sm:rounded-3xl">
            <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-zinc-900/60 ${section.color}`}>
                {section.icon}
              </div>
              {section.title}
            </h2>
            <ul className="space-y-2.5">
              {section.content.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-zinc-400 leading-relaxed flex gap-2">
                  <span className="text-purple-500 shrink-0 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-950/30 to-pink-950/20 border border-purple-500/10 rounded-3xl text-center">
          <Mail className="w-6 h-6 text-purple-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Questions about your privacy?</h3>
          <p className="text-xs text-zinc-400 mb-4">Contact our privacy team at <span className="text-purple-300 font-bold">privacy@socialx.io</span></p>
        </div>
      </div>
    </div>
  );
}
