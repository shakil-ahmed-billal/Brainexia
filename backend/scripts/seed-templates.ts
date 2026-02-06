/**
 * Seed ready-made message templates into the database (global templates, userId: null).
 * Run from backend: pnpm exec tsx scripts/seed-templates.ts
 */
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_TEMPLATES = [
  {
    name: "Cold outreach – Email",
    channel: "EMAIL" as const,
    content: `Hi {{clientName}},

I hope this email finds you well. I noticed your interest in {{serviceType}} and wanted to reach out.

We help businesses like yours with tailored solutions. Would you be open to a quick chat this week to see if we could be a fit?

Best regards`,
    placeholders: ["clientName", "serviceType"],
  },
  {
    name: "Warm follow-up – Email",
    channel: "EMAIL" as const,
    content: `Hi {{clientName}},

Just following up on our previous conversation about {{serviceType}}. I’d love to hear how things are going and whether you’d like to take the next step.

No pressure – reply when it’s convenient.

Best regards`,
    placeholders: ["clientName", "serviceType"],
  },
  {
    name: "Short WhatsApp intro",
    channel: "WHATSAPP" as const,
    content: `Hi {{clientName}}! 👋 Saw you’re interested in {{serviceType}}. We’d love to help. Free to chat for 2 mins?`,
    placeholders: ["clientName", "serviceType"],
  },
  {
    name: "WhatsApp follow-up",
    channel: "WHATSAPP" as const,
    content: `Hi {{clientName}}, just checking in. Still interested in {{serviceType}}? Reply when you’re free.`,
    placeholders: ["clientName", "serviceType"],
  },
  {
    name: "Professional offer – Email",
    channel: "EMAIL" as const,
    content: `Hi {{clientName}},

Following up on your interest in our {{serviceType}} services. We’re offering a no-obligation consultation to see how we can support your goals.

Interested in scheduling a call? Reply to this email or reach out at your convenience.

Best regards`,
    placeholders: ["clientName", "serviceType"],
  },
  {
    name: "Reminder – Email",
    channel: "EMAIL" as const,
    content: `Hi {{clientName}},

This is a friendly reminder about our {{serviceType}} discussion. We’re here when you’re ready to move forward.

Best regards`,
    placeholders: ["clientName", "serviceType"],
  },
];

async function main() {
  console.log("Seeding default templates (global, userId: null)...");
  for (const t of DEFAULT_TEMPLATES) {
    const existing = await prisma.template.findFirst({
      where: {
        name: t.name,
        userId: null,
        leadId: null,
      },
    });
    if (existing) {
      console.log(`  Skip (exists): ${t.name}`);
      continue;
    }
    await prisma.template.create({
      data: {
        name: t.name,
        content: t.content,
        channel: t.channel,
        placeholders: t.placeholders,
        userId: null,
        leadId: null,
      },
    });
    console.log(`  Created: ${t.name}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
