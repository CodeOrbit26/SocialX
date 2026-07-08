import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black/80 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-3 group">
              <span className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </span>
              <span className="text-base font-extrabold tracking-tight">
                <span className="text-white">Social</span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">X</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
              The collaborative growth network for Instagram creators.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-xs text-zinc-500 hover:text-white transition">Marketplace</Link></li>
              <li><Link href="/grow" className="text-xs text-zinc-500 hover:text-white transition">Grow Channel</Link></li>
              <li><Link href="/dashboard" className="text-xs text-zinc-500 hover:text-white transition">Dashboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-xs text-zinc-500 hover:text-white transition">Documentation</Link></li>
              <li><Link href="/contact" className="text-xs text-zinc-500 hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-xs text-zinc-500 hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-zinc-600">
            &copy; {new Date().getFullYear()} SocialX. Powered by decentralized user engagement.
          </p>
          <div className="flex items-center space-x-4 text-[10px] text-zinc-600">
            <Link href="/privacy" className="hover:text-zinc-400 transition">Privacy</Link>
            <Link href="/docs" className="hover:text-zinc-400 transition">Docs</Link>
            <Link href="/contact" className="hover:text-zinc-400 transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
