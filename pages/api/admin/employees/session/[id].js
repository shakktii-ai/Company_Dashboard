import dbConnect from "../../../../../lib/db";
import Session from "../../../../../models/EmployeeAssessmentSession";
import { verifyTokenFromReq } from "../../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const session = await Session.findOne({
    _id: req.query.id,
    employeeId: user.adminId,
  });

  if (!session) return res.json({ ok: false });

  res.json({ ok: true, session });
}