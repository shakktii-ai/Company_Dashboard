import dbConnect from "../../../../lib/db";
import Admin from "../../../../models/admin";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "../../../../lib/auth";

export default async function handler(req, res) {
  await dbConnect();

  const admin = await verifyAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;

  // ================= UPDATE =================
  if (req.method === "PATCH") {
    try {
      const { name, role, password } = req.body;

      const update = {};

      if (name) update.name = name;
      if (role) update.role = role;

      if (password) {
        update.passwordHash = await bcrypt.hash(password, 10);
      }

      await Admin.findByIdAndUpdate(id, update);

      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  }

  // ================= DELETE =================
  if (req.method === "DELETE") {
    try {
      await Admin.findByIdAndDelete(id);

      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  }

  res.status(405).json({ ok: false });
}