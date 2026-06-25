import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyWebhookSignature, mapElementStatusToOrder } from "@/lib/elementpay";

const SECRET = "whsec_test_123";

function sign(body: string, ts: number, secret = SECRET) {
  const v1 = crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("base64");
  return `t=${ts},v1=${v1}`;
}

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ data: { status: "settled", tx_hash: "0xabc" } });
  const now = 1_900_000_000;

  it("accepts a valid, fresh signature", () => {
    expect(verifyWebhookSignature(body, sign(body, now), SECRET, 300, now)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const header = sign(body, now);
    expect(verifyWebhookSignature(body + "x", header, SECRET, 300, now)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    expect(verifyWebhookSignature(body, sign(body, now, "other"), SECRET, 300, now)).toBe(false);
  });

  it("rejects a stale timestamp beyond tolerance", () => {
    expect(verifyWebhookSignature(body, sign(body, now - 600), SECRET, 300, now)).toBe(false);
  });

  it("rejects a missing/empty header or secret", () => {
    expect(verifyWebhookSignature(body, null, SECRET, 300, now)).toBe(false);
    expect(verifyWebhookSignature(body, sign(body, now), "", 300, now)).toBe(false);
  });
});

describe("mapElementStatusToOrder", () => {
  it("settles and refunds map to order statuses; others are no-ops", () => {
    expect(mapElementStatusToOrder("settled")).toBe("paid");
    expect(mapElementStatusToOrder("refunded")).toBe("refunded");
    expect(mapElementStatusToOrder("submitted")).toBeNull();
    expect(mapElementStatusToOrder("failed")).toBeNull();
  });
});
