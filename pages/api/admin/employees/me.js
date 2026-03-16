import dbConnect from "../../../../lib/db";
import Admin from '../../../../models/admin';
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req,res){

  await dbConnect();

  const user = verifyTokenFromReq(req);

  if(!user) return res.status(401).json({ok:false});

  const employee = await Admin.findById(user.adminId).lean();

  res.json({
    ok:true,
    user:{
      name: employee.name,
      role: employee.role
    }
  });

}