import dbConnect from "../../../../lib/db";
import EmployeeAssessment from "../../../../models/EmployeeAssessment";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";


export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) return res.status(401).json({ ok: false });

  const companyId = user.companyId;

  // ================= CREATE =================

  if (req.method === "POST") {
    try {
      const body = req.body;

 

      const assessment = await EmployeeAssessment.create({
        companyId,
        title: body.title,
        role: body.role,
        jd: body.jd,
        kpi: body.kpi,
        kra: body.kra,
        questions: body.questions,
       
      });

      return res.json({ ok: true, assessment });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false });
    }
  }

  // ================= GET =================

  if (req.method === "GET") {
    const list = await EmployeeAssessment.find({
      companyId,
       isDeleted: { $ne: true }, 
    }).sort({ createdAt: -1 });

    return res.json({ ok: true, list });
  }
}