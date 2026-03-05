import mongoose from "mongoose";

const HODReviewSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        hodName: {
            type: String,
            trim: true,
            default: "",
        },
        departmentName: {
            type: String,
            trim: true,
        },
        responses: [
            {
                question: { type: String, required: true },
                answer: { type: String, default: "" },
            },
        ],
        isSubmitted: {
            type: Boolean,
            default: false,
        },
        submittedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.HODReview || mongoose.model("HODReview", HODReviewSchema);