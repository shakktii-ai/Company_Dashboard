import CompanyPsychometricLink from "../../../models/CompanyPsychometricLink";
export default async function handler(req, res) {
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { isActive } = req.body;

    await CompanyPsychometricLink.findByIdAndUpdate(id, {
      isActive,
    });

    return res.json({ ok: true });
  }
}