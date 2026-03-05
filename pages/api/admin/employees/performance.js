import dbConnect from "../../../lib/db";
import Session from "../../../models/EmployeeAssessmentSession";
import { verifyTokenFromReq } from "../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const sessions = await Session.find({
    employeeId: user.adminId,
    status: "completed",
  });

  const avgScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((a, b) => a + b.score, 0) /
            sessions.length
        )
      : 0;

  res.json({ ok: true, avgScore, sessions });
}