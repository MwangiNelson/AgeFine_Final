import crypto from "node:crypto";
import type { OrderStatus } from "@/lib/admin";

/**
 * ElementPay stablecoin gateway client (server-side use only — only imported by
 * server actions and the webhook route, never by client components).
 * Docs: https://devs.elementpay.net
 *
 * Flow: customer fiat (M-Pesa) on-ramps to USDC in the admin wallet.
 *   POST /orders/create  → create a charge (order_type 0 = on-ramp)
 *   GET  /orders/tx/{tx} → poll status
 *   webhook order.*      → settle/refund/fail
 */

const SANDBOX_BASE = "https://sandbox.elementpay.net/api/v1";

interface ElementConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
  walletAddress: string;
  token: string;
  currency: string;
}

export function elementConfig(): ElementConfig {
  return {
    apiKey: process.env.ELEMENTPAY_API_KEY ?? "",
    webhookSecret: process.env.ELEMENTPAY_WEBHOOK_SECRET ?? "",
    baseUrl: process.env.ELEMENTPAY_BASE_URL || SANDBOX_BASE,
    walletAddress: process.env.ELEMENTPAY_WALLET_ADDRESS ?? "",
    token: process.env.ELEMENTPAY_TOKEN ?? "",
    currency: process.env.ELEMENTPAY_CURRENCY || "KES",
  };
}

export interface ChargeResult {
  ok: boolean;
  txHash?: string;
  status?: string;
  raw?: unknown;
  error?: string;
}

/** Create an on-ramp charge for an order. client_ref ties it back to our order. */
export async function createCharge(input: {
  orderId: string;
  amountKes: number;
  phone: string;
  narrative: string;
}): Promise<ChargeResult> {
  const cfg = elementConfig();
  if (!cfg.apiKey) return { ok: false, error: "ElementPay is not configured yet — add ELEMENTPAY_API_KEY to your environment." };
  if (!cfg.walletAddress || !cfg.token) return { ok: false, error: "ElementPay wallet/token not configured (ELEMENTPAY_WALLET_ADDRESS, ELEMENTPAY_TOKEN)." };

  try {
    const res = await fetch(`${cfg.baseUrl}/orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": cfg.apiKey },
      body: JSON.stringify({
        user_address: cfg.walletAddress,
        token: cfg.token,
        order_type: 0,
        fiat_payload: {
          amount_fiat: input.amountKes,
          currency: cfg.currency,
          cashout_type: "PHONE",
          phone_number: input.phone,
          narrative: input.narrative,
          client_ref: input.orderId,
        },
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.status === "error") {
      return { ok: false, error: data?.message || `ElementPay error (${res.status}).`, raw: data };
    }
    return { ok: true, txHash: data?.data?.tx_hash, status: data?.data?.status, raw: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ElementPay request failed." };
  }
}

/** Poll the live status of a charge by its transaction hash. */
export async function getChargeByTx(txHash: string): Promise<ChargeResult> {
  const cfg = elementConfig();
  if (!cfg.apiKey) return { ok: false, error: "ElementPay is not configured yet — add ELEMENTPAY_API_KEY to your environment." };

  try {
    const res = await fetch(`${cfg.baseUrl}/orders/tx/${encodeURIComponent(txHash)}`, {
      headers: { "X-API-Key": cfg.apiKey },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.status === "error") {
      return { ok: false, error: data?.message || `ElementPay error (${res.status}).`, raw: data };
    }
    return { ok: true, txHash, status: data?.data?.status, raw: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ElementPay request failed." };
  }
}

/**
 * Verify an ElementPay webhook signature.
 * Header: `X-Webhook-Signature: t=<unix>,v1=<base64>`; signed string is
 * `${t}.${rawBody}` with HMAC-SHA256(secret) → base64. 300s freshness window.
 */
export function verifyWebhookSignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
  toleranceSec = 300,
  now: number = Math.floor(Date.now() / 1000)
): boolean {
  if (!header || !secret) return false;

  const parts: Record<string, string> = {};
  for (const seg of header.split(",")) {
    const i = seg.indexOf("=");
    if (i === -1) continue;
    parts[seg.slice(0, i).trim()] = seg.slice(i + 1).trim();
  }
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(now - t) > toleranceSec) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Map an ElementPay transaction status to an order status change, or null for none. */
export function mapElementStatusToOrder(elementStatus: string): OrderStatus | null {
  switch (elementStatus) {
    case "settled": return "paid";
    case "refunded": return "refunded";
    default: return null; // submitted / failed → no order-level change
  }
}
