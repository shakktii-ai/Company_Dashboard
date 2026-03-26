const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  selectedOption: {
    type: Number,
    required: true
  },
  reasoning: {
    type: String,
    default: ""
  }
});

const CompanyPsychometricResponseSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companyPsychometric",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
linkId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "CompanyPsychometricLink"
},
    userEmail: {
      type: String,
      required: true
    },

    profileType: {
      type: String,
      enum: ["student", "employee"],
      default: "employee"
    },

    responses: [ResponseSchema],

    results: {
      type: mongoose.Schema.Types.Mixed
    },

    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.CompanyPsychometricResponse ||
  mongoose.model("CompanyPsychometricResponse", CompanyPsychometricResponseSchema);