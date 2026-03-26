import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export default function PsychometricTest() {

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [reasonings, setReasonings] = useState([]);
  const [results, setResults] = useState(null);
  const [token, setToken] = useState('');
  const [profileType, setProfileType] = useState(null); // 'student' or 'employee'
  const [showCardSelection, setShowCardSelection] = useState(true); // Show card selection by default
  const { slug, linkId,assignmentId } = router.query;
  // Check for token and user email on component mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/admin/employees/me", {
          credentials: "include"
        });

        const data = await res.json();

        if (!data.ok) {
          router.replace("/admin/login");
          return;
        }

        setUser(data.user);

      } catch (err) {
        router.replace("/admin/login");
      }
    }

    loadUser();
  }, []);
  const generateTest = async (type) => {
    const { slug } = router.query;
    const userId = user._id;
    const emailToUse = user.email;

    // try {
    //   const userJson = localStorage.getItem("user");

    //   if (userJson) {
    //     const user = JSON.parse(userJson);
    //     userId = user._id;
    //     emailToUse = user.email;
    //   }
    // } catch (err) {
    //   console.error("User parse error", err);
    // }



    let testGenerated = false;

    console.log('Starting test for:', emailToUse);

    setGenerating(true);
    setLoading(true);
    setShowCardSelection(false);

    // Reset state
    setResults(null);
    setTest(null);
    setCurrentQuestionIndex(0);

    const loadingToast = toast.info(
      'Generating psychometric questions. Please wait...',
      { autoClose: false }
    );

    try {
      const response = await axios.post(
        '/api/psychometricTests/generatePsychometricTest',
        {
          profileType: type,
          userEmail: emailToUse,
          userId,
          slug,
        },
        { timeout: 150000 }
      );

      testGenerated = true;

      if (response.data?.questions?.length > 0) {
        const testData = {
          _id: response.data.testId || Date.now().toString(),
          profileType: type,
          questions: response.data.questions,
        };

        setTest(testData);

        setSelectedOptions(new Array(testData.questions.length).fill(null));
        setReasonings(new Array(testData.questions.length).fill(''));

        toast.update(loadingToast, {
          render: `Loaded ${testData.questions.length} questions`,
          type: 'success',
          autoClose: 3000,
        });
      } else {
        throw new Error('No questions received');
      }
    } catch (error) {
      console.error(error);

      toast.update(loadingToast, {
        render:
          error.response?.data?.error || 'Failed to generate test. Try again.',
        type: 'error',
        autoClose: 3000,
      });

      setShowCardSelection(true);
    } finally {
      setLoading(false);
      setGenerating(false);

      if (!testGenerated) {
        toast.dismiss(loadingToast);
      }
    }
  };
  const handleCardSelection = (type) => {
    if (!user) {
      toast.error("User not loaded yet. Please wait.");
      return;
    }
    setProfileType(type);
    generateTest(type);
  };

  const handleOptionSelect = (optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleReasoningChange = (e) => {
    const newReasonings = [...reasonings];
    newReasonings[currentQuestionIndex] = e.target.value;
    setReasonings(newReasonings);
  };

  const goToNextQuestion = () => {
    if (selectedOptions[currentQuestionIndex] === null) {
      toast.warning('Please select an option before continuing');
      return;
    }

    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if all questions are answered before submitting
      confirmSubmitTest();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Check if all questions are answered before submitting
  const confirmSubmitTest = () => {
    const unansweredQuestions = selectedOptions.map((option, index) =>
      option === null ? index + 1 : null
    ).filter(Boolean);

    if (unansweredQuestions.length > 0) {
      const questionList = unansweredQuestions.join(', ');
      const isPlural = unansweredQuestions.length > 1;
      toast.warning(`Question${isPlural ? 's' : ''} ${questionList} ${isPlural ? 'are' : 'is'} not answered. Please complete all questions before submitting.`);
    } else {
      if (confirm('Are you sure you want to submit your test? You cannot change your answers after submission.')) {
        submitTest();
      }
    }
  };

  const submitTest = async () => {
    try {
      setEvaluating(true);
      const { slug, linkId ,assignmentId} = router.query;
      // Prepare responses data
      const responses = selectedOptions.map((optionIndex, questionIndex) => ({
        questionIndex,
        selectedOption: optionIndex,
        reasoning: reasonings[questionIndex]
      }));

      // Get user info from localStorage
      let userId = user._id;
      let userEmail = user.email;

      // try {
      //   // const userJson = localStorage.getItem('user');
      //   if (userJson) {
      //     // const userData = JSON.parse(userJson);
      //     userId = userData._id;
      //     userEmail = userData.email;
      //     console.log('Using user email for evaluation:', userEmail);
      //   }
      // } catch (error) {
      //   console.error('Error getting user info:', error);
      // }

      if (!userId || !userEmail) {
        toast.error("User session expired. Please login again.");
        router.push("/login");
        return;
      }
      if (!linkId || !assignmentId) {
        toast.error("Invalid test link. Please restart.");
        return;
      }
      if (!slug) {
        toast.error("Invalid test");
        return;
      }
      // Instead of sending the test ID, send the complete questions array
      // This avoids the ObjectId casting error
      console.log("Submitting with assignmentId:", assignmentId);
      const response = await axios.post('/api/psychometricTests/evaluatePsychometricTest', {
        questions: test.questions,
        responses,
        userId,
        slug,
        profileType: profileType || 'employee',
        email: userEmail,
        testId: test._id, // Include the testId if it exists
        linkId,
        assignmentId
      });

      // Store the complete response data including profileType
      setResults(response.data);
      console.log('Evaluation results:', response.data);

      // Save results to database
      // try {
      //   const saveResponse = await axios.post('/api/psychometricTests/saveTestResults', {
      //     userId,
      //     userEmail,
      //     profileType: profileType,
      //     responses: responses,
      //     results: response.data,
      //     questions: test.questions,
      //     slug
      //   });

      //   if (saveResponse.data.success) {
      //     console.log('Test results saved to database:', saveResponse.data);
      //     toast.success('Test results saved successfully');
      //   } else {
      //     console.error('Error saving test results:', saveResponse.data);
      //     toast.warning('Test completed, but results could not be saved');
      //   }
      // } catch (saveError) {
      //   console.error('Error saving test results:', saveError);
      //   toast.warning('Test completed, but there was an issue saving your results');
      // }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Error evaluating test: ' + (error.response?.data?.message || error.message));
    } finally {
      setEvaluating(false);
    }
  };

  const renderStarRating = (score) => {
    return (
      <div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <svg
            key={i}
            className={`w-6 h-6 ${i < score ? 'text-yellow-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading user...</p>
      </div>
    );
  }
  // Card selection screen
  if (showCardSelection) {
    return (
      <>
        <div className="bg-black min-h-screen px-4 py-10">
          <button
            onClick={() => router.back('/dashboard')}
            className="absolute top-4 left-4 text-white bg-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-700 transition"
          >
            ← Back
          </button>
          <div className="absolute top-4 right-4">
            {/* <button
            onClick={() => router.push('/psychometricTestHistory')}
            className="text-white bg-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-700 transition"
          >
            History →
          </button> */}
          </div>
          <h1 className="text-3xl font-bold text-white text-center mt-4 mb-10">
            Psychometric Test
          </h1>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-10 lg:gap-32">
            {/* Employee Test Card */}
            <div className="bg-white w-[300px] md:w-[600px] max-w-md rounded-2xl p-5">
              <h2 className="text-2xl font-bold text-center mb-4">Employee Test</h2>

              <div className="bg-[#D2E9FA] p-5 -ml-5 rounded-r-full shadow-[inset_0_5px_10px_0_rgba(0,0,0,0.2)]">
                <div className="bg-[#69676720] mx-auto w-36 h-36 rounded-full shadow-[inset_10px_7px_7px_rgba(0,0,0,0.25),inset_6px_6px_10px_rgba(255,255,255,0.6)]">
                  <img src="/mock.png" alt="Employee Test" className="w-full h-full object-contain" />
                </div>
              </div>

              <p className="text-left my-4 text-sm">
                Tailored for working professionals. Evaluates
                workplace competencies, conflict resolution,
                leadership potential, and professional decision-
                making.
              </p>

              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Workplace dynamics</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Professional ethics</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Management potential</p>
                </div>
              </div>

              <button
                onClick={() => handleCardSelection('employee')}
                className="bg-gradient-to-r from-black to-gray-400 text-white mt-5 w-full py-2 rounded-full"
              >
                Take Test
              </button>
            </div>

          </div>
        </div>

      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Psychometric Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">
            {generating ? 'Generating your psychometric test...' : 'Loading...'}
          </p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Evaluating Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Evaluating your responses...</p>
          <p className="mt-2 text-gray-600">This may take a minute. We're analyzing your decision-making style.</p>
        </div>
        <ToastContainer />
      </div>
    );
  }
  // if (results) {
  //   const evaluation = results.evaluation || {};
  //   const engineScores = evaluation.engine_scores || {};

  //   // Convert engine scores to UI format
  //   const competencyAreas = Object.entries(engineScores).map(([engine, data]) => ({
  //     name: `Engine ${engine}`,
  //     score: Math.round((data.score / 100) * 3),
  //     rawScore: data.score,
  //     risk: data.risk_level,
  //     comments: data.observed_tendencies,
  //     impact: data.possible_workplace_impact
  //   }));

  //   return (
  //     <div className="min-h-screen bg-gray-100 py-12 px-4">
  //       <Head>
  //         <title>Psychometric Test Results</title>
  //       </Head>

  //       <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">

  //         {/* Header */}
  //         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
  //           <h1 className="text-2xl font-bold text-white">
  //             Psychometric Assessment Results
  //           </h1>
  //         </div>

  //         <div className="p-6">

  //           {/* Overall Risk Score */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">Overall Risk Score</h2>

  //             <div className="bg-gray-50 p-4 rounded-lg">

  //               <div className="flex justify-between mb-3">
  //                 <span className="font-medium">Risk Score</span>
  //                 <span className="font-bold">
  //                   {evaluation.overall_risk_score || 0}/100
  //                 </span>
  //               </div>

  //               <div className="w-full bg-gray-200 rounded-full h-3">
  //                 <div
  //                   className="bg-blue-600 h-3 rounded-full"
  //                   style={{
  //                     width: `${evaluation.overall_risk_score || 0}%`
  //                   }}
  //                 />
  //               </div>

  //               <p className="mt-3 text-gray-700">
  //                 {evaluation.behavioural_stability_category ||
  //                   "Behaviour profile analysis unavailable"}
  //               </p>
  //             </div>
  //           </div>

  //           {/* Engine Scores */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">
  //               Behavioural Engine Analysis
  //             </h2>

  //             <div className="grid md:grid-cols-2 gap-4">
  //               {competencyAreas.map((area, index) => (
  //                 <div key={index} className="border rounded-lg p-4 shadow-sm">

  //                   <div className="flex justify-between mb-2">
  //                     <h3 className="font-semibold">{area.name}</h3>

  //                     <span
  //                       className={`px-2 py-1 text-xs rounded-full ${area.risk === "High Risk"
  //                         ? "bg-red-100 text-red-700"
  //                         : area.risk === "Moderate Risk"
  //                           ? "bg-yellow-100 text-yellow-700"
  //                           : "bg-green-100 text-green-700"
  //                         }`}
  //                     >
  //                       {area.risk}
  //                     </span>
  //                   </div>

  //                   <div className="mb-2">
  //                     <div className="text-sm text-gray-500">
  //                       Score: {area.rawScore}/100
  //                     </div>

  //                     <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
  //                       <div
  //                         className="bg-blue-600 h-2 rounded-full"
  //                         style={{ width: `${area.rawScore}%` }}
  //                       />
  //                     </div>
  //                   </div>

  //                   <p className="text-sm text-gray-700 mt-3">
  //                     {area.comments}
  //                   </p>

  //                   <p className="text-xs text-gray-500 mt-2">
  //                     Impact: {area.impact}
  //                   </p>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>

  //           {/* Key Strengths */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">Key Strengths</h2>

  //             <div className="bg-green-50 p-4 rounded-lg">
  //               <ul className="list-disc pl-5 space-y-2">
  //                 {(evaluation.key_strengths || []).map((item, index) => (
  //                   <li key={index}>{item}</li>
  //                 ))}
  //               </ul>
  //             </div>
  //           </div>

  //           {/* Risk Signals */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">
  //               Potential Risk Signals
  //             </h2>

  //             <div className="bg-red-50 p-4 rounded-lg">
  //               <ul className="list-disc pl-5 space-y-2">
  //                 {(evaluation.potential_risk_signals || []).map((item, index) => (
  //                   <li key={index}>{item}</li>
  //                 ))}
  //               </ul>
  //             </div>
  //           </div>

  //           {/* Supervisor Guidance */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">
  //               Supervisor Guidance
  //             </h2>

  //             <div className="bg-yellow-50 p-4 rounded-lg">
  //               <ul className="list-disc pl-5 space-y-2">
  //                 {(Array.isArray(evaluation.supervisor_guidance)
  //                   ? evaluation.supervisor_guidance
  //                   : [evaluation.supervisor_guidance]
  //                 ).map((item, index) => (
  //                   <li key={index}>{item}</li>
  //                 ))}
  //               </ul>
  //             </div>
  //           </div>

  //           {/* Training */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">
  //               Recommended Training
  //             </h2>

  //             <div className="bg-blue-50 p-4 rounded-lg">
  //               <ul className="list-disc pl-5 space-y-2">
  //                 {(evaluation.recommended_training || []).map((item, index) => (
  //                   <li key={index}>{item}</li>
  //                 ))}
  //               </ul>
  //             </div>
  //           </div>

  //           {/* Suitable Roles */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">
  //               Suitable Roles
  //             </h2>

  //             <div className="flex flex-wrap gap-2">
  //               {(evaluation.suitable_roles || []).map((role, index) => (
  //                 <span
  //                   key={index}
  //                   className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
  //                 >
  //                   {role}
  //                 </span>
  //               ))}
  //             </div>
  //           </div>

  //           {/* Risk Situations */}
  //           <div className="mb-8">
  //             <h2 className="text-xl font-semibold mb-4">
  //               Possible Risk Situations
  //             </h2>

  //             <div className="bg-red-50 p-4 rounded-lg">
  //               <ul className="list-disc pl-5 space-y-2">
  //                 {(evaluation.possible_risk_situations || []).map(
  //                   (item, index) => (
  //                     <li key={index}>{item}</li>
  //                   )
  //                 )}
  //               </ul>
  //             </div>
  //           </div>

  //           {/* Buttons */}
  //           <div className="flex justify-center gap-4 flex-wrap">

  //             {/* <button
  //               onClick={() => router.push("/psychometricTestHistory")}
  //               className="px-6 py-2 bg-purple-600 text-white rounded-lg"
  //             >
  //               View History
  //             </button> */}

  //             <button
  //               onClick={() => setShowCardSelection(true)}
  //               className="px-6 py-2 bg-blue-600 text-white rounded-lg"
  //             >
  //               Take New Test
  //             </button>

  //           </div>

  //         </div>
  //       </div>

  //       <ToastContainer />
  //     </div>
  //   );
  // }
if (results) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 text-center">

        {/* ✅ Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* ✅ Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Test Submitted Successfully
        </h1>

        {/* ✅ Subtext */}
        <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
          Thank you for completing the psychometric assessment.
          <br />
          Your responses have been recorded.
        </p>

        {/* ✅ Divider */}
        <div className="border-t my-6"></div>

        {/* ✅ Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">

          <button
            onClick={() => router.push("/admin/employeeDashboard")}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
          >
            Back to Dashboard
          </button>
{/* 
          <button
            onClick={() => setShowCardSelection(true)}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition"
          >
            Take Another Test
          </button> */}

        </div>

      </div>
    </div>
  );
}  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Psychometric Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <p className="text-xl text-red-600">Failed to load test. Please try again.</p>
          <button
            onClick={() => checkExistingTest(token)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  // Helper function to check if a question is answered
  const isQuestionAnswered = (index) => {
    return selectedOptions[index] !== null;
  };

  // Count answered questions
  const answeredCount = selectedOptions.filter(option => option !== null).length;
  const totalQuestions = test.questions.length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Psychometric Test | SHAKKTII AI</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Psychometric Assessment</h1>
                <p className="text-blue-100">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </p>
              </div>
              <div className="text-white text-right">
                <div className="text-xl font-bold">{answeredCount}/{totalQuestions}</div>
                <div className="text-sm text-blue-100">Questions Answered</div>
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {/* Question Navigation */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="mb-2 flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">Question Navigation:</div>
              <div className="text-sm text-gray-500">{answeredCount}/{totalQuestions} answered</div>
            </div>

            {/* Group questions into sets of 10 for better organization */}
            {Array.from({ length: Math.ceil(test.questions.length / 10) }).map((_, group) => (
              <div key={group} className="flex flex-wrap gap-2 mb-2 justify-center">
                {test.questions
                  .slice(group * 10, (group + 1) * 10)
                  .map((_, idx) => {
                    const questionIndex = group * 10 + idx;
                    return (
                      <button
                        key={questionIndex}
                        onClick={() => goToQuestion(questionIndex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                          ${currentQuestionIndex === questionIndex
                            ? 'bg-blue-600 text-white'
                            : isQuestionAnswered(questionIndex)
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-2"
                style={{
                  backgroundColor: currentQuestion.difficulty === 'Easy' ? '#e0f2fe' :
                    currentQuestion.difficulty === 'Moderate' ? '#fef3c7' :
                      '#fee2e2',
                  color: currentQuestion.difficulty === 'Easy' ? '#0369a1' :
                    currentQuestion.difficulty === 'Moderate' ? '#92400e' :
                      '#b91c1c'
                }}
              >
                {currentQuestion.difficulty} Difficulty
              </div>
              <h2 className="text-xl font-medium text-gray-800">{currentQuestion.scenario}</h2>
            </div>

            <div className="space-y-4 mb-6">
              {Object.entries(currentQuestion.options).map(([key, option], index) => (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedOptions[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 mt-0.5 border rounded-full flex items-center justify-center ${selectedOptions[currentQuestionIndex] === index
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                      }`}>
                      {selectedOptions[currentQuestionIndex] === index && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-base ${selectedOptions[currentQuestionIndex] === index
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-700'
                        }`}>
                        {option}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700 mb-1">
                Optional: Why did you choose this response? (Your reasoning)
              </label>
              <textarea
                id="reasoning"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain your thought process..."
                value={reasonings[currentQuestionIndex] || ''}
                onChange={handleReasoningChange}
              ></textarea>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentQuestionIndex === test.questions.length - 1 && (
                  <button
                    onClick={() => confirmSubmitTest()}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Submit Test ({answeredCount}/{totalQuestions})
                  </button>
                )}

                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentQuestionIndex < test.questions.length - 1 ? 'Next' : 'Review & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}