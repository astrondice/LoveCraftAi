// ─────────────────────────────────────────────────────────────────
// AdminUsersManager — Admin Platform Users Controller
// ─────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Users, Shield, Search, RefreshCw, Loader2, CheckCircle2, User } from "lucide-react";
import { toast } from "sonner";

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  created_at: string;
}

export function AdminUsersManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, role, plan, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        toast.error("Failed to load user accounts");
      } else {
        setUsers((data || []) as UserRecord[]);
      }
    } catch {
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string, email: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`Updated ${email} role to ${newRole}`);
      void loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-ivory/10">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-gold" size={24} />
            <h2 className="font-display text-2xl text-ivory">Registered Users ({users.length})</h2>
          </div>
          <p className="text-ivory/60 text-xs mt-1">
            View registered user accounts and manage administrator access roles.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user email or name..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-ivory/5 border border-ivory/10 text-xs text-ivory outline-none focus:border-gold"
            />
          </div>

          <button
            onClick={() => void loadUsers()}
            className="p-2.5 rounded-full bg-ivory/5 hover:bg-ivory/15 text-ivory/70 hover:text-ivory transition-all"
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="animate-spin text-gold mx-auto mb-3" size={32} />
          <p className="text-ivory/50 text-xs label-caps">Loading user accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-ivory/10">
          <Users className="text-ivory/20 mx-auto mb-4" size={48} />
          <h3 className="font-display text-xl text-ivory mb-1">No Users Found</h3>
          <p className="text-ivory/60 text-xs">
            {search ? "No users matching your search." : "Registered users will appear here."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-ivory/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory/5 text-ivory/60 label-caps border-b border-ivory/10">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-ivory/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-ivory">{u.name || "Unnamed User"}</div>
                      <div className="text-ivory/50 text-[11px]">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full label-caps text-[9px] font-bold ${
                          u.role === "superadmin" || u.role === "admin"
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : "bg-ivory/10 text-ivory/70"
                        }`}
                      >
                        {u.role === "admin" || u.role === "superadmin" ? <Shield size={10} /> : <User size={10} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-ivory/80">{u.plan || "free"}</td>
                    <td className="px-6 py-4 text-ivory/50">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => void handleRoleChange(u.id, e.target.value, u.email)}
                        className="px-3 py-1.5 rounded-xl bg-charcoal border border-ivory/10 text-ivory text-xs focus:border-gold outline-none cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
