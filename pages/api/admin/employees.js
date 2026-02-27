//pages/api/admin/employees.js
import dbConnect from "../../../lib/db";
import Admin from "../../../models/admin";
import bcrypt from "bcryptjs";
import { verifyTokenFromReq } from "../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // ================= VERIFY TOKEN =================
    const payload = verifyTokenFromReq(req);

    if (!payload) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized",
      });
    }

    const admin = await Admin.findById(payload.adminId);

    if (!admin) {
      return res.status(401).json({
        ok: false,
        error: "Admin not found",
      });
    }

    // ================= GET EMPLOYEES =================
    if (req.method === "GET") {
      const employees = await Admin.find({
        companyId: admin.companyId,
          role: { $ne: "admin" },
      }).select("-passwordHash");

      return res.json({
        ok: true,
        employees,
      });
    }

    // ================= CREATE EMPLOYEE =================
    if (req.method === "POST") {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          ok: false,
          error: "Missing fields",
        });
      }

      const exists = await Admin.findOne({ email });

      if (exists) {
        return res.status(400).json({
          ok: false,
          error: "Email already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const employee = await Admin.create({
        name,
        email,
        passwordHash,
        companyId: admin.companyId,
        role: role || "employee",
        cultureInterviewCompleted: false,
      });

      return res.json({
        ok: true,
        employee,
      });
    }

    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      error: "Server error",
    });
  }
}