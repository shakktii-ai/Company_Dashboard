export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

import connectDb from "../../../lib/db";
import mongoose from "mongoose";
import PsychometricTestNew from "../../../models/companyPsycometric";
import CompanyPsychometricLink from "../../../models/CompanyPsychometricLink";
function transformQuestionsForSchema(questions) {
  return questions.map((q, index) => {
    // Debug each question
    console.log(`Question ${index} options:`, JSON.stringify(q.options, null, 2));
    console.log(`Question ${index} keys:`, Object.keys(q));

    // Ensure options are in {A, B, C, D} format
    let transformedOptions = {
      A: "",
      B: "",
      C: "",
      D: ""
    };

    if (q.options && typeof q.options === 'object') {
      // If options is already {A, B, C, D} format
      if (q.options.A !== undefined || q.options.B !== undefined || q.options.C !== undefined || q.options.D !== undefined) {
        transformedOptions = {
          A: q.options.A || "",
          B: q.options.B || "",
          C: q.options.C || "",
          D: q.options.D || ""
        };
        console.log(`Question ${index} using object format`);
      }
      // If options is an array of objects with text/value
      else if (Array.isArray(q.options)) {
        transformedOptions = {
          A: q.options[0]?.text || q.options[0] || "",
          B: q.options[1]?.text || q.options[1] || "",
          C: q.options[2]?.text || q.options[2] || "",
          D: q.options[3]?.text || q.options[3] || ""
        };
        console.log(`Question ${index} using array format`);
      }
      else {
        console.log(`Question ${index} options format not recognized:`, typeof q.options);
      }
    } else {
      // Fallback to individual option fields
      transformedOptions = {
        A: q.optionA || q.A || "",
        B: q.optionB || q.B || "",
        C: q.optionC || q.C || "",
        D: q.optionD || q.D || ""
      };
      console.log(`Question ${index} using fallback format`);
    }

    console.log(`Question ${index} transformed options:`, JSON.stringify(transformedOptions, null, 2));

    return {
      ...q,
      options: transformedOptions,
      // Ensure difficulty is set and valid
      difficulty: q.difficulty || "Moderate",
      // Ensure required fields are present
      id: q.id || index + 1,
      scenario: q.scenario || ""
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  
  await connectDb();

const { userId, userEmail, slug } = req.body;

let email = userEmail || req.body.email;
let userIdToUse = userId;
const link = await CompanyPsychometricLink.findOne({ slug });

if (!link || !link.isActive) {
  return res.status(400).json({
    error: "Invalid or inactive link"
  });
}

// ✅ attempt limit
// const existingAttempt = await PsychometricTestNew.countDocuments({
//   userEmail: email,
//   slug
// });

// if (existingAttempt >= 1) {
//   return res.status(400).json({
//     error: "You already attempted this test"
//   });
// }
  try {


    console.log(`Generating behavioural SJT test`);

    const questions = await getPsychometricQuestions();

    // Debug: Log the first question to understand structure
    if (questions && questions.length > 0) {
      console.log('First question from GPT:', JSON.stringify(questions[0], null, 2));
    }

    if (questions && Array.isArray(questions) && questions.length > 0) {

      const validatedQuestions = questions.map((question, index) => {

        if (!question.scenario || typeof question.scenario !== 'string') {
          question.scenario = 'कामाच्या वेळी अशी परिस्थिती आली तर तुम्ही काय कराल?';
        }

        if (!question.options) {
          question.options = {
            A: "पहिला पर्याय",
            B: "दुसरा पर्याय",
            C: "तिसरा पर्याय",
            D: "चौथा पर्याय"
          };
        }

        return {
          id: question.id || index + 1,
          engine: question.engine || "",
          sub_parameter: question.sub_parameter || "",
          scenario: question.scenario,
          options: question.options,
          hidden_measure: question.hidden_measure || ""
        };
      });

     

      if (!email) {
        email = `guest_${Date.now()}@example.com`;
        console.log('Using generated email:', email);
      }

      // Transform questions to match the schema
      const transformedQuestions = transformQuestionsForSchema(validatedQuestions);

      const testData = {
        slug,
        questions: transformedQuestions,
        startTime: new Date(),
        completed: false,
        isCompleted: false,
        userEmail: email
      };

      if (userIdToUse && /^[0-9a-fA-F]{24}$/.test(userIdToUse)) {
        testData.userId = userIdToUse;
      }

      try {

        const newTest = new PsychometricTestNew(testData);
        const savedTest = await newTest.save();

        console.log(`Saved test ID: ${savedTest._id}`);

        return res.status(200).json({
          success: true,
          testId: savedTest._id,
          questions: validatedQuestions
        });

      } catch (error) {

        console.error('Error saving test:', error);

        // if this fails, keep the flow alive but provide a fallback testId so submission can still work
        const fallbackTestId = newTest._id || new mongoose.Types.ObjectId();

        return res.status(200).json({
          success: true,
          warning: 'Test could not be saved to database',
          testId: fallbackTestId,
          questions: validatedQuestions
        });

      }

    } else {
      console.error('Failed to generate valid questions');
      return res.status(500).json({ error: 'Failed to generate valid questions' });
    }

  } catch (error) {
    console.error('Error during processing:', error);
    return res.status(500).json({ error: `Error during processing: ${error.message}` });
  }
}


async function getPsychometricQuestions() {

  const url = 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OpenAI API key missing');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const payload = {
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 4500,
    messages: [
      {
        role: "system",
        content:
          "You are an industrial behavioural assessment designer. Generate subtle situational judgement questions for Indian shop-floor workers. Follow instructions exactly. Return valid JSON only."
      },
      {
        role: "user",
        content: `
Generate exactly 25 high-quality Situational Judgement Questions (SJQs) in Marathi for Indian shop-floor workers using the ShakktiiAI Behavioural & Temperamental DNA Framework.

GOAL
Create realistic factory floor situations where the behavioural trait is tested indirectly through the situation.

The scenario must describe a moment happening in a factory and naturally lead the worker to decide what they would do.

SCENARIO DESIGN RULES
- Each scenario must contain exactly 2–3 short sentences
- The behaviour must be embedded in the situation, NOT asked directly
- The scenario must end naturally with the feeling of: "तुम्ही काय कराल?"
- Use simple conversational Marathi commonly spoken in Maharashtra factories
- Avoid formal, academic, or psychological language

IMPORTANT BEHAVIOURAL DESIGN
The scenario should present a small workplace moment where the worker must react.

The behaviour being measured must be hidden inside the situation.

Example principle:
Do NOT ask about honesty.
Instead create a situation where someone suggests a shortcut or hiding a mistake.

SUB_PARAMETER RULES
- sub_parameter represents the behavioural dimension being tested
- It must be inferred from the scenario, not mentioned inside it
- Keep it short (1–3 Marathi words)

Example
sub_parameter: नियम पालन

Scenario should NOT say "नियम पाळणे".
Instead it should show a situation where following rules vs taking shortcut becomes a choice.

REAL FACTORY CONTEXTS
Use realistic shop-floor situations such as:

shift handover confusion  
machine suddenly stopping  
dispatch deadline pressure  
tea break discussion  
supervisor changing instructions  
overtime request  
new worker asking help  
tool missing from workstation  
production target pressure  
quality inspection issue  
senior operator suggesting shortcut  
argument between coworkers  
material shortage  
WhatsApp rumor about company  
female engineer inspection

OPTION RULES
Each question must contain exactly 4 options (A,B,C,D).

All options must:
- sound like realistic worker reactions
- be believable
- avoid extreme or moralising answers
- avoid obviously correct answers
- represent different behavioural tendencies

ENGINE DISTRIBUTION

A Authority & Hierarchy → 3  
B Integrity vs Jugaad → 4  
C Social Identity / Bhaichara → 4  
D Gossip & Instigation → 4  
E Work Discipline → 3  
F Learning & Change → 3  
G Stress & Temperament → 4  

QUESTION STRUCTURE

Each question must contain:

id  
engine  
sub_parameter  
scenario  
options {A,B,C,D}  
hidden_measure  

LIMITS

scenario ≤ 60 words  
each option ≤ 18 words  
hidden_measure ≤ 5 words  

OUTPUT RULES

Return VALID JSON only.

NO markdown  
NO explanation  
NO extra text  

Required format:

{
 "questions":[
  {
   "id":1,
   "engine":"A",
   "sub_parameter":"",
   "scenario":"",
   "options":{
     "A":"",
     "B":"",
     "C":"",
     "D":""
   },
   "hidden_measure":""
  }
 ]
}
`
      }
    ]
  };

  try {

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return null;
    }

    if (data?.choices?.[0]?.message?.content) {

      const rawContent = data.choices[0].message.content;

      console.log("OpenAI response received");

      // Remove markdown ```json ``` if present
      const cleanedContent = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {

        const parsed = JSON.parse(cleanedContent);

        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions;
        }

        console.error("Questions array not found");
        return null;

      } catch (jsonError) {

        console.error("JSON parse error:", jsonError);
        console.error("Cleaned response:", cleanedContent);

        return null;

      }

    } else {

      console.error('Unexpected OpenAI response', data);
      return null;

    }

  } catch (error) {

    console.error('OpenAI API call error:', error);
    return null;

  }
}