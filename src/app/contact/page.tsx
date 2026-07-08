"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle, Loader2, Zap, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-5 animate-in zoom-in-95 fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Message Sent!</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">Thank you for reaching out. We typically respond within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold text-purple-300 mb-4">
          <MessageSquare className="w-3 h-3" />
          <span>CONTACT US</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Get in <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Have a question, partnership inquiry, or bug report? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Message</label>
              <textarea
                required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>
            <button
              type="submit" disabled={sending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-purple-600/10 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending...</span></>
              ) : (
                <><Send className="w-4 h-4" /><span>Send Message</span></>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 inline-block mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Email</h3>
            <p className="text-xs text-zinc-400">support@socialx.io</p>
          </div>

          <div className="p-5 sm:p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 inline-block mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Location</h3>
            <p className="text-xs text-zinc-400">Remote-first, Worldwide</p>
          </div>

          <div className="p-5 sm:p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 inline-block mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Response Time</h3>
            <p className="text-xs text-zinc-400">Within 24 hours on business days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
