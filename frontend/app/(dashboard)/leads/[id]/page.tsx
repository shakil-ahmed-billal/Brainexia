"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, ArrowLeft, Edit } from "lucide-react";
import { LeadForm } from "@/components/leads/LeadForm";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await api.get(`/leads/${params.id}`);
        if (response.success && response.data) {
          setLead(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch lead:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLead();
    }
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!lead) {
    return <div className="text-center py-8">Lead not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setShowEditForm(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{lead.clientName}</CardTitle>
              <CardDescription>Lead Details</CardDescription>
            </div>
            <Badge
              className={
                lead.serviceStatus === "CONVERTED"
                  ? "bg-green-100 text-green-800"
                  : lead.serviceStatus === "NOT_INTERESTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }
            >
              {lead.serviceStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm">{lead.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm">{lead.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">WhatsApp</p>
              <p className="text-sm">{lead.whatsapp || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Website</p>
              <p className="text-sm">{lead.website || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Service Type</p>
              <p className="text-sm">{lead.serviceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Source</p>
              <p className="text-sm">{lead.source || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Approach Count</p>
              <p className="text-sm">{lead.approachCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email Sent</p>
              <p className="text-sm">{lead.emailSent ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">WhatsApp Sent</p>
              <p className="text-sm">{lead.whatsappSent ? "Yes" : "No"}</p>
            </div>
          </div>
          {lead.address && (
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-sm">{lead.address}</p>
            </div>
          )}
          {lead.notes && (
            <div>
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="text-sm">{lead.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interaction History</CardTitle>
          <CardDescription>All messages sent to this lead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lead.messages && lead.messages.length > 0 ? (
              lead.messages.map((message: any) => (
                <div
                  key={message.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  {message.channel === "EMAIL" ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {message.channel}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No messages sent yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {showEditForm && (
        <LeadForm
          lead={lead}
          onClose={() => {
            setShowEditForm(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
