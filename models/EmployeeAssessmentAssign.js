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
  //for psychometric test.
 linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyPsychometricLink",
  },

  type: {
    type: String,
    enum: ["assessment", "psychometric"],
    default: "assessment",
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
resultId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "CompanyPsychometricResponse"
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EmployeeAssessmentAssign ||
  mongoose.model("EmployeeAssessmentAssign", AssignSchema);