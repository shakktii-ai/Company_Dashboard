import dbConnect from "../../../lib/db";
import { verifyTokenFromReq } from "../../../lib/verifyToken";
import Admin from "../../../models/admin";
import EmployeeAssessmentSession from "../../../models/EmployeeAssessmentSession";
import EmployeeAssessment from "../../../models/EmployeeAssessment";

export default async function handler(req, res) {
  await dbConnect();

  try {

    const payload = verifyTokenFromReq(req);

    if (!payload) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized",
      });
    }

    const admin = await Admin.findById(payload.adminId);

    const { employeeId } = req.query;

    const sessions = await EmployeeAssessmentSession
      .find({
        employeeId,
        companyId: admin.companyId
      })
      .populate("assessmentId", "title")
      .sort({ createdAt: -1 });

    const assessments = sessions.map((s) => ({
      _id: s._id,
      title: s.assessmentId?.title || "Assessment",
      status: s.status,
      score: s.scoring?.finalScore,
      startedAt: s.startedAt,
      completedAt: s.completedAt
    }));

    res.json({
      ok: true,
      assessments
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
}