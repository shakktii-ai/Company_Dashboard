import dbConnect from "../../../../lib/db";
import HODReview from "../../../../models/HODReview";

export default async function handler(req, res) {
    await dbConnect();

    // ================= FETCH REVIEW =================
    if (req.method === "GET") {
        const { token } = req.query;
        if (!token) return res.status(400).json({ ok: false, error: "Missing token" });

        try {
            const review = await HODReview.findOne({ token }).select("-__v");
            if (!review) return res.status(404).json({ ok: false, error: "Invalid token" });

            return res.status(200).json({ ok: true, review });
        } catch (err) {
            console.error("FETCH REVIEW ERROR:", err);
            return res.status(500).json({ ok: false, error: "Failed to fetch review" });
        }
    }

    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
        const { token, hodName, departmentName, responses } = req.body;

        if (!token || !departmentName || !responses) {
            return res.status(400).json({ ok: false, error: "Missing required fields" });
        }

        const review = await HODReview.findOne({ token });

        if (!review) {
            return res.status(404).json({ ok: false, error: "Invalid token" });
        }

        if (review.isSubmitted) {
            return res.status(400).json({ ok: false, error: "Form already submitted" });
        }

        review.hodName = hodName || "";
        review.departmentName = departmentName;
        review.responses = responses;
        review.isSubmitted = true;
        review.submittedAt = new Date();

        await review.save();

        return res.status(200).json({ ok: true, message: "Review submitted successfully" });
    } catch (err) {
        console.error("SUBMIT REVIEW ERROR:", err);
        return res.status(500).json({ ok: false, error: "Failed to submit review" });
    }
}