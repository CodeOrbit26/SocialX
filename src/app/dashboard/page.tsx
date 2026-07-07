"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Coins, Trophy, CheckSquare, PlusCircle, Clock, CheckCircle2, XCircle, 
  ExternalLink, ArrowUpRight, ArrowDownLeft, ShieldAlert, BarChart3, Loader2, RefreshCw 
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  taskType: string;
  targetUsername: string;
  targetUrl: string;
  reward: number;
  quantity: number;
  completedCount: number;
  status: string;
  createdAt: string;
}

interface TaskCompletion {
  id: string;
  taskId: string;
  workerId: string;
  proofUrl: string;
  status: string;
  submittedAt: string;
  task: Task;
  worker?: {
    username: string;
    reputationScore: number;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface DashboardData {
  credits: number;
  reputationScore: number;
  role: string;
  activeTasks: Task[];
  completedTasksCreated: Task[];
  pendingApprovals: TaskCompletion[];
  completionsSubmitted: TaskCompletion[];
  transactions: Transaction[];
  stats: {
    totalEarned: number;
    totalSpent: number;
    tasksCompletedCount: number;
    tasksCreatedCount: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reportWorkerId, setReportWorkerId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (completionId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(completionId);
    try {
      const res = await fetch("/api/tasks/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionId, action }),
      });
      if (res.ok) {
        // Reload dashboard stats
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const submitReport = async () => {
    if (!reportWorkerId || !reportReason) return;
    setReportLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId: reportWorkerId, reason: reportReason }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setReportReason("");
        setTimeout(() => {
          setReportWorkerId(null);
          setReportSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Creator Dashboard</h1>
          <p className="text-zinc-400 text-sm">Welcome back, {session?.user?.name}. Monitor your stats and verify proofs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition cursor-pointer text-zinc-400 hover:text-white"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/create-task"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md shadow-purple-600/10 transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Task</span>
          </Link>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Credit balance */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 glow-purple">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Credit Balance</span>
            <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400"><Coins className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{data.credits.toFixed(1)}</h3>
          <p className="text-[10px] text-zinc-500">Earned {(data.stats.totalEarned).toFixed(0)} / Spent {(data.stats.totalSpent).toFixed(0)}</p>
        </div>

        {/* Reputation Score */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reputation Score</span>
            <span className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400"><Trophy className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{data.reputationScore.toFixed(1)}%</h3>
          <p className="text-[10px] text-zinc-500">Lower rep limits task access</p>
        </div>

        {/* Completed tasks */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tasks Completed</span>
            <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckSquare className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{data.stats.tasksCompletedCount}</h3>
          <p className="text-[10px] text-zinc-500">Tasks completed for others</p>
        </div>

        {/* Created Tasks */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">My Campaigns</span>
            <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><BarChart3 className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{data.stats.tasksCreatedCount}</h3>
          <p className="text-[10px] text-zinc-500">{data.activeTasks.length} active campaigns</p>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Verification Queue & Active Tasks (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Approvals */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Pending Approvals ({data.pendingApprovals.length})</span>
            </h2>

            {data.pendingApprovals.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No pending submissions to approve. Good job!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.pendingApprovals.map((comp) => (
                  <div key={comp.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-semibold uppercase">
                          {comp.task.taskType}
                        </span>
                        <span className="text-xs text-zinc-400">submitted by</span>
                        <span className="text-xs text-white font-semibold">@{comp.worker?.username}</span>
                        <span className="text-[10px] text-yellow-400">(Rep: {comp.worker?.reputationScore.toFixed(0)}%)</span>
                      </div>
                      <p className="text-xs text-zinc-500">Target Username: <span className="text-zinc-300">@{comp.task.targetUsername}</span></p>
                      
                      {/* Proof link */}
                      <div className="pt-2 flex items-center space-x-2">
                        <span className="text-xs text-zinc-500">Proof:</span>
                        <a 
                          href={comp.proofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-purple-400 hover:text-purple-300 font-semibold"
                        >
                          <span className="max-w-[150px] truncate">{comp.proofUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => handleApproval(comp.id, "APPROVE")}
                        disabled={processingId === comp.id}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(comp.id, "REJECT")}
                        disabled={processingId === comp.id}
                        className="bg-red-950 border border-red-800 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setReportWorkerId(comp.workerId)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition"
                        title="Report Worker for Fraud"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Campaigns */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4">My Active Campaigns</h2>
            {data.activeTasks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-500">You don't have any active campaigns right now.</p>
                <Link href="/create-task" className="text-xs text-purple-400 font-semibold hover:underline mt-1 block">
                  Create one now to get engagement
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.activeTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold mr-2 uppercase">
                          {task.taskType}
                        </span>
                        <a href={task.targetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white font-semibold hover:underline">
                          @{task.targetUsername}
                        </a>
                      </div>
                      <span className="text-xs font-bold text-purple-300">{task.reward} credits / action</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>Progress: {task.completedCount} / {task.quantity} completed</span>
                        <span>{((task.completedCount / task.quantity) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                          style={{ width: `${(task.completedCount / task.quantity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar (Right col) - Submission History & Recent transactions */}
        <div className="space-y-8">
          
          {/* My Submissions */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4">My Earning History</h2>
            {data.completionsSubmitted.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                You haven't completed any tasks yet.
                <Link href="/marketplace" className="text-purple-400 font-semibold block mt-1 hover:underline">
                  Visit Marketplace to earn credits
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.completionsSubmitted.map((comp) => (
                  <div key={comp.id} className="p-3 bg-zinc-950/60 border border-zinc-900/60 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white uppercase">{comp.task.taskType}</p>
                      <p className="text-[10px] text-zinc-500">@{comp.task.targetUsername}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-300">+{comp.task.reward} CR</span>
                      {comp.status === "PENDING" && <span title="Pending approval"><Clock className="w-3.5 h-3.5 text-yellow-500" /></span>}
                      {comp.status === "APPROVED" && <span title="Approved"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></span>}
                      {comp.status === "REJECTED" && <span title="Rejected"><XCircle className="w-3.5 h-3.5 text-red-500" /></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transactions ledger */}
          <div className="glass-panel rounded-2xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Recent Ledger</h2>
            {data.transactions.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center">No transaction logs available.</p>
            ) : (
              <div className="space-y-3">
                {data.transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-start border-b border-zinc-900 pb-2 text-xs">
                    <div>
                      <p className="text-zinc-300 text-[11px] font-medium">{tx.description}</p>
                      <p className="text-[9px] text-zinc-600">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold flex items-center shrink-0 ${tx.amount > 0 ? "text-emerald-400" : "text-purple-400"}`}>
                      {tx.amount > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownLeft className="w-3 h-3 mr-0.5" />}
                      {Math.abs(tx.amount).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Report Modal / Form Overlay */}
      {reportWorkerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-purple-500/30 glow-purple">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
              <span>Report Suspicious Worker</span>
            </h3>
            
            {reportSuccess ? (
              <div className="py-6 text-center text-emerald-400 text-sm font-semibold">
                Report submitted successfully!
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Submit a detailed report if this worker submitted fake verification proof. Fraudulent submissions will result in reputation drops or account suspension.
                </p>
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition mb-4 h-24"
                  placeholder="Explain why this proof is fake or misleading..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setReportWorkerId(null)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReport}
                    disabled={reportLoading || !reportReason}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {reportLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
