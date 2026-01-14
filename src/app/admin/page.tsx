"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  X,
  Shield,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Image,
  Video,
  Mic,
  Globe,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  credits: number;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  _count: { transactions: number };
}

interface Stats {
  overview: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisMonth: number;
    activeSubscriptions: number;
  };
  subscriptions: {
    byTier: Record<string, number>;
  };
  credits: {
    totalUsed: number;
    usedToday: number;
    usedThisMonth: number;
  };
  toolUsage: Array<{
    tool: string;
    count: number;
    creditsUsed: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    tool: string | null;
    description: string | null;
    createdAt: string;
    user: { name: string | null; email: string | null };
  }>;
}

const toolIcons: Record<string, React.ReactNode> = {
  chat: <MessageSquare className="w-4 h-4" />,
  "image-generation": <Image className="w-4 h-4" />,
  "image-editing": <Image className="w-4 h-4" />,
  "image-analysis": <Image className="w-4 h-4" />,
  "video-generation": <Video className="w-4 h-4" />,
  "video-analysis": <Video className="w-4 h-4" />,
  "audio-transcription": <Mic className="w-4 h-4" />,
  "speech-generation": <Mic className="w-4 h-4" />,
  "web-search": <Globe className="w-4 h-4" />,
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "activity">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<number>(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchUsers = useCallback(async (page: number = 1, search: string = "") => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(1, "")]);
      setLoading(false);
    };

    loadData();
  }, [session, status, router, fetchStats, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchQuery);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user.id);
    setEditCredits(user.credits);
  };

  const handleSaveCredits = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credits: editCredits }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, credits: editCredits } : u))
        );
        setEditingUser(null);
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to update credits:", error);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin: !currentStatus }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isAdmin: !currentStatus } : u))
        );
      }
    } catch (error) {
      console.error("Failed to update admin status:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-[#12121a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Manage your platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  fetchStats();
                  fetchUsers(currentPage, searchQuery);
                }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "activity", label: "Activity", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.overview.totalUsers}
                icon={Users}
                trend={`+${stats.overview.newUsersThisMonth} this month`}
                color="cyan"
              />
              <StatCard
                title="Active Subscriptions"
                value={stats.overview.activeSubscriptions}
                icon={CreditCard}
                trend={`${Math.round((stats.overview.activeSubscriptions / Math.max(stats.overview.totalUsers, 1)) * 100)}% of users`}
                color="purple"
              />
              <StatCard
                title="Credits Used Today"
                value={stats.credits.usedToday.toLocaleString()}
                icon={Activity}
                trend={`${stats.credits.usedThisMonth.toLocaleString()} this month`}
                color="emerald"
              />
              <StatCard
                title="New Users Today"
                value={stats.overview.newUsersToday}
                icon={TrendingUp}
                trend="Last 24 hours"
                color="amber"
              />
            </div>

            {/* Subscription Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#12121a] rounded-xl border border-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Subscription Distribution</h3>
                <div className="space-y-4">
                  {Object.entries(stats.subscriptions.byTier).map(([tier, count]) => {
                    const percentage = Math.round((count / Math.max(stats.overview.totalUsers, 1)) * 100);
                    const colors: Record<string, string> = {
                      free: "bg-gray-500",
                      starter: "bg-cyan-500",
                      pro: "bg-purple-500",
                      business: "bg-amber-500",
                    };
                    return (
                      <div key={tier}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 capitalize">{tier || "free"}</span>
                          <span className="text-gray-400">{count} users ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[tier] || "bg-gray-500"} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tool Usage */}
              <div className="bg-[#12121a] rounded-xl border border-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tool Usage (Last 30 Days)</h3>
                <div className="space-y-3">
                  {stats.toolUsage.slice(0, 6).map((tool) => (
                    <div key={tool.tool} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          {toolIcons[tool.tool] || <Activity className="w-4 h-4" />}
                        </div>
                        <span className="text-gray-300 capitalize">
                          {tool.tool.replace(/-/g, " ")}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{tool.count} uses</div>
                        <div className="text-xs text-gray-500">
                          {tool.creditsUsed.toLocaleString()} credits
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.toolUsage.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tool usage data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-[#12121a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Users Table */}
            <div className="bg-[#12121a] rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">User</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Credits</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Plan</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-cyan-500 mx-auto" />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={user.name || ""}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                  {(user.name || user.email || "U")[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="text-white font-medium flex items-center gap-2">
                                  {user.name || "No name"}
                                  {user.isAdmin && (
                                    <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.subscriptionStatus === "active"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {user.subscriptionStatus || "inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {editingUser === user.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={editCredits}
                                  onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                                />
                                <button
                                  onClick={() => handleSaveCredits(user.id)}
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="p-1 text-gray-400 hover:bg-white/5 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-white">{user.credits.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300 capitalize">
                              {user.subscriptionTier || "free"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                title="Edit credits"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.isAdmin
                                    ? "text-cyan-400 hover:bg-cyan-500/10"
                                    : "text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
                                }`}
                                title={user.isAdmin ? "Remove admin" : "Make admin"}
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && stats && (
          <div className="bg-[#12121a] rounded-xl border border-white/5">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="divide-y divide-white/5">
              {stats.recentTransactions.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent activity
                </div>
              ) : (
                stats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            tx.type === "usage"
                              ? "bg-red-500/20 text-red-400"
                              : tx.type === "purchase" || tx.type === "subscription"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {tx.tool ? (
                            toolIcons[tx.tool] || <Activity className="w-4 h-4" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-white">
                            {tx.description ||
                              (tx.tool ? tx.tool.replace(/-/g, " ") : tx.type)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {tx.user.name || tx.user.email || "Unknown user"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            tx.amount < 0 ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {tx.amount < 0 ? "" : "+"}
                          {tx.amount.toLocaleString()} credits
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color: "cyan" | "purple" | "emerald" | "amber";
}) {
  const colors = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  };

  const iconColors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} rounded-xl border p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-500">{trend}</div>
    </div>
  );
}
