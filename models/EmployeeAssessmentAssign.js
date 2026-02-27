import mongoose from "mongoose";

const AssignSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },

  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeAssessment",
  },

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EmployeeAssessmentAssign ||
  mongoose.model("EmployeeAssessmentAssign", AssignSchema);