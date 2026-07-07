"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Users, ShieldAlert, Coins, CheckSquare, ShieldCheck, 
  Loader2, UserX, UserCheck, CheckCircle2, MessageSquareWarning 
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  credits: number;
  reputationScore: number;
  role: string;
  isSuspended: boolean;
  createdAt: string;
}

interface AdminReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { username: string };
  reportedUser: { username: string };
}

interface AdminStats {
  totalUsers: number;
  totalSystemCredits: number;
  activeTasksCount: number;
  totalCompletionsCount: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Credit update helper state
  const [creditChangeVal, setCreditChangeVal] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const userRole = (session.user as any).role;
      if (userRole !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchAdminData();
      }
    }
  }, [status]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setReports(data.reports);
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-suspend", userId }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdjustCredits = async (userId: string) => {
    const val = parseFloat(creditChangeVal[userId] || "0");
    if (isNaN(val) || val === 0) return;

    setActionLoadingId(`${userId}-credits`);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-credits", userId, creditsChange: val }),
      });
      if (res.ok) {
        setCreditChangeVal(prev => ({ ...prev, [userId]: "" }));
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    setActionLoadingId(reportId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve-report", reportId }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading Administration Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-purple-500" />
          <span>SocialX Administration</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Global platform metrics, abuse moderation, and users management.</p>
      </div>

      {/* Global Admin Metrics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Total Members</span>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">System Credits</span>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{stats.totalSystemCredits.toFixed(0)}</h3>
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Active Campaigns</span>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{stats.activeTasksCount}</h3>
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Total Submissions</span>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{stats.totalCompletionsCount}</h3>
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Management Directory (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">Member Directory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-semibold">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Balance</th>
                    <th className="pb-3">Reputation</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-900 last:border-0">
                      <td className="py-4">
                        <div className="font-semibold text-white">@{user.username}</div>
                        <div className="text-[10px] text-zinc-500">{user.email}</div>
                        {user.role === "ADMIN" && (
                          <span className="text-[9px] px-1 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold uppercase mt-1 inline-block">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-zinc-300">
                        <div>{user.credits.toFixed(1)} CR</div>
                        {/* Adjust credits form */}
                        <div className="mt-1 flex items-center space-x-1">
                          <input
                            type="number"
                            placeholder="+/-"
                            className="bg-zinc-950 border border-zinc-800 w-16 px-1.5 py-0.5 rounded text-[10px] text-white"
                            value={creditChangeVal[user.id] || ""}
                            onChange={(e) => setCreditChangeVal(prev => ({ ...prev, [user.id]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleAdjustCredits(user.id)}
                            disabled={actionLoadingId === `${user.id}-credits`}
                            className="bg-zinc-850 hover:bg-zinc-800 px-2 py-0.5 rounded text-[9px] font-bold border border-zinc-700 text-zinc-300 cursor-pointer"
                          >
                            Set
                          </button>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-zinc-300">{user.reputationScore.toFixed(0)}%</td>
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleSuspend(user.id)}
                          disabled={actionLoadingId === user.id || user.id === (session?.user as any).id}
                          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition text-[10px] ${
                            user.isSuspended 
                              ? "bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900" 
                              : "bg-red-950 border border-red-800 text-red-300 hover:bg-red-900"
                          } disabled:opacity-50`}
                        >
                          {user.isSuspended ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Abuse & Suspicious Reports Queue */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-red-400 animate-pulse" />
              <span>Abuse Queue</span>
            </h2>

            {reports.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No abuse reports in the moderation queue.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                    <div className="flex justify-between items-start text-[10px]">
                      <div>
                        <span className="text-zinc-500">Reporter:</span>{" "}
                        <span className="text-white font-semibold">@{report.reporter.username}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        report.status === "PENDING" 
                          ? "bg-yellow-950 border border-yellow-800 text-yellow-300"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-500"
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 block">Reported Account:</span>
                      <span className="text-xs font-bold text-red-400">@{report.reportedUser.username}</span>
                    </div>

                    <p className="text-xs text-zinc-400 bg-zinc-900/60 p-2 rounded border border-zinc-900 italic">
                      "{report.reason}"
                    </p>

                    {report.status === "PENDING" && (
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        disabled={actionLoadingId === report.id}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-1.5 text-[10px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Resolve Report</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
