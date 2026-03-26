import dbConnect from "../../../lib/db";
import Assign from "../../../models/EmployeeAssessmentAssign";
import Admin from "../../../models/admin";
import mongoose from "mongoose";
import { verifyTokenFromReq } from "../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  // ✅ Auth check
  const user = verifyTokenFromReq(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const companyId = user.companyId;

  // ✅ Method check
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const { linkId } = req.body;

    // ✅ Validation
    if (!linkId || !mongoose.isValidObjectId(linkId)) {
      return res.status(400).json({
        ok: false,
        error: "Valid linkId required",
      });
    }

    // ✅ Fetch employees
    const employees = await Admin.find({
      companyId,
      role: { $ne: "admin" },
    }).select("_id");

    if (!employees.length) {
      return res.status(200).json({
        ok: true,
        count: 0,
        message: "No employees found",
      });
    }

    // ✅ Prepare assignments (allow multiple attempts)
    const assignments = employees.map((emp) => ({
      companyId,
      employeeId: emp._id,
      linkId,
      type: "psychometric",
      status: "pending",
      createdAt: new Date(),
    }));

    // ✅ Bulk insert (ordered:false = continue if some fail)
    const result = await Assign.insertMany(assignments, {
      ordered: false,
    });

    return res.status(200).json({
      ok: true,
      count: result.length,
      message: "Assigned to all employees successfully",
    });

  } catch (err) {
    console.error("assignAll error:", err);

    return res.status(500).json({
      ok: false,
      error: "Server error",
    });
  }
}