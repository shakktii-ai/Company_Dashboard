import dbConnect from "../../../../lib/db";
import HODReview from "../../../../models/HODReview";
import crypto from "crypto";

const HOD_QUESTIONS = [
    "How would you define the core values that drive your department's decisions?",
    "How effectively is the company's long-term vision communicated to your team?",
    "What is the biggest cultural challenge your department faces currently?",
    "How would you describe the level of cross-departmental collaboration at this company?",
    "How does your department handle conflict or differing opinions among team members?",
    "What specific behaviors are most rewarded or recognized in your department?",
    "How frequently do you and your team engage in professional development or learning?",
    "How would you rate the transparency of top-level management's communication?",
    "In what ways does the company culture support or hinder innovation in your area?",
    "How is work-life balance practiced and encouraged within your department?",
    "What is the primary method used for giving and receiving feedback in your team?",
    "How diverse and inclusive is the environment within your specific department?",
    "How aligned are your department's goals with the overall company strategy?",
    "What is one thing about the company culture you would change to improve efficiency?",
    "How do you ensure that new hires in your department align with the existing culture?",
];

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
        await dbConnect();
        const { companyId, count = 4 } = req.body;

        if (!companyId) {
            return res.status(400).json({ ok: false, error: "Missing companyId" });
        }

        const links = [];
        const qa = HOD_QUESTIONS.map((q) => ({ question: q, answer: "" }));

        for (let i = 0; i < count; i++) {
            const token = crypto.randomBytes(16).toString("hex");
            const review = await HODReview.create({
                companyId,
                token,
                responses: qa,
            });
            links.push(token);
        }

        return res.status(200).json({ ok: true, links });
    } catch (err) {
        console.error("GENERATE LINKS ERROR:", err);
        return res.status(500).json({ ok: false, error: "Failed to generate links" });
    }
}