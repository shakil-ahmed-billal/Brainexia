import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(1).default("dev-secret-key-change-in-production-min-32-chars"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  JWT_REFRESH_SECRET: z.string().min(1).default("dev-refresh-secret-key-change-in-production-min-32-chars"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BETTER_AUTH_SECRET: z.string().min(1).default("dev-better-auth-secret-change-in-production-min-32-chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
