"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { formatDate } from "@/lib/utils";

export default function AdminEmailsPage() {
  const { emailCampaigns, promotions } = useAdminStore();

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-6">Email Campaigns</h1>

      <div className="space-y-4 mb-8">
        {emailCampaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-slate-900 border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-white">{campaign.subject}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{campaign.body}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Created {formatDate(campaign.createdAt)} · {campaign.recipients} recipients
                </p>
              </div>
              <Badge label={campaign.status} status={campaign.status} />
            </div>
          </Card>
        ))}
        {emailCampaigns.length === 0 && (
          <p className="text-slate-500">
            No email campaigns yet. Use Admin AI to draft campaigns.
          </p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Promotions</h2>
      <div className="space-y-3">
        {promotions.map((p) => (
          <Card key={p.id} className="bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{p.title}</h3>
                <p className="text-sm text-slate-400">{p.discount}</p>
              </div>
              <Badge label={p.active ? "active" : "inactive"} status={p.active ? "accepted" : "draft"} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
