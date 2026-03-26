import connectDb from "../../../lib/db";
import PsychometricTestNew from "../../../models/companyPsycometric";
import PsychometricResponseNew from "../../../models/companyPsycometricResponce";
import User from "../../../models/admin";
 import Assign from "../../../models/EmployeeAssessmentAssign";
import mongoose from "mongoose";

export const config = {
  runtime: "nodejs",
  maxDuration: 300,
  api: {
    responseLimit: "10mb",
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

async function evaluateWithGPT(test, responses) {

  const formattedResponses = responses.map(r => {
    const question = test.questions[r.questionIndex];
    if (!question) {
      console.error(`Question at index ${r.questionIndex} not found`);
      return null;
    }
    const optionKeys = ["A", "B", "C", "D"];
    const selectedOption = question.options?.[optionKeys[r.selectedOption]] || '';
    
    return {
      engine: question.engine || 'Unknown',
      hidden_measure: question.hidden_measure || 'Unknown',
      scenario: question.scenario || 'Unknown',
      selected_option: selectedOption,
      reasoning: r.reasoning || ""
    };
  }).filter(r => r !== null);

  const prompt = `
Evaluate a worker's responses to a behavioural situational judgement test based on the ShakktiiAI Behavioural & Temperamental DNA Framework.

Goal:
Analyze response patterns and infer behavioural tendencies across seven behavioural engines.

Engines:
A Authority & Hierarchy
B Integrity vs Jugaad
C Social Identity / Bhaichara
D Gossip & Instigation
E Work Discipline
F Learning & Change
G Stress & Temperament

Worker responses:
${JSON.stringify(formattedResponses, null, 2)}

Evaluation rules:
- Do not judge behaviour from a single answer
- Look for patterns across questions
- Interpret decisions in context of shop-floor situations
- Identify behavioural tendencies, not personality traits

Scoring logic:
Each engine must produce a score between 0 and 100.

Risk scale:
0-30 = Low Risk
31-55 = Moderate Risk
56-75 = High Risk
76-100 = Critical Risk

Also determine overall behavioural stability category:
Stable Operator
Adaptive Worker
Situational Risk
High Behavioural Risk

Return JSON in this structure:

{
 "engine_scores":{
   "A":{
     "score":0,
     "risk_level":"",
     "observed_tendencies":"",
     "possible_workplace_impact":""
   }
 },
 "overall_risk_score":0,
 "behavioural_stability_category":"",
 "key_strengths":[],
 "potential_risk_signals":[],
 "supervisor_guidance":"",
 "recommended_training":[],
 "suitable_roles":[],
 "possible_risk_situations":[]
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an industrial behavioural risk analyst evaluating situational judgement test responses from Indian shop-floor workers. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

 const result = await response.json();

// 🔍 Debug full response
console.log("GPT FULL RESPONSE:", JSON.stringify(result, null, 2));

// ❌ If OpenAI fails
if (!result.choices || !result.choices[0]) {
  console.error("Invalid GPT response:", result);
  throw new Error("Invalid GPT response");
}

const content = result.choices[0].message.content;

let parsed;

try {
  parsed = JSON.parse(content);
} catch (err) {
  console.error("❌ JSON PARSE ERROR");
  console.error("RAW CONTENT:", content);
  throw new Error("GPT JSON parsing failed");
}

return parsed;
}

function transformQuestionsForSchema(questions) {
  return questions.map(q => {
    // Ensure options are in {A, B, C, D} format
    let transformedOptions = {
      A: "",
      B: "",
      C: "",
      D: ""
    };
    
    if (q.options && typeof q.options === 'object') {
      // If options is already {A, B, C, D} format
      if (q.options.A || q.options.B || q.options.C || q.options.D) {
        transformedOptions = {
          A: q.options.A || "",
          B: q.options.B || "",
          C: q.options.C || "",
          D: q.options.D || ""
        };
      }
      // If options is an array of objects with text/value
      else if (Array.isArray(q.options)) {
        transformedOptions = {
          A: q.options[0]?.text || q.options[0] || "",
          B: q.options[1]?.text || q.options[1] || "",
          C: q.options[2]?.text || q.options[2] || "",
          D: q.options[3]?.text || q.options[3] || ""
        };
      }
    } else {
      // Fallback to individual option fields
      transformedOptions = {
        A: q.optionA || q.A || "",
        B: q.optionB || q.B || "",
        C: q.optionC || q.C || "",
        D: q.optionD || q.D || ""
      };
    }

    return {
      ...q,
      options: transformedOptions,
      // Ensure difficulty is set and valid
      difficulty: q.difficulty || "Moderate",
      // Ensure required fields are present
      id: q.id || Math.random().toString(36).substr(2, 9),
      scenario: q.scenario || ""
    };
  });
}

async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ success:false,error:"Method not allowed"});
  }

  await connectDb();

  try {

    const { userId, testId, responses, questions,linkId ,assignmentId} = req.body;
    let { email } = req.body;

    if (!responses || !questions) {
      return res.status(400).json({
        success:false,
        error:"Responses and questions required"
      });
    }

    const test = { questions };

    console.log("Starting behavioural evaluation...");

    const evaluation = await evaluateWithGPT(test, responses);

    console.log("Evaluation complete");

    let userIdToUse = userId;

    if (!userIdToUse && email) {
      const user = await User.findOne({ email });
      if (user) userIdToUse = user._id;
    }

    // Only use userId if it's a valid ObjectId (not a guest ID)
    const isValidObjectId = userIdToUse && mongoose.Types.ObjectId.isValid(userIdToUse);
    if (!isValidObjectId) {
      userIdToUse = null;
    }

    if (!email) {
  return res.status(401).json({
    success: false,
    error: "User email missing"
  });
}

    let testRecord;
    const testIdIsValid = testId && mongoose.Types.ObjectId.isValid(testId);

    if (testIdIsValid) {
      testRecord = await PsychometricTestNew.findById(testId);
      console.log(`Looking for existing test record by testId ${testId}:`, testRecord ? 'found' : 'not found');
    } else if (testId) {
      console.warn(`Invalid testId passed to evaluate endpoint: ${testId}`);
    }

    if (testRecord) {
      // ✅ UPDATE EXISTING TEST
      testRecord.responses = responses;
      testRecord.results = evaluation;
      testRecord.completed = true;
      testRecord.isCompleted = true;
      testRecord.completedAt = new Date();

      await testRecord.save();
    } else {
      // fallback (rare case)
      const transformedQuestions = transformQuestionsForSchema(questions);

      testRecord = await PsychometricTestNew.create({
        slug: req.body.slug || 'unknown',
        profileType: req.body.profileType || 'employee',
        questions: transformedQuestions,
        responses,
        results: evaluation,
        completed: true,
        isCompleted: true,
        completedAt: new Date(),
        userEmail: email,
         userId: userIdToUse  
      });
}
    const responseRecord = await PsychometricResponseNew.create({
      testId:testRecord._id,
      userEmail:email,
      responses,
      results:evaluation,
      completedAt:new Date(),
      userId:userIdToUse,
      linkId:linkId,
      assignmentId: assignmentId
    });
   
console.log("Updating assignment:", {
  userIdToUse,
  linkId,
});


if (!assignmentId) {
  console.error("Missing assignmentId");
  return res.status(400).json({
    success: false,
    error: "assignmentId required"
  });
}

const updated = await Assign.findOneAndUpdate(
  {
    _id: assignmentId,
    status: { $ne: "completed" } // prevent double update
  },
  {
    status: "completed",
    completedAt: new Date(),
     resultId: responseRecord._id
  }
);

console.log("Assignment update result:", updated);
// const updated=await Assign.findOneAndUpdate(
//   {
//     employeeId: userIdToUse,
//     linkId: new mongoose.Types.ObjectId(linkId),
//     type: "psychometric"
//   },
//   {
//     status: "completed",
//     completedAt: new Date()
//   }
// );
console.log("Assignment update result:", updated);
    return res.status(200).json({
      success:true,
      testId:testRecord._id,
      responseId:responseRecord._id,
      evaluation
    });

  } catch(error) {

    console.error("Psychometric evaluation error:", error);

    return res.status(500).json({
      success:false,
      error: error.message || "Evaluation failed",
      details: error.stack ? error.stack.split('\n').slice(0, 5) : undefined
    });
  }
}

export default handler;