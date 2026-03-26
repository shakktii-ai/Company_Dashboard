import connectDb from '../../../lib/db'
import PsychometricTestNew from '../../../models/companyPsycometric'
import PsychometricResponseNew from '../../../models/companyPsycometricResponce'
import mongoose from 'mongoose'

async function handler(req,res){

 if(req.method !== "POST"){
  return res.status(405).json({success:false,message:"Method not allowed"})
 }

 try{

  const {
   userId,
   userEmail,
   profileType,
   responses,
   results,
   questions,slug
  } = req.body

  // Debug: Log what we're receiving
  console.log('saveTestResults received:', {
    hasResults: !!results,
    resultsKeys: results ? Object.keys(results) : [],
    resultsSample: results ? JSON.stringify(results, null, 2).substring(0, 500) + '...' : 'null'
  });

  if(!userEmail){
   return res.status(400).json({
    success:false,
    message:"User email required"
   })
  }

  const isValidObjectId = userId && mongoose.isValidObjectId(userId)

  /* -----------------------------
      SAVE TEST SESSION
  -----------------------------*/

  const testData = {
   userEmail,
   profileType,
   questions,
   slug,

   responses: responses.map((r,i)=>({
     questionIndex:i,
     selectedOption:r.selectedOption,
     reasoning:r.reasoning || ""
   })),

   completed:true,
   isCompleted:true,
   completedAt:new Date()
  }

  if(isValidObjectId){
   testData.userId = userId
  }

  const test = await PsychometricTestNew.create(testData)

  /* -----------------------------
      SAVE AI EVALUATION RESULT
  -----------------------------*/

  // Extract the actual evaluation data from the nested structure
  const evaluation = results && results.evaluation ? results.evaluation : {};
  
  console.log('Extracted evaluation keys:', Object.keys(evaluation));

  const responseData = {

   userEmail,
   testId:test._id,
   profileType,

   responses: responses.map((r,i)=>({
     questionIndex:i,
     selectedOption:r.selectedOption,
     reasoning:r.reasoning || ""
   })),

   results:{

    engine_scores: evaluation.engine_scores || {},

    overall_risk_score:
      evaluation.overall_risk_score || 0,

    behavioural_stability_category:
      evaluation.behavioural_stability_category || "",

    key_strengths:
      evaluation.key_strengths || [],

    potential_risk_signals:
      evaluation.potential_risk_signals || [],

    supervisor_guidance:
      evaluation.supervisor_guidance || "",

    recommended_training:
      evaluation.recommended_training || [],

    suitable_roles:
      evaluation.suitable_roles || [],

    possible_risk_situations:
      evaluation.possible_risk_situations || []

   },

   completedAt:new Date()
  }

  if(isValidObjectId){
   responseData.userId = userId
  }

  const testResponse =
   await PsychometricResponseNew.create(responseData)

  console.log('Saved responseData.results:', JSON.stringify(responseData.results, null, 2).substring(0, 1000) + '...');

  return res.status(200).json({
   success:true,
   testId:test._id,
   responseId:testResponse._id,
   message:"Test results saved successfully"
  })

 }
 catch(error){

  console.error("saveTestResults error:",error)

  return res.status(500).json({
   success:false,
   message:"Server error",
   error:error.message
  })
 }
}

export default async function(req, res) {
  await connectDb();
  return handler(req, res);
}