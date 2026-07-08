"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function RouteTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show fast loading indicator on route change
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400); // Fast 400ms transition

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      {/* Sleek Neon Top Progress Line */}
      <div className="w-full h-[3px] bg-zinc-950/20 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-loading-bar" />
      </div>

      {/* Subtle techy spinner in top-right */}
      <div className="absolute top-4 right-4 bg-zinc-950/90 border border-zinc-900 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-xl shadow-black/50 animate-in fade-in slide-in-from-top-1 duration-200">
        <Loader2 className="w-3.5 h-3.5 text-purple-500 animate-spin" />
        <span className="text-[9px] font-bold text-zinc-400 font-mono uppercase tracking-wider">Loading...</span>
      </div>
    </div>
  );
}
