import dbConnect from "../../../lib/db";
import mongoose from "mongoose";
import PsychometricResponse from "../../../models/companyPsycometricResponce";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { id } = req.query;

    // 🔥 Validate ID
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing result ID"
      });
    }

    // 🔥 Fetch result
    const result = await PsychometricResponse.findById(id).lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Api Result not found"
      });
    }

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error("getResultById error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
}