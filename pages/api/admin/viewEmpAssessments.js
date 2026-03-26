// import dbConnect from "../../../lib/db";
// import { verifyTokenFromReq } from "../../../lib/verifyToken";
// import Admin from "../../../models/admin";
// import EmployeeAssessmentSession from "../../../models/EmployeeAssessmentSession";
// import EmployeeAssessment from "../../../models/EmployeeAssessment";

// export default async function handler(req, res) {
//   await dbConnect();

//   try {

//     const payload = verifyTokenFromReq(req);

//     if (!payload) {
//       return res.status(401).json({
//         ok: false,
//         error: "Unauthorized",
//       });
//     }

//     const admin = await Admin.findById(payload.adminId);

//     const { employeeId } = req.query;

//     const sessions = await EmployeeAssessmentSession
//       .find({
//         employeeId,
//         companyId: admin.companyId
//       })
//       .populate("assessmentId", "title")
//       .sort({ createdAt: -1 });

//     const assessments = sessions.map((s) => ({
//       _id: s._id,
//       title: s.assessmentId?.title || "Assessment",
//       status: s.status,
//       score: s.scoring?.finalScore,
//       startedAt: s.startedAt,
//       completedAt: s.completedAt
//     }));

//     res.json({
//       ok: true,
//       assessments
//     });

//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       ok: false,
//       error: "Server error"
//     });
//   }
// }
//api/admin/viewEmpAssessments.js 
import dbConnect from "../../../lib/db";
import { verifyTokenFromReq } from "../../../lib/verifyToken";
import Admin from "../../../models/admin";
import EmployeeAssessmentSession from "../../../models/EmployeeAssessmentSession";
import Assign from "../../../models/EmployeeAssessmentAssign";
import PsychometricResponse from "../../../models/companyPsycometricResponce";
import EmployeeAssessment from "../../../models/EmployeeAssessment";
import CompanyPsychometricLink from "models/CompanyPsychometricLink";
export default async function handler(req, res) {
  await dbConnect();

  try {
    const payload = verifyTokenFromReq(req);

    if (!payload) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized",
      });
    }

    const admin = await Admin.findById(payload.adminId);
    const { employeeId } = req.query;

    // ✅ 1. NORMAL ASSESSMENTS
    const sessions = await EmployeeAssessmentSession
      .find({
        employeeId,
        companyId: admin.companyId
      })
      .populate("assessmentId")
      .sort({ createdAt: -1 })
      .lean();

    const normalAssessments = sessions.map((s) => ({
      _id: s._id,
      type: "assessment",
      title: s.assessmentId?.title || "Assessment",
      role: s.assessmentId?.role,
      status: s.status,
      score: s.scoring?.finalScore,
      startedAt: s.startedAt,
      completedAt: s.completedAt
    }));

    // ✅ 2. PSYCHOMETRIC ASSIGNMENTS
    const psychometric = await Assign
      .find({
        employeeId,
        companyId: admin.companyId,
        type: "psychometric" // 🔥 important
      })
      .populate("linkId")
      .sort({ createdAt: -1 })
      .lean();
    
    const psychometricAssessments = psychometric.map((p) => {

      

      return {
        _id: p._id,
        type: "psychometric",
        title: "Psychometric Test",
        status: p.status,
        linkSlug: p.linkId?.slug,
        createdAt: p.createdAt,
        resultId: p.resultId || null   // 🔥 THIS FIXES YOUR ISSUE
      };
    });

    // ✅ 3. REGULAR ASSESSMENT ASSIGNMENTS (pending ones)
    const regularAssignments = await Assign
      .find({
        employeeId,
        companyId: admin.companyId,
        type: "assessment"
      })
      .populate("assessmentId")
      .sort({ createdAt: -1 })
      .lean();

    const pendingAssessments = regularAssignments.map((a) => ({
      _id: a._id,
      type: "assessment",
      title: a.assessmentId?.title || "Assessment",
      role: a.assessmentId?.role,
      status: a.status,
      createdAt: a.createdAt
    }));

    // ✅ MERGE ALL
    const assessments = [
      ...psychometricAssessments,
      ...normalAssessments,
      ...pendingAssessments
    ];

    res.json({
      ok: true,
      assessments
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
}