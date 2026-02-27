import dbConnect from "../../../../lib/db";
import Assign from "../../../../models/EmployeeAssessmentAssign";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req, res) {
  await dbConnect();

  const user = verifyTokenFromReq(req);
console.log("user:",user);
  if (!user) {
    return res.status(401).json({ ok: false });
  }

  try {
    const list = await Assign.find({
        
      employeeId: user.adminId,
      companyId: user.companyId,
      
    })
   
      .populate("assessmentId")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      list,
    });
    

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      error: "Server error",
    });
  }
}