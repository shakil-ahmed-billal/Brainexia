"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send } from "lucide-react";
import { MESSAGE_CHANNELS, AI_TONES, AI_MODES } from "@/lib/constants";

export default function AiComposerPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [channel, setChannel] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const [tone, setTone] = useState("friendly");
  const [mode, setMode] = useState("cold_outreach");
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await api.get("/leads");
        if (response.success && response.data) {
          setLeads(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      }
    };
    fetchLeads();
  }, []);

  const handleGenerate = async () => {
    if (!selectedLeadId) {
      alert("Please select a lead");
      return;
    }

    try {
      setGenerating(true);
      const response = await api.post("/ai/generate", {
        leadId: selectedLeadId,
        channel,
        tone,
        mode,
      });

      if (response.success && response.data) {
        setAiMessage(response.data.aiResponse);
      }
    } catch (error) {
      console.error("Failed to generate message:", error);
      alert("Failed to generate message");
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedLeadId || !aiMessage) {
      alert("Please generate a message first");
      return;
    }

    try {
      setLoading(true);
      await api.post("/messages/send", {
        leadId: selectedLeadId,
        channel,
        message: aiMessage,
      });
      alert("Message sent successfully!");
      setAiMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Message Composer</h1>
        <p className="text-gray-600 mt-2">Generate personalized messages using AI</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select lead and customize message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Lead</Label>
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.clientName} - {lead.serviceType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLead && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-medium">{selectedLead.clientName}</p>
                <p className="text-gray-600">{selectedLead.email || selectedLead.phone}</p>
                <p className="text-gray-600">Service: {selectedLead.serviceType}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
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
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedLeadId || generating}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate Message"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Message</CardTitle>
            <CardDescription>Review and edit before sending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Message Preview</Label>
              <Textarea
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Generated message will appear here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!aiMessage || loading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
