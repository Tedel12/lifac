import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

/**
 * Endpoint de santé : vérifie que la base de données répond.
 * Utile pour les vérifications de déploiement Vercel et le monitoring uptime.
 *
 * GET /api/health
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      fedapay: process.env.FEDAPAY_SECRET_KEY ? "configured" : "not_configured",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "unknown",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
