import dbConnect from "../../../lib/db";
import Assign from "../../../models/EmployeeAssessmentAssign";
import { verifyTokenFromReq } from "../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const companyId = user.companyId;

  if (req.method === "POST") {
    try {
      const { employeeId, linkId } = req.body;

      if (!employeeId || !linkId) {
        return res.status(400).json({
          ok: false,
          error: "employeeId and linkId required",
        });
      }

      const assign = await Assign.create({
        companyId,
        employeeId,
        linkId,
        type: "psychometric", // ✅ KEY
      });

      return res.json({ ok: true, assign });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  }
}