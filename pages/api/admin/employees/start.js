
import dbConnect from "../../../../lib/db";
import EmployeeAssessment from "../../../../models/EmployeeAssessment";
import Assign from "../../../../models/EmployeeAssessmentAssign";
import Session from "../../../../models/EmployeeAssessmentSession";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";
import mongoose from "mongoose";
/* ================= MAIN HANDLER ================= */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST")
    return res.status(405).json({ ok: false });

  const user = verifyTokenFromReq(req);
  if (!user)
    return res.status(401).json({ ok: false });

  const { slug } = req.body;

  /* FIND ASSESSMENT */
  const assessment = await EmployeeAssessment.findOne({
    slug,
    isActive: true,
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } }
    ]
  });

  if (!assessment)
    return res.json({ ok: false, message: "Assessment not found" });

  /* 2️⃣ VERIFY ASSIGNMENT */
  // const assignment = await Assign.findOne({
  //   employeeId: user.adminId,
  //   assessmentId: assessment._id,
  // });
  const { assignmentId } = req.body;

  if (!assignmentId || !mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ ok: false, message: "Invalid assignmentId" });
  }

  const assignment = await Assign.findById(assignmentId);

  if (!assignment) {
    return res.json({ ok: false, message: "Assignment not found" });
  }

  if (assignment.employeeId.toString() !== user.adminId.toString()) {
    return res.status(403).json({ ok: false, message: "Unauthorized" });
  }

  if (!assignment)
    return res.json({ ok: false, message: "Not assigned" });

  if (assignment.status === "completed")
    return res.json({ ok: false, message: "Already completed" });

 
  const existingSession = await Session.findOne({
  assignmentId: assignment._id,
  status: "in-progress",
});

  if (existingSession) {
    return res.json({
      ok: true,
      sessionId: existingSession._id,
      resume: true,
    });
  }

  /* 4️⃣ GENERATE QUESTIONS USING AI (WITH TAGGING) */
  const generated = await generateTechnicalQuestionsFromAI(assessment);

  /* 5️⃣ CREATE SESSION */
  const session = await Session.create({
    companyId: assessment.companyId,
    employeeId: user.adminId,
    assessmentId: assessment._id,
    assignmentId: assignment._id, // LINK SESSION TO ASSIGNMENT
    slug: assessment.slug,

    startedAt: new Date(),
    durationInSeconds: 1800,

    generatedQuestions: {
      technical: {
        mcq: [],//for unable mcq update with (generated.technicalMcq)
        written: generated.technicalWritten,
      },
    },

    status: "in-progress",
  });

  return res.json({ ok: true, sessionId: session._id });
}

/* ================= AI QUESTION GENERATOR ================= */

async function generateTechnicalQuestionsFromAI(assessment) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OpenAI API key");

  const prompt = `
You are an expert HR assessment designer tasked with creating competency-based employee evaluation assessments.

-----------------------------------------------------
ROLE
${assessment.role}

JOB DESCRIPTION
${assessment.jd}

KEY PERFORMANCE INDICATORS (KPIs)
${assessment.kpi.join("\n")}

KEY RESPONSIBILITY AREAS (KRAs)
${assessment.kra.join("\n")}
-----------------------------------------------------

ASSESSMENT OBJECTIVE
Evaluate the employee’s:
• Practical job knowledge
• Decision making
• Problem solving
• Execution of responsibilities
• Alignment with KPIs and KRAs

Assessment must simulate **real workplace scenarios**.

-----------------------------------------------------
ASSESSMENT STRUCTURE
Generate EXACTLY 15 Written Scenario Questions.

-----------------------------------------------------
COMPETENCY IDENTIFICATION
Identify 6–10 key competencies from the Job Description.
Examples:
- Technical: API Integration, System Design, Debugging
- Sales: Lead Qualification, Negotiation, Client Communication
- HR: Recruitment Strategy, Employee Relations, Performance Management

Use these competencies when tagging questions.

-----------------------------------------------------
QUESTION DESIGN PRINCIPLES
1. Reflect real job situations (no theory/memorization).
2. Test applied knowledge and reasoning.
3. Cover competencies evenly (max 2–3 repeats).
4. Each KPI and KRA must appear at least once.

-----------------------------------------------------
DIFFICULTY DISTRIBUTION
- 5 Easy
- 5 Medium
- 5 Hard

-----------------------------------------------------
QUESTION GUIDELINES
Written questions should test:
• Analytical thinking
• Workplace decision making
• Process explanation

Technical roles → debugging, architecture, code scenarios.
Non-technical roles → communication, workflow, strategy scenarios.

-----------------------------------------------------
QUESTION METADATA FORMAT
Each question MUST include:

{
  "prompt": "",
  "hint": "",
  "expectedAnswer": "",
  "competency": "",
  "kpiTag": "",
  "kraTag": "",
  "difficulty": "easy | medium | hard"
}

Rules:
• expectedAnswer REQUIRED (2–3 sentences, strong answer guidance)
• competency must derive from JD
• kpiTag must EXACTLY match provided KPIs
• kraTag must EXACTLY match provided KRAs

-----------------------------------------------------
QUALITY RULES
• No duplicates
• Clear, professional wording
• Balanced difficulty
• Accurate reflection of role responsibilities

-----------------------------------------------------
OUTPUT FORMAT
Return ONLY valid JSON:

{
  "technicalWritten": []
}
`;


  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: "Return only valid JSON. No markdown." },
          { role: "user", content: prompt },
        ],
      }),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    console.error("OpenAI error:", text);
    throw new Error("OpenAI request failed");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Invalid OpenAI JSON:", text);
    throw new Error("Invalid OpenAI JSON response");
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI did not return valid content");
  }

  // Safe JSON extraction
  const cleaned = extractJson(content);

  return JSON.parse(cleaned);
}

/* ================= SAFE JSON EXTRACT ================= */

function extractJson(str) {
  if (!str) return "";

  let s = str.trim();

  if (s.includes("```json")) {
    return s.split("```json")[1].split("```")[0].trim();
  }

  if (s.includes("```")) {
    return s.split("```")[1].split("```")[0].trim();
  }

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");

  return start !== -1 && end !== -1
    ? s.substring(start, end + 1)
    : s;
}