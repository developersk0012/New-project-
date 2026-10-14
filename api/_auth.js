// Shared admin-session helpers (files starting with "_" are NOT exposed as endpoints by Vercel).
import crypto from "node:crypto";

const TTL_MS = 8 * 60 * 60 * 1000; // admin session = 8 hours

function secret() {
  const pw = process.env.ADMIN_PASSWORD || "";
  return process.env.ADMIN_SECRET || crypto.createHash("sha256").update("sk-admin|" + pw).digest("hex");
}
const b64u = (b) => Buffer.from(b).toString("base64url");
const sign = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

export function safeEqual(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
export function issueToken() {
  const exp = Date.now() + TTL_MS;
  const body = b64u(JSON.stringify({ exp, n: crypto.randomBytes(8).toString("hex") }));
  return { token: body + "." + sign(body), exp };
}
export function verifyToken(token) {
  try {
    if (!process.env.ADMIN_PASSWORD || !token) return false;
    const [body, sig] = String(token).split(".");
    if (!body || !sig || !safeEqual(sig, sign(body))) return false;
    const { exp } = JSON.parse(Buffer.from(body, "base64url").toString());
    return typeof exp === "number" && exp > Date.now() ? exp : false;
  } catch { return false; }
}
export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
}
