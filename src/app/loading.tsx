"use client";

import { Coins } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-[#070b14]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
      {/* Top Neon Progress Line (looks like premium bar) */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-950 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-loading-bar" />
      </div>

      <div className="text-center space-y-4">
        {/* Pulsing Glowing Circle */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-pulse" />
          <div className="w-14 h-14 rounded-full border border-purple-500/20 border-t-purple-500 animate-spin" />
          <Coins className="absolute w-6 h-6 text-purple-400 animate-pulse" />
        </div>

        <div className="space-y-1 animate-pulse">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Loading Mission Center</h4>
          <p className="text-[10px] text-zinc-500 font-mono">syncing_ledger_balances.log</p>
        </div>
      </div>
    </div>
  );
}
