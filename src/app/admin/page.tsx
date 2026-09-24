"use client";

import { ChatPanel } from "@/components/ai/ChatPanel";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useNeomStore } from "@/lib/store";
import type { ApplicationStatus, ChatMessage, UniversityCategory } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Mail,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#06b6d4" });
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const store = useNeomStore();
  const {
    applications,
    users,
    universities,
    countries,
    categories,
    promotions,
    emailCampaigns,
    adminChat,
    addAdminMessage,
    updateApplicationStatus,
    addCategory,
    deleteCategory,
    toggleUniversityPublished,
    togglePromotion,
  } = store;

  const stats = useMemo(
    () => ({
      totalApps: applications.length,
      pending: applications.filter((a) => ["submitted", "under_review"].includes(a.status)).length,
      accepted: applications.filter((a) => a.status === "accepted").length,
      students: users.filter((u) => u.role === "student").length,
      publishedUnis: universities.filter((u) => u.published).length,
    }),
    [applications, users, universities]
  );

  const handleAdminSend = useCallback(
    async (message: string) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      addAdminMessage(userMsg);

      const history = adminChat.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          applications,
          storeCategories: categories,
        }),
      });

      const data = await res.json();
      let response = data.response ?? "Sorry, I couldn't process that.";

      // Parse category creation from AI response
      const jsonMatch = response.match(/\{[^}]*"name"[^}]*\}/);
      if (jsonMatch && message.toLowerCase().includes("creat")) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.name) {
            const cat: UniversityCategory = {
              id: parsed.name.toLowerCase().replace(/\s+/g, "-"),
              name: parsed.name,
              description: parsed.description ?? "",
              icon: parsed.icon ?? "Tag",
              color: parsed.color ?? "#06b6d4",
            };
            addCategory(cat);
            response += `\n\n✅ Category "${cat.name}" has been created.`;
          }
        } catch {
          // ignore parse errors
        }
      }

      // Parse status update commands
      const statusMatch = message.match(/([0-9a-f-]{36}|app-[\w-]+).*?(draft|submitted|under_review|accepted|rejected)/i);
      if (statusMatch) {
        const appId = message.match(/([0-9a-f-]{36}|app-[\w-]+)/i)?.[0];
        const status = statusMatch[2].toLowerCase() as ApplicationStatus;
        if (appId && applications.find((a) => a.id === appId)) {
          await updateApplicationStatus(appId, status);
          response += `\n\n✅ Application ${appId} updated to "${status}".`;
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      addAdminMessage(assistantMsg);
    },
    [adminChat, applications, categories, addAdminMessage, addCategory, updateApplicationStatus]
  );

  const filteredApps = applications.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.studentName.toLowerCase().includes(q) ||
      a.universityName.toLowerCase().includes(q) ||
      a.status.includes(q)
    );
  });

  const handleCreateCategory = () => {
    if (!newCategory.name) return;
    addCategory({
      id: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
      name: newCategory.name,
      description: newCategory.description,
      icon: "Tag",
      color: newCategory.color,
    });
    setNewCategory({ name: "", description: "", color: "#06b6d4" });
    setShowCategoryForm(false);
  };

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-auto">
        {activeTab === "agent" ? (
          <div className="p-6 h-screen">
            <div className="h-full max-w-4xl mx-auto">
              <ChatPanel
                title="Neom Admin AI Agent"
                subtitle="Manage applications · Create categories · Research · Search"
                messages={adminChat}
                onSend={handleAdminSend}
                accent="purple"
                suggestions={[
                  "Show all applications",
                  "List university categories",
                  "Research partner universities",
                  "Create category: Environmental Studies",
                  "Update app-1 to accepted",
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-7xl">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white capitalize">
                    {activeTab === "email" ? "Email Campaigns" : activeTab}
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    {activeTab === "overview" && "Platform overview and key metrics"}
                    {activeTab === "applications" && "Review and manage student applications"}
                    {activeTab === "users" && "Registered students and administrators"}
                    {activeTab === "universities" && "Publish and manage partner universities"}
                    {activeTab === "categories" && "Organize universities by category"}
                    {activeTab === "promotions" && "Manage promotional campaigns"}
                    {activeTab === "email" && "Create and send email campaigns"}
                  </p>
                </div>
                {activeTab !== "overview" && activeTab !== "users" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50 w-64"
                    />
                  </div>
                )}
              </div>

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Applications", value: stats.totalApps, color: "text-cyan-400" },
                      { label: "Pending Review", value: stats.pending, color: "text-amber-400" },
                      { label: "Accepted", value: stats.accepted, color: "text-emerald-400" },
                      { label: "Students", value: stats.students, color: "text-violet-400" },
                    ].map((s) => (
                      <Card key={s.label}>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                      </Card>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <h3 className="font-semibold text-white mb-4">Recent Applications</h3>
                      <div className="space-y-3">
                        {applications.slice(0, 5).map((app) => (
                          <div key={app.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div>
                              <p className="text-sm text-white">{app.studentName}</p>
                              <p className="text-xs text-slate-500">{app.universityName}</p>
                            </div>
                            <Badge label={app.status.replace("_", " ")} status={app.status} />
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card>
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <h3 className="font-semibold text-white">AI Agent Quick Access</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                        Use the AI Agent to manage applications, create categories, research universities, and search the platform.
                      </p>
                      <Button variant="secondary" onClick={() => setActiveTab("agent")}>
                        Open AI Agent
                      </Button>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "applications" && (
                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400">
                          <th className="text-left p-4 font-medium">Student</th>
                          <th className="text-left p-4 font-medium">University</th>
                          <th className="text-left p-4 font-medium">Country</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Updated</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApps.map((app) => (
                          <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="p-4">
                              <p className="text-white">{app.studentName}</p>
                              <p className="text-xs text-slate-500">{app.studentEmail}</p>
                            </td>
                            <td className="p-4 text-slate-300">{app.universityName}</td>
                            <td className="p-4 text-slate-400">{app.countryName}</td>
                            <td className="p-4">
                              <Badge label={app.status.replace("_", " ")} status={app.status} />
                            </td>
                            <td className="p-4 text-slate-500">{formatDate(app.updatedAt)}</td>
                            <td className="p-4">
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  updateApplicationStatus(app.id, e.target.value as ApplicationStatus)
                                }
                                className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                              >
                                {(["draft", "submitted", "under_review", "accepted", "rejected"] as const).map(
                                  (s) => (
                                    <option key={s} value={s}>
                                      {s.replace("_", " ")}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {activeTab === "users" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                          <Users className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge label={user.role} />
                      {user.country && (
                        <p className="text-xs text-slate-500 mt-2">Country: {user.country}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === "universities" && (
                <div className="grid md:grid-cols-2 gap-4">
                  {universities.map((uni) => {
                    const country = countries.find((c) => c.id === uni.countryId);
                    return (
                      <Card key={uni.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">{uni.name}</h3>
                            <p className="text-sm text-slate-400">{country?.flag} {country?.name}</p>
                            <p className="text-xs text-slate-500 mt-2">{uni.tuition}</p>
                          </div>
                          <button
                            onClick={() => toggleUniversityPublished(uni.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              uni.published
                                ? "text-emerald-400 hover:bg-emerald-500/10"
                                : "text-slate-500 hover:bg-white/5"
                            }`}
                          >
                            {uni.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="mt-3">
                          <Badge label={uni.published ? "Published" : "Draft"} status={uni.published ? "accepted" : "draft"} />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {activeTab === "categories" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setShowCategoryForm(!showCategoryForm)}>
                      <Plus className="w-4 h-4" />
                      Add Category
                    </Button>
                  </div>

                  {showCategoryForm && (
                    <Card>
                      <h3 className="font-medium text-white mb-4">New Category</h3>
                      <div className="grid sm:grid-cols-3 gap-4 mb-4">
                        <input
                          placeholder="Category name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                        <input
                          placeholder="Description"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                        <input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                          className="h-10 rounded-xl cursor-pointer"
                        />
                      </div>
                      <Button size="sm" onClick={handleCreateCategory}>
                        <Check className="w-4 h-4" />
                        Create
                      </Button>
                    </Card>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <Card key={cat.id}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                            >
                              <Tag className="w-5 h-5" style={{ color: cat.color }} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{cat.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "promotions" && (
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <Card key={promo.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-white">{promo.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">{promo.description}</p>
                          <p className="text-xs text-violet-400 mt-2">{promo.discount}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(promo.startDate)} — {formatDate(promo.endDate)}
                          </p>
                        </div>
                        <button
                          onClick={() => togglePromotion(promo.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            promo.active
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {promo.active ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === "email" && (
                <div className="space-y-4">
                  {emailCampaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-violet-400 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-white">{campaign.subject}</h3>
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{campaign.body}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {campaign.recipients.toLocaleString()} recipients
                              {campaign.sentAt && ` · Sent ${formatDate(campaign.sentAt)}`}
                            </p>
                          </div>
                        </div>
                        <Badge label={campaign.status} status={campaign.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
