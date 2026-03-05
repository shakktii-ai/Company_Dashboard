
import dbConnect from "../../../../lib/db";
import Session from "../../../../models/EmployeeAssessmentSession";
import Assign from "../../../../models/EmployeeAssessmentAssign";
import EmployeeAssessment from "../../../../models/EmployeeAssessment";
import { verifyTokenFromReq } from "../../../../lib/verifyToken";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method !== "POST")
        return res.status(405).json({ ok: false });

    const user = verifyTokenFromReq(req);
    if (!user) return res.status(401).json({ ok: false });

    const { sessionId, answers = [], writtenAnswers = [] } = req.body;

    const session = await Session.findOne({
        _id: sessionId,
        employeeId: user.adminId,
    });

    if (!session)
        return res.json({ ok: false, message: "Session not found" });

    if (session.status === "completed")
        return res.json({ ok: false, message: "Already submitted" });

    const mcqQuestions =
        session.generatedQuestions?.technical?.mcq || [];

    const writtenQuestions =
        session.generatedQuestions?.technical?.written || [];

    /* ================================================= */
    /* ================= MCQ SCORING =================== */
    /* ================================================= */

    let correct = 0;
    const totalMcq = mcqQuestions.length;

    const competencyScores = {};
    const competencyCounts = {};

    const kpiScores = {};
    const kpiCounts = {};

    const kraScores = {};
    const kraCounts = {};

    const evaluatedMcqAnswers = [];

    if (totalMcq > 0) {
        for (let i = 0; i < totalMcq; i++) {
            const question = mcqQuestions[i];
            const comp = question.competency || "General";
            competencyCounts[comp] = (competencyCounts[comp] || 0) + 1;

            const kpi = question.kpiTag || "General KPI";
            kpiCounts[kpi] = (kpiCounts[kpi] || 0) + 1;

            const kra = question.kraTag || "General KRA";
            kraCounts[kra] = (kraCounts[kra] || 0) + 1;
            

            // const submitted = answers.find(
            //     (a) => a.questionIndex === i
            // );

            // const isCorrect =
            //     submitted &&
            //     question.correctOptionIndex ===
            //     submitted.selectedOptionIndex;

            // if (isCorrect) correct++;

            // evaluatedMcqAnswers.push({
            //     questionIndex: i,
            //     selectedOptionIndex: submitted
            //         ? submitted.selectedOptionIndex
            //         : null,
            //     isCorrect: !!isCorrect,
            // });

            // const comp = question.competency || "General";
            // competencyCounts[comp] =
            //     (competencyCounts[comp] || 0) + 1;

            // if (isCorrect)
            //     competencyScores[comp] =
            //         (competencyScores[comp] || 0) + 1;

            // const kpi = question.kpiTag || "General KPI";
            // kpiCounts[kpi] = (kpiCounts[kpi] || 0) + 1;

            // if (isCorrect)
            //     kpiScores[kpi] =
            //         (kpiScores[kpi] || 0) + 1;

            // const kra = question.kraTag || "General KRA";
            // kraCounts[kra] = (kraCounts[kra] || 0) + 1;

            // if (isCorrect)
            //     kraScores[kra] =
            //         (kraScores[kra] || 0) + 1;
        }
    }

    const mcqScore =
        totalMcq > 0
            ? Math.round((correct / totalMcq) * 100)
            : 0;

    /* ================================================= */
    /* ================= WRITTEN ======================= */
    /* ================================================= */

    const totalWritten = writtenQuestions.length;

    const evaluatedWritten = [];
    const writtenPayload = [];
const answerMap = new Map(
  writtenAnswers.map(a => [a.questionIndex, a])
);
    for (let i = 0; i < totalWritten; i++) {
        const question = writtenQuestions[i];

       const submitted = answerMap.get(i);

        const response = submitted ? submitted.response : "";

        evaluatedWritten.push({
            questionIndex: i,
            response,
            aiScore: 0,
        });

        writtenPayload.push({
            question: question.prompt,
            expectedAnswer: question.expectedAnswer || "",
            answer:
                response && response.trim().length >= 10
                    ? response
                    : "NO_VALID_ANSWER",
            competency: question.competency,
            kpi: question.kpiTag,
            kra: question.kraTag,
        });
    }

    /* ================================================= */
    /* ===== Convert competency raw counts to % ======== */
    /* ================================================= */

    Object.keys(competencyCounts).forEach((key) => {
        competencyScores[key] = Math.round(
            ((competencyScores[key] || 0) /
                competencyCounts[key]) *
            100
        );
    });

    Object.keys(kpiCounts).forEach((key) => {
        kpiScores[key] = Math.round(
            ((kpiScores[key] || 0) /
                kpiCounts[key]) *
            100
        );
    });

    Object.keys(kraCounts).forEach((key) => {
        kraScores[key] = Math.round(
            ((kraScores[key] || 0) /
                kraCounts[key]) *
            100
        );
    });

    const competencyScoresArray = Object.keys(
        competencyScores
    ).map((key) => ({
        competency: key,
        score: competencyScores[key],
    }));

    const kpiScoresArray = Object.keys(kpiScores).map(
        (key) => ({
            kpi: key,
            score: kpiScores[key],
        })
    );

    const kraScoresArray = Object.keys(kraScores).map(
        (key) => ({
            kra: key,
            score: kraScores[key],
        })
    );

    /* ================================================= */
    /* ================= WRITTEN AI ==================== */
    /* ================================================= */

    const assessment = await EmployeeAssessment.findById(
        session.assessmentId
    );

    const aiResult = await generateAIReport({
        assessment,
        mcqScore,
        competencyScores: competencyScoresArray,
        kpiScores: kpiScoresArray,
        kraScores: kraScoresArray,
        writtenAnswers: writtenPayload,
    });
   if (aiResult) {
   fetchRecommendedVideos(session._id, assessment, aiResult);
}
    
    /* ===== CALCULATE WRITTEN SCORE FROM DIMENSIONS ===== */

    let writtenScore = 0;

    if (aiResult && aiResult.dimensionScores) {
        const scores = aiResult.dimensionScores.map(
            (d) => d.score || 0
        );

        const total = scores.reduce((a, b) => a + b, 0);

        writtenScore = Math.round(total / scores.length);
    }

    /* ================================================= */
    /* ================= FINAL SCORE =================== */
    /* ================================================= */

    const mcqWeight =
        session.scoring?.weightage?.mcqWeight || 60;

    const writtenWeight =
        session.scoring?.weightage?.writtenWeight || 40;

    let finalScore;

    if (totalMcq === 0) {
        finalScore = writtenScore;
    } else {
        finalScore = Math.round(
            mcqScore * (mcqWeight / 100) +
            writtenScore * (writtenWeight / 100)
        );
    }

    /* ================================================= */
    /* ================= KPI ALIGNMENT ================= */
    /* ================================================= */

    let alignment = "Needs Improvement";

    if (finalScore >= 75) alignment = "Strong";
    else if (finalScore >= 50) alignment = "Average";

    /* ================================================= */
    /* ================= UPDATE SESSION ================ */
    /* ================================================= */

    session.mcqAnswers = evaluatedMcqAnswers;
    session.writtenAnswers = evaluatedWritten;

    session.scoring = {
        mcqScore,
        writtenScore,
        finalScore,
        weightage: {
            mcqWeight,
            writtenWeight,
        },
    };

    session.competencyScores = competencyScoresArray;
    session.kpiScores = kpiScoresArray;
    session.kraScores = kraScoresArray;

    session.dimensionScores = aiResult?.dimensionScores || [];
  
    session.kpiAlignment = alignment;

    session.aiReport = {
        overallSummary: aiResult?.overallSummary,
        kpiAnalysis: aiResult?.kpiAnalysis,
        kraAnalysis: aiResult?.kraAnalysis,
        strengths: aiResult?.strengths,
        improvementAreas: aiResult?.improvementAreas,
        recommendedActions:
            aiResult?.recommendedActions,
    };

    session.status = "completed";
    session.completedAt = new Date();

    if (session.startedAt) {
        session.durationInSeconds = Math.floor(
            (new Date() - session.startedAt) / 1000
        );
    }

    await session.save();

    await Assign.findOneAndUpdate(
        {
            employeeId: user.adminId,
            assessmentId: session.assessmentId,
        },
        { status: "completed" }
    );

    res.json({
        ok: true,
        finalScore,
        alignment,
    });

}

/* ===================================================== */
/* ================= AI REPORT ENGINE ================== */
/* ===================================================== */

async function generateAIReport({
    assessment,
    mcqScore,
    competencyScores,
    kpiScores,
    kraScores,
    writtenAnswers,
}) {
    const key = process.env.OPENAI_API_KEY;

    if (!key) return null;

    const prompt = `
You are a professional HR evaluator.

Role: ${assessment.role}

MCQ Score: ${mcqScore}

Competency Scores:
${JSON.stringify(competencyScores)}

KPI Scores:
${JSON.stringify(kpiScores)}

KRA Scores:
${JSON.stringify(kraScores)}

WRITTEN ANSWER EVALUATION

Each item contains:

question
expectedAnswer
answer (employee response)

You MUST compare the employee answer with the expectedAnswer.

Scoring rules:

0-2 → incorrect or irrelevant
3-4 → partially correct
5-6 → somewhat correct but incomplete
7-8 → good answer covering most concepts
9-10 → excellent answer matching expectedAnswer clearly

Written Answers:
${JSON.stringify(writtenAnswers)}

Evaluate the employee capability across:

Problem Solving
Analytical Thinking
Communication Clarity
Domain Knowledge
Decision Making
Professional Judgment

Return ONLY JSON:

{
"dimensionScores":[
{"dimension":"Problem Solving","score":0-10,"feedback":""},
{"dimension":"Analytical Thinking","score":0-10,"feedback":""},
{"dimension":"Communication Clarity","score":0-10,"feedback":""},
{"dimension":"Domain Knowledge","score":0-10,"feedback":""},
{"dimension":"Decision Making","score":0-10,"feedback":""},
{"dimension":"Professional Judgment","score":0-10,"feedback":""}
],

"overallSummary":"",

"kpiAnalysis":[
{"kpi":"","scoreImpact":"Strong|Moderate|Weak","feedback":""}
],

"kraAnalysis":[
{"kra":"","performanceLevel":"Strong|Moderate|Weak","feedback":""}
],

"strengths":[],
"improvementAreas":[],
"recommendedActions":[]
}
`;

    try {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + key,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    temperature: 0.3,
                    messages: [
                        { role: "system", content: "Return JSON only" },
                        { role: "user", content: prompt },
                    ],
                }),
            }
        );

        const data = await response.json();
        console.log('data', data);
        const raw =
            data?.choices?.[0]?.message?.content || "";

        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        console.log(cleaned);
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("AI report error:", err);
        return null;
    }
}
async function fetchRecommendedVideos(sessionId, assessment, aiResult) {

  try {

    const reportText = `
Role: ${assessment.role}

Weak Skills:
${JSON.stringify(aiResult?.improvementAreas || [])}

Dimension Scores:
${JSON.stringify(aiResult?.dimensionScores || [])}
`;

    const videoResponse = await fetch(
      "https://youtube-recommender-x79p.onrender.com/api/recommendations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report: reportText,
          role: assessment.role,
          max_videos: 6
        })
      }
    );

    const videoData = await videoResponse.json();

    let recommendedVideos = videoData?.recommendations || [];

    /* ===== Ensure role-based videos exist ===== */

    if (recommendedVideos.length < 3) {

      const roleVideos = [
        {
          skill: assessment.role,
          videos: [
            {
              title: `${assessment.role} Full Tutorial`,
              url: "https://www.youtube.com/results?search_query=" + assessment.role
            }
          ]
        }
      ];

      recommendedVideos = [...recommendedVideos, ...roleVideos];
    }

    await Session.findByIdAndUpdate(sessionId, {
      recommendedVideos
    });

  } catch (err) {
    console.error("Video recommendation error:", err);
  }
}