import mongoose from "mongoose";

const EmployeeAssessmentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  title: String,
  role: String,

  jd: String,
  kpi: [String],
  kra: [String],

  questions: {
    totalQuestions: Number,
    aptitude: Number,
    technical: Number,
    behavioral: Number,
  },

  slug: {
        type: String,
        unique: true,
        default: () => nanoid(10),
      },

  isActive: {
    type: Boolean,
    default: true,
  },
 isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EmployeeAssessment ||
  mongoose.model("EmployeeAssessment", EmployeeAssessmentSchema);