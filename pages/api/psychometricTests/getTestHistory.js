import connectDb from '../../../lib/db';
import PsychometricResponseNew from '../../../models/companyPsycometricResponce';
import mongoose from 'mongoose';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    
    const { userId, userEmail } = req.query;
    
    if (!userEmail && !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either userId or userEmail is required' 
      });
    }
    
    // Build query based on available parameters
    const query = {};
    
    // Only include userId in query if it's a valid ObjectId
    if (userId && mongoose.isValidObjectId(userId)) {
      query.userId = userId;
    }
    
    // Always include email in the query if available (our preferred identifier)
    if (userEmail) {
      query.userEmail = userEmail;
    }
    
    // If we don't have a valid query parameter, return empty results
    if (Object.keys(query).length === 0) {
      return res.status(200).json({
        success: true,
        history: []
      });
    }
    
    // Fetch test history sorted by most recent first
    const testHistory = await PsychometricResponseNew.find(query)
      .sort({ completedAt: -1 })
      .select({
        profileType: 1,
        'results.overallScore': 1,
        'results.strengths': 1,
        'results.personalityProfile': 1,
        // Student competencies
        'results.academicCollaboration': 1,
        'results.learningEthics': 1,
        'results.educationalLeadership': 1,
        'results.studyGroupDynamics': 1,
        'results.academicConflictResolution': 1,
        'results.classroomParticipation': 1,
        // Employee competencies
        'results.empathy': 1,
        'results.assertiveness': 1,
        'results.ethicalReasoning': 1,
        'results.collaboration': 1,
        'results.conflictResolution': 1,
        'results.leadershipPotential': 1,
        // Additional fields
        'results.analysis': 1,
        'results.recommendedLearningStyles': 1,
        'results.academicPathRecommendations': 1,
        'results.careerPathRecommendations': 1,
        'results.careerSuggestions': 1,
        'results.recommendedSkills': 1,
        'results.nextSteps': 1,
        'results.skillsDevelopmentAdvice': 1,
        'results.recommendedResources': 1,
        'results.industryFit': 1,
        'results.roleFitRecommendations': 1,
        completedAt: 1,
        createdAt: 1
      });
    
    return res.status(200).json({ 
      success: true, 
      history: testHistory
    });
    
  } catch (error) {
    console.error('Error fetching test history:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}

export default connectDb(handler);
