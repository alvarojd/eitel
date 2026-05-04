import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    TTN_WEBHOOK_SECRET: process.env.TTN_WEBHOOK_SECRET,
    POSTGRES_URL: process.env.POSTGRES_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_POSTGRES_URL: process.env.SUPABASE_POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DB_CA_CERT: process.env.DB_CA_CERT,
  },
};

export default nextConfig;
