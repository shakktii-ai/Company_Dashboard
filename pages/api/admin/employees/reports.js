//api/admin/employee/reports.js
import dbConnect from "../../../../lib/db";
import Session from "../../../../models/EmployeeAssessmentSession";
import EmployeeAssessment from "../../../../models/EmployeeAssessment";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  try {
    const sessions = await Session.find({
      employeeId: user.adminId,
      status: "completed",
    })
      .populate("assessmentId", "title role")
      .sort({ completedAt: -1 });

    const reports = sessions.map((s) => ({
      sessionId: s._id,
      title: s.assessmentId?.title || "Assessment",
      role: s.assessmentId?.role || "",
      finalScore: s.scoring?.finalScore || 0,
      completedAt: s.completedAt,
      duration: s.durationInSeconds,
       recommendedVideos: s.recommendedVideos || []
    }));

    res.json({ ok: true, reports });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
}