import dbConnect from "../../../../../lib/db";
import Session from "../../../../../models/EmployeeAssessmentSession";
import { verifyTokenFromReq } from "../../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const { sessionId } = req.query;

  try {
    const session = await Session.findOne({
      _id: sessionId,
      employeeId: user.adminId,
      status: "completed",
    }).populate("assessmentId", "title role jd kpi kra");

    if (!session)
      return res.json({ ok: false, message: "Report not found" });

    res.json({ ok: true, session });

  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
}