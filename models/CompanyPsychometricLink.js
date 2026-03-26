import mongoose from "mongoose";
import { nanoid } from "nanoid";

const CompanyPsychometricLinkSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
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
  },
  { timestamps: true }
);


const CompanyPsychometricLink =
  mongoose.models.CompanyPsychometricLink ||
  mongoose.model("CompanyPsychometricLink", CompanyPsychometricLinkSchema);

export default CompanyPsychometricLink;