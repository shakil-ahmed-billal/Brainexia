"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MessageSquare, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    converted: 0,
    emailsSent: 0,
    whatsappSent: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/leads?limit=1000");
        if (response.success && response.data) {
          const leads = response.data;
          setStats({
            totalLeads: leads.length,
            converted: leads.filter((l: any) => l.serviceStatus === "CONVERTED").length,
            emailsSent: leads.filter((l: any) => l.emailSent).length,
            whatsappSent: leads.filter((l: any) => l.whatsappSent).length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      description: "All leads in system",
    },
    {
      title: "Converted",
      value: stats.converted,
      icon: TrendingUp,
      description: "Successfully converted",
    },
    {
      title: "Emails Sent",
      value: stats.emailsSent,
      icon: Mail,
      description: "Total emails sent",
    },
    {
      title: "WhatsApp Sent",
      value: stats.whatsappSent,
      icon: MessageSquare,
      description: "Total WhatsApp messages",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your lead management system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
