// pages/api/admin/signup.js

import dbConnect from "../../../lib/db";
import Company from "../../../models/company";
import CompanyOnboarding from "../../../models/CompanyOnboarding";
import Admin from "../../../models/admin";
import HODReview from "../../../models/HODReview";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signToken, setTokenCookie } from "../../../lib/auth";

const HOD_QUESTIONS = [
  "How would you define the core values that drive your department's decisions?",
  "How effectively is the company's long-term vision communicated to your team?",
  "What is the biggest cultural challenge your department faces currently?",
  "How would you describe the level of cross-departmental collaboration at this company?",
  "How does your department handle conflict or differing opinions among team members?",
  "What specific behaviors are most rewarded or recognized in your department?",
  "How frequently do you and your team engage in professional development or learning?",
  "How would you rate the transparency of top-level management's communication?",
  "In what ways does the company culture support or hinder innovation in your area?",
  "How is work-life balance practiced and encouraged within your department?",
  "What is the primary method used for giving and receiving feedback in your team?",
  "How diverse and inclusive is the environment within your specific department?",
  "How aligned are your department's goals with the overall company strategy?",
  "What is one thing about the company culture you would change to improve efficiency?",
  "How do you ensure that new hires in your department align with the existing culture?",
];

export default async function handler(req, res) {
  try {
    await dbConnect();
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Database connection failed" });
  }

  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const {
      // Account info
      companyName,
      name,
      email,
      password,
      // Company basic info
      industry,
      website,
      companyType,
      location,
      employeeSize,
      // Work culture
      hierarchyLevel,
      communicationStyle,
      feedbackCulture,
      // Clients & pressure
      targetMarket,
      sampleClients,
      workPressure,
      departments,
    } = req.body;

    // ✔ Validate required fields
    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Missing required account fields" });
    }

    if (!industry || !companyType || !location) {
      return res.status(400).json({ ok: false, error: "Missing required company fields" });
    }

    if (!hierarchyLevel || !communicationStyle || !feedbackCulture) {
      return res.status(400).json({ ok: false, error: "Missing required culture fields" });
    }

    if (!targetMarket || !workPressure) {
      return res.status(400).json({ ok: false, error: "Missing required client fields" });
    }

    // ✔ Normalize fields
    const companyNameClean = companyName.trim().toLowerCase();
    const lcEmail = email.trim().toLowerCase();

    // ✔ Basic email format validation
    if (!/^\S+@\S+\.\S+$/.test(lcEmail)) {
      return res.status(400).json({ ok: false, error: "Invalid email format" });
    }

    // ✔ Password validation
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
    }

    // ✔ Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: lcEmail });
    if (existingAdmin) {
      return res.status(400).json({ ok: false, error: "Admin with this email already exists" });
    }

    // ✔ Check if company exists
    const existingCompany = await Company.findOne({ name: companyNameClean });

    let company;

    if (existingCompany) {
      // Update existing company
      company = await Company.findByIdAndUpdate(
        existingCompany._id,
        {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new company
      company = await Company.create({
        name: companyNameClean,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      });
    }

    // ✔ Create CompanyOnboarding document
    await CompanyOnboarding.findOneAndUpdate(
      { companyId: company._id },
      {
        companyId: company._id,
        companyName,
        industry,
        website,
        companyType,
        location,
        employeeSize,
        hierarchyLevel,
        communicationStyle,
        feedbackCulture,
        targetMarket,
        sampleClients: sampleClients
          ? sampleClients.split(",").map((c) => c.trim())
          : [],
        workPressure,
        departments,
        isCompleted: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    // ✅ Create employees if provided
    if (req.body.employees && Array.isArray(req.body.employees) && req.body.employees.length > 0) {
      for (const emp of req.body.employees) {
        // Validate required fields
        if (!emp.name || !emp.email || !emp.role || !emp.password) {
          continue; // Skip invalid entries
        }

        // Check if employee already exists
        const existingEmployee = await Admin.findOne({ email: emp.email.toLowerCase() });
        if (existingEmployee) {
          continue; // Skip if email already registered
        }

        // Hash password using bcryptjs (same as signin)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(emp.password, salt);

        // Create new employee/admin
        await Admin.create({
          name: emp.name,
          email: emp.email.toLowerCase(),
          passwordHash: passwordHash,
          companyId: company._id,
          role: emp.role.toLowerCase(), // hr, hod, leader
        });
      }
    }

    // ✔ Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ✔ Create admin under company
    const admin = await Admin.create({
      name,
      email: lcEmail,
      passwordHash,
      companyId: company._id,
    });

    // ✅ Generate 4 HOD Review Links (each with shuffled questions)
    const hodLinks = [];

    function shuffleArray(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    for (let i = 0; i < 4; i++) {
      const hToken = crypto.randomBytes(16).toString("hex");
      const shuffledQA = shuffleArray(HOD_QUESTIONS).map((q) => ({ question: q, answer: "" }));
      await HODReview.create({
        companyId: company._id,
        token: hToken,
        responses: shuffledQA,
      });
      hodLinks.push(hToken);
    }

    return res.status(201).json({
      ok: true,
      message: "Signup and onboarding successful.",
      admin: { id: admin._id, email: admin.email, name: admin.name },
      company: { id: company._id, name: company.name },
      hodLinks,
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ ok: false, error: "Signup failed" });
  }
}