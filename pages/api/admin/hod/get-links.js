import dbConnect from "../../../../lib/db";
import HODReview from "../../../../models/HODReview";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";
import Admin from "../../../../models/admin";

export default async function handler(req, res) {
    if (req.method !== "GET")
        return res.status(405).json({ ok: false, error: "Method not allowed" });

    try {
        await dbConnect();

        const payload = verifyTokenFromReq(req);
        if (!payload) return res.status(401).json({ ok: false, error: "Unauthorized" });

        const admin = await Admin.findById(payload.adminId);
        if (!admin) return res.status(401).json({ ok: false, error: "Admin not found" });

        const reviews = await HODReview.find({ companyId: admin.companyId })
            .select("token hodName departmentName responses isSubmitted submittedAt createdAt")
            .lean();

        return res.status(200).json({ ok: true, reviews });
    } catch (err) {
        console.error("GET HOD LINKS ERROR:", err);
        return res.status(500).json({ ok: false, error: "Server error" });
    }
}