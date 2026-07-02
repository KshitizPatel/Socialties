import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../utils/db";

const router = Router();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "super-secret-nextauth-token-key-change-this";

/**
 * Resolve a user from DB, falling back to env-var credentials if DB is unavailable.
 * NEVER uses hardcoded credentials — all fallback data must come from environment variables.
 */
async function resolveUser(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string; role: string } | null> {
  // 1. Try the database first (preferred path)
  try {
    const user = await db.user.findFirst({
      where: { email, isActive: true },
      include: { role: true },
    });
    if (user) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (valid) {
        db.auditLog
          .create({ data: { actorId: user.id, action: "LOGIN", entityType: "USER", entityId: user.id } })
          .catch(() => {});
        return { id: user.id, name: user.name, email: user.email, role: user.role.name };
      }
      return null; // User found but wrong password — do NOT fall through to env-var fallback
    }
  } catch {
    /* DB temporarily unavailable — fall through to env-var fallback */
  }

  // 2. Env-var fallback (only used when DB is unreachable)
  const fallbackEmail = process.env.ADMIN_EMAIL;
  const fallbackHash = process.env.ADMIN_PASSWORD_HASH;

  if (!fallbackEmail || !fallbackHash) {
    // No env-var fallback configured — fail gracefully
    return null;
  }

  if (email === fallbackEmail.toLowerCase()) {
    const valid = await bcrypt.compare(password, fallbackHash);
    if (valid) {
      return {
        id: "env-fallback-admin",
        name: "Super Admin",
        email: fallbackEmail,
        role: "SUPER_ADMIN",
      };
    }
  }

  return null;
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const authUser = await resolveUser(String(email).trim().toLowerCase(), String(password));
    if (!authUser) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: authUser.id, email: authUser.email, role: authUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ token, user: authUser });
  } catch (err: any) {
    console.error("Login route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;