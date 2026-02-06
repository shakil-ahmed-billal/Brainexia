"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Send } from "lucide-react";
import { SERVICE_TYPES, SERVICE_STATUSES, MESSAGE_CHANNELS, TEMPLATE_PLACEHOLDERS } from "@/lib/constants";
import { LeadForm } from "@/components/leads/LeadForm";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailSentFilter, setEmailSentFilter] = useState<string>("all");
  const [whatsappSentFilter, setWhatsappSentFilter] = useState<string>("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkSend, setShowBulkSend] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [bulkChannel, setBulkChannel] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "500");
      if (search) params.append("search", search);
      if (serviceTypeFilter && serviceTypeFilter !== "all") params.append("serviceType", serviceTypeFilter);
      if (statusFilter && statusFilter !== "all") params.append("serviceStatus", statusFilter);
      if (emailSentFilter === "true") params.append("emailSent", "true");
      if (emailSentFilter === "false") params.append("emailSent", "false");
      if (whatsappSentFilter === "true") params.append("whatsappSent", "true");
      if (whatsappSentFilter === "false") params.append("whatsappSent", "false");

      const response = await api.get(`/leads?${params.toString()}`);
      if (response.success && response.data) {
        setLeads(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, serviceTypeFilter, statusFilter, emailSentFilter, whatsappSentFilter]);

  useEffect(() => {
    if (showBulkSend) {
      api.get("/templates").then((r) => {
        if (r.success && r.data) setTemplates(Array.isArray(r.data) ? r.data : []);
      });
    }
  }, [showBulkSend]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  const toggleLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const onTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = templates.find((x) => x.id === templateId);
    if (t) {
      setBulkMessage(t.content);
      setBulkChannel(t.channel);
    }
  };

  const handleBulkSend = async () => {
    if (selectedLeads.length === 0 || !bulkMessage.trim()) {
      alert("Select at least one lead and enter a message (use {{clientName}}, {{serviceType}}, etc. for personalization).");
      return;
    }
    try {
      setBulkSending(true);
      const response = await api.post("/messages/bulk-send-personalized", {
        leadIds: selectedLeads,
        channel: bulkChannel,
        messageTemplate: bulkMessage.trim(),
      });
      if (response.success && response.data) {
        const results = response.data as { leadId: string; success: boolean; error?: string }[];
        const failed = results.filter((r) => !r.success);
        if (failed.length === 0) {
          alert(`Message sent to all ${selectedLeads.length} lead(s).`);
        } else {
          alert(`Sent to ${selectedLeads.length - failed.length}, failed: ${failed.length}.`);
        }
        setShowBulkSend(false);
        setBulkMessage("");
        setSelectedTemplateId("");
        setSelectedLeads([]);
        fetchLeads();
      }
    } catch (error: any) {
      alert(error?.message || "Failed to send messages");
    } finally {
      setBulkSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage your client leads and send personalized messages</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkSend(true)}
            disabled={selectedLeads.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Send to selected ({selectedLeads.length})
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription className="text-gray-600">
            Filter leads and select rows to send personalized messages (use placeholders like {"{{clientName}}"}, {"{{serviceType}}"} in your message).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {SERVICE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={emailSentFilter} onValueChange={setEmailSentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Email sent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Email: Any</SelectItem>
                <SelectItem value="true">Email: Sent</SelectItem>
                <SelectItem value="false">Email: Not sent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={whatsappSentFilter} onValueChange={setWhatsappSentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="WhatsApp sent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">WhatsApp: Any</SelectItem>
                <SelectItem value="true">WhatsApp: Sent</SelectItem>
                <SelectItem value="false">WhatsApp: Not sent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No leads found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={leads.length > 0 && selectedLeads.length === leads.length}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email / WA</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => toggleLead(lead.id)}
                        aria-label={`Select ${lead.clientName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lead.clientName}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.email || "-"}</TableCell>
                    <TableCell>{lead.phone || "-"}</TableCell>
                    <TableCell>{lead.serviceType}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          lead.serviceStatus === "CONVERTED"
                            ? "bg-green-100 text-green-800"
                            : lead.serviceStatus === "NOT_INTERESTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {lead.serviceStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {lead.emailSent ? "✓ Email" : ""} {lead.whatsappSent ? "✓ WA" : ""}
                      {!lead.emailSent && !lead.whatsappSent ? "-" : ""}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <LeadForm
          onClose={() => {
            setShowForm(false);
            fetchLeads();
          }}
        />
      )}

      <Dialog open={showBulkSend} onOpenChange={setShowBulkSend}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send personalized message to selected leads</DialogTitle>
            <DialogDescription>
              Each lead will receive the message with placeholders replaced (e.g. {"{{clientName}}"} → their name). Choose a template or write your own.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={bulkChannel || "default"} onValueChange={(v) => setBulkChannel(v as "EMAIL" | "WHATSAPP")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_CHANNELS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      {ch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Use a template (optional)</Label>
              <Select value={selectedTemplateId || "default"} onValueChange={onTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template to fill the message below" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">None – write custom message</SelectItem>
                  {templates
                    .filter((t) => t.channel === bulkChannel)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message (use placeholders for personalization)</Label>
              <Textarea
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="Hi {{clientName}}, we'd love to help with {{serviceType}}..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Placeholders: {TEMPLATE_PLACEHOLDERS.map((p) => `{{${p.value}}}`).join(", ")}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkSend(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkSend} disabled={bulkSending || !bulkMessage.trim()}>
                {bulkSending ? "Sending..." : `Send to ${selectedLeads.length} lead(s)`} 
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
