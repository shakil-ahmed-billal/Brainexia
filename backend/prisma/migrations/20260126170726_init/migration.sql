-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WEB', 'SEO', 'MARKETING', 'DESIGN', 'DEVELOPMENT', 'CONSULTING', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('INTERESTED', 'CONVERTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "address" TEXT,
    "service_type" "ServiceType" NOT NULL,
    "source" TEXT,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_sent" BOOLEAN NOT NULL DEFAULT false,
    "approach_count" INTEGER NOT NULL DEFAULT 0,
    "service_status" "ServiceStatus" NOT NULL DEFAULT 'INTERESTED',
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "ai_prompt" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "final_message" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "tone" TEXT,
    "mode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "placeholders" TEXT[],
    "lead_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Lead_user_id_idx" ON "Lead"("user_id");

-- CreateIndex
CREATE INDEX "Lead_service_type_idx" ON "Lead"("service_type");

-- CreateIndex
CREATE INDEX "Lead_service_status_idx" ON "Lead"("service_status");

-- CreateIndex
CREATE INDEX "Lead_email_sent_idx" ON "Lead"("email_sent");

-- CreateIndex
CREATE INDEX "Lead_whatsapp_sent_idx" ON "Lead"("whatsapp_sent");

-- CreateIndex
CREATE INDEX "Message_lead_id_idx" ON "Message"("lead_id");

-- CreateIndex
CREATE INDEX "Message_channel_idx" ON "Message"("channel");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "AiMessage_lead_id_idx" ON "AiMessage"("lead_id");

-- CreateIndex
CREATE INDEX "AiMessage_channel_idx" ON "AiMessage"("channel");

-- CreateIndex
CREATE INDEX "AiMessage_status_idx" ON "AiMessage"("status");

-- CreateIndex
CREATE INDEX "Template_lead_id_idx" ON "Template"("lead_id");

-- CreateIndex
CREATE INDEX "Template_user_id_idx" ON "Template"("user_id");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
