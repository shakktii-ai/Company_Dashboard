import dbConnect from "../../../../lib/db";
import Assessment from "../../../../models/EmployeeAssessment";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const { id } = req.query;

  // ================= DELETE (SOFT) =================
  if (req.method === "DELETE") {
    try {
      await Assessment.findByIdAndUpdate(id, {
        isDeleted: true,
      });

      return res.json({
        ok: true,
        message: "Assessment archived successfully",
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  }

  // ================= UPDATE =================
  if (req.method === "PUT") {
    try {
      const update = req.body;

      await Assessment.findByIdAndUpdate(id, update);

      return res.json({ ok: true });

    } catch (err) {
      return res.status(500).json({ ok: false });
    }
  }
}