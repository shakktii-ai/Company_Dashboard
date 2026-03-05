// import mongoose from "mongoose";

// const EmployeeAssessmentSessionSchema = new mongoose.Schema(
//   {
//     /* ================= RELATIONS ================= */

//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       required: true,
//       index: true,
//     },

//     employeeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//       required: true,
//       index: true,
//     },

//     assessmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "EmployeeAssessment",
//       required: true,
//     },

//     slug: {
//       type: String,
//       required: true,
//     },

//     /* ================= QUESTIONS ================= */

//     generatedQuestions: {
//       technical: {
//         mcq: [
//           {
//             prompt: String,
//             options: [String],
//             correctOptionIndex: Number,
//           },
//         ],
//         written: [
//           {
//             prompt: String,
//             hint: String,
//           },
//         ],
//       },
//     },

//     /* ================= ANSWERS ================= */

//     mcqAnswers: [
//       {
//         questionIndex: Number,
//         selectedOptionIndex: Number,
//         isCorrect: Boolean,
//       },
//     ],

//     writtenAnswers: [
//       {
//         questionIndex: Number,
//         response: String,
//         aiScore: Number, // 0-10 or percentage
//       },
//     ],

//     /* ================= SCORING ================= */

//     scoring: {
//       mcqScore: {
//         type: Number,
//         default: 0,
//       },
//       writtenScore: {
//         type: Number,
//         default: 0,
//       },
//       finalScore: {
//         type: Number,
//         default: null,
//       },
//       weightage: {
//         mcqWeight: {
//           type: Number,
//           default: 60,
//         },
//         writtenWeight: {
//           type: Number,
//           default: 40,
//         },
//       },
//     },

//     /* ================= KPI / KRA ANALYSIS ================= */

//     kpiAlignment: {
//       type: String,
//       enum: ["Strong", "Average", "Needs Improvement"],
//       default: null,
//     },

//     aiReport: {
//       overallSummary: String,

//       kpiAnalysis: [
//         {
//           kpi: String,
//           scoreImpact: String, // Strong | Moderate | Weak
//           feedback: String,
//         },
//       ],

//       kraAnalysis: [
//         {
//           kra: String,
//           performanceLevel: String, // Strong | Moderate | Weak
//           feedback: String,
//         },
//       ],

//       strengths: [String],
//       improvementAreas: [String],
//       recommendedActions: [String],
//     },

//     /* ================= SESSION STATE ================= */

//     status: {
//       type: String,
//       enum: ["in-progress", "completed"],
//       default: "in-progress",
//       index: true,
//     },

//     attemptNumber: {
//       type: Number,
//       default: 1,
//     },

//     startedAt: {
//       type: Date,
//        default: Date.now,
//     },

//     completedAt: {
//       type: Date,
//     },

//     durationInSeconds: {
//       type: Number,
//        default: Date.now,
//     },
//   },
//   {
//     timestamps: true, // adds createdAt & updatedAt automatically
//   }
// );

// export default mongoose.models.EmployeeAssessmentSession ||
//   mongoose.model(
//     "EmployeeAssessmentSession",
//     EmployeeAssessmentSessionSchema
//   );

import mongoose from "mongoose";

const EmployeeAssessmentSessionSchema = new mongoose.Schema(
  {
    /* ================= RELATIONS ================= */

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeAssessment",
      required: true,
    },

    slug: {
      type: String,
      required: true,
    },

    /* ================= QUESTIONS ================= */

    generatedQuestions: {
      technical: {
        mcq: [
          {
            prompt: String,
            options: [String],
            correctOptionIndex: Number,

            // 🔥 NEW FIELDS
            competency: String,
            kpiTag: String,
            kraTag: String,
            difficulty: String,
          },
        ],
        written: [
          {
            prompt: String,
            hint: String,
            expectedAnswer:String,
            // 🔥 NEW FIELDS
            competency: String,
            kpiTag: String,
            kraTag: String,
            difficulty: String,
          },
        ],
      },
    },

    /* ================= ANSWERS ================= */

    mcqAnswers: [
      {
        questionIndex: Number,
        selectedOptionIndex: Number,
        isCorrect: Boolean,
      },
    ],

    writtenAnswers: [
      {
        questionIndex: Number,
        response: String,
        aiScore: Number, // 0-10 or percentage
      },
    ],

    /* ================= SCORING ================= */

    scoring: {
      mcqScore: {
        type: Number,
        default: 0,
      },
      writtenScore: {
        type: Number,
        default: 0,
      },
      finalScore: {
        type: Number,
        default: null,
      },
      weightage: {
        mcqWeight: {
          type: Number,
          default: 60,
        },
        writtenWeight: {
          type: Number,
          default: 40,
        },
      },
    },

    /* ================= ADVANCED BREAKDOWN ================= */
/* ================= ADVANCED BREAKDOWN ================= */

competencyScores: [
  {
    competency: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
],

kpiScores: [
  {
    kpi: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
],

kraScores: [
  {
    kra: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
],
/* ================= EVALUATION DIMENSIONS ================= */

dimensionScores: [
  {
    dimension: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
    },
  },
],

    /* ================= KPI ALIGNMENT ================= */

    kpiAlignment: {
      type: String,
      enum: ["Strong", "Average", "Needs Improvement"],
      default: null,
    },

    /* ================= AI REPORT ================= */

    aiReport: {
      overallSummary: String,

      kpiAnalysis: [
        {
          kpi: String,
          scoreImpact: String,
          feedback: String,
        },
      ],

      kraAnalysis: [
        {
          kra: String,
          performanceLevel: String,
          feedback: String,
        },
      ],

      strengths: [String],
      improvementAreas: [String],
      recommendedActions: [String],
    },
    recommendedVideos: [
  {
    skill: String,
    videos: [
      {
        title: String,
        url: String
      }
    ]
  }
],

    /* ================= SESSION STATE ================= */

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
      index: true,
    },

    attemptNumber: {
      type: Number,
      default: 1,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },

    durationInSeconds: {
      type: Number,
      default: 0, // ✅ FIXED
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.EmployeeAssessmentSession ||
  mongoose.model(
    "EmployeeAssessmentSession",
    EmployeeAssessmentSessionSchema
  );