import { verifyToken } from "./_auth.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const exp = verifyToken(req.headers["x-admin-token"]);
  if (!exp) return res.status(401).json({ ok: false });
  return res.status(200).json({ ok: true, exp });
}
