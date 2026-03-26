const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },

  scenario: {
    type: String,
    required: true
  },

  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },

  engine: {
    type: String
  },

  hidden_measure: {
    type: String
  },

  sub_parameter: {
    type: String
  },

  difficulty: {
    type: String,
    enum: ["Easy", "Moderate", "Complex"]
  }

});

const CompanyPsychometricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    userEmail: {
      type: String,
      required: true
    },
 slug: { // ✅ VERY IMPORTANT
      type: String,
      required: true
    },
    profileType: {
      type: String,
      enum: ["student", "employee"],
      default: "employee"
    },

    questions: [QuestionSchema],

    startTime: {
      type: Date,
      default: Date.now
    },

    completed: {
      type: Boolean,
      default: false
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    completedAt: {
      type: Date
    },

    responses: [
      {
        questionIndex: Number,
        selectedOption: Number,
        reasoning: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.CompanyPsychometric ||
  mongoose.model("CompanyPsychometric", CompanyPsychometricSchema);