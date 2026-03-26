import dbConnect from "../../../lib/db";
import CompanyPsychometricLink from "../../../models/CompanyPsychometricLink";
import { verifyTokenFromReq } from "../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const companyId = user.companyId;

  // ✅ CREATE LINK
  if (req.method === "POST") {
    try {
      const link = await CompanyPsychometricLink.create({
        companyId,
      });

      return res.status(201).json({ ok: true, link });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // ✅ GET LINKS
  if (req.method === "GET") {
    const links = await CompanyPsychometricLink.find({ companyId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ ok: true, links });
  }

  res.status(405).json({ ok: false, error: "Method not allowed" });
}