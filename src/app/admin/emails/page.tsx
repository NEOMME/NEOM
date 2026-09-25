"use client";

import { AdminEmptyState, AdminPageHeader, AdminSectionTitle } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useAdminStore } from "@/lib/admin-store";
import { formatDate } from "@/lib/utils";

export default function AdminEmailsPage() {
  const { emailCampaigns, promotions } = useAdminStore();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <AdminPageHeader
        title="Email & promotions"
        description="Campaign drafts and active student promotions. Use Admin AI to draft new copy."
      />

      <AdminSectionTitle>Campaigns</AdminSectionTitle>
      <div className="space-y-3 mb-10">
        {emailCampaigns.map((campaign) => (
          <Card key={campaign.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{campaign.subject}</h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{campaign.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Created {formatDate(campaign.createdAt)} · {campaign.recipients} recipients
                </p>
              </div>
              <Badge label={campaign.status} status={campaign.status} />
            </div>
          </Card>
        ))}
        {emailCampaigns.length === 0 && (
          <AdminEmptyState message="No email campaigns yet. Use Admin AI to draft one." />
        )}
      </div>

      <AdminSectionTitle>Promotions</AdminSectionTitle>
      <div className="space-y-3">
        {promotions.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-600">{p.discount}</p>
              </div>
              <Badge label={p.active ? "active" : "inactive"} status={p.active ? "accepted" : "draft"} />
            </div>
          </Card>
        ))}
        {promotions.length === 0 && <AdminEmptyState message="No promotions configured." />}
      </div>
    </div>
  );
}
