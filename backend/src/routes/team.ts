import { Router } from "express";
import db from "../utils/db";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── Public: Get all active team members ─────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const team = await db.teamMember.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(team);
  } catch (error: any) {
    console.error("Get team error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Get all team members (including inactive) ─────────────────
router.get("/all", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const team = await db.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(team);
  } catch (error: any) {
    console.error("Get all team members error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Get single team member ───────────────────────────────────
router.get("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const member = await db.teamMember.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!member) return res.status(404).json({ error: "Team member not found" });
    return res.json(member);
  } catch (error: any) {
    console.error("Get team member error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Create team member ───────────────────────────────────────
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      name, designation, photoUrl, linkedin, instagram, email, bio,
      phone, department, portfolio, experience, sortOrder, isActive,
    } = req.body;

    if (!name || !designation) {
      return res.status(400).json({ error: "Name and designation are required" });
    }

    const member = await db.teamMember.create({
      data: {
        name,
        designation,
        photoUrl: photoUrl || null,
        linkedin: linkedin || null,
        instagram: instagram || null,
        email: email || null,
        bio: bio || null,
        phone: phone || null,
        department: department || null,
        portfolio: portfolio || null,
        experience: experience || null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "CREATE_TEAM_MEMBER", entityType: "TEAM_MEMBER", entityId: member.id },
    }).catch(() => {});

    return res.json(member);
  } catch (error: any) {
    console.error("Create team member error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Update team member ───────────────────────────────────────
router.put("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name, designation, photoUrl, linkedin, instagram, email, bio,
      phone, department, portfolio, experience, sortOrder, isActive,
    } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (designation !== undefined) data.designation = designation;
    if (photoUrl !== undefined) data.photoUrl = photoUrl || null;
    if (linkedin !== undefined) data.linkedin = linkedin || null;
    if (instagram !== undefined) data.instagram = instagram || null;
    if (email !== undefined) data.email = email || null;
    if (bio !== undefined) data.bio = bio || null;
    if (phone !== undefined) data.phone = phone || null;
    if (department !== undefined) data.department = department || null;
    if (portfolio !== undefined) data.portfolio = portfolio || null;
    if (experience !== undefined) data.experience = experience || null;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const member = await db.teamMember.update({ where: { id }, data });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "UPDATE_TEAM_MEMBER", entityType: "TEAM_MEMBER", entityId: member.id },
    }).catch(() => {});

    return res.json(member);
  } catch (error: any) {
    console.error("Update team member error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Authenticated: Soft delete team member ───────────────────────────────────
router.delete("/:id", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const member = await db.teamMember.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await db.auditLog.create({
      data: { actorId: req.user!.id, action: "DELETE_TEAM_MEMBER", entityType: "TEAM_MEMBER", entityId: member.id },
    }).catch(() => {});

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Delete team member error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
