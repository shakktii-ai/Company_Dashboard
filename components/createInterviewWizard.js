import React, { useState } from 'react';
import { FiCheck, FiCopy, FiArrowRight, FiPlus, FiList, FiCheckCircle } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

export default function CreateInterviewWizard({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    jobRole: '',
    jd: '',
    qualification: '',
    criteria: '',
    location: '',
    questions: {
      totalQuestions: 60,
      aptitude: 30,
      technical: 30,
    },
  });

  const validateStep1 = () => {
    let errs = {};
    if (!form.jobRole.trim()) errs.jobRole = 'Role title is required';
    if (!form.jd.trim()) errs.jd = 'Description is required';
    if (!form.qualification.trim()) errs.qualification = 'Qualification is required';
    if (!form.criteria.trim()) errs.criteria = 'Criteria is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Add any other required fields for the API
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.ok) {
        setGeneratedLink(`${window.location.origin}/interview/${data.job.slug}/apply`);
        setStep(3);
        if (onSuccess) onSuccess();
      } else {
        alert(data.message || 'Error creating interview');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating interview');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Create Interview</h2>
          <p className="text-sm text-gray-500 mt-1">Set up a new interview role and generate a shareable link</p>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                {step > 1 ? <FiCheck /> : '1'}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>Interview Details</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                {step > 2 ? <FiCheck /> : '2'}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>Review & Generate</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                {step === 3 ? <FiCheck /> : '3'}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 3 ? 'text-blue-600' : 'text-gray-400'}`}>Share Link</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Role Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Frontend Developer"
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.jobRole ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all`}
                    value={form.jobRole}
                    onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
                  />
                  {errors.jobRole && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.jobRole}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Description *</label>
                  <textarea
                    rows={4}
                    placeholder="e.g., Good in HTML, CSS, React"
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.jd ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all resize-none`}
                    value={form.jd}
                    onChange={(e) => setForm({ ...form, jd: e.target.value })}
                  />
                  {errors.jd && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.jd}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Qualification *</label>
                  <input
                    type="text"
                    placeholder="e.g., BSc, MCA / BCA"
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.qualification ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all`}
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Criteria *</label>
                  <input
                    type="text"
                    placeholder="e.g., 60% or 6 months - 1 year experience"
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.criteria ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all`}
                    value={form.criteria}
                    onChange={(e) => setForm({ ...form, criteria: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Location *</label>
                  <input
                    type="text"
                    placeholder="e.g., Pune"
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.location ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all`}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
              >
                Continue to Review <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 font-sans">Review Interview Details</h3>

                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Role Title</p>
                    <p className="text-sm font-bold text-gray-800">{form.jobRole}</p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Qualification</p>
                    <p className="text-sm font-bold text-gray-800">{form.qualification}</p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Criteria</p>
                    <p className="text-sm font-bold text-gray-800">{form.criteria}</p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-bold text-gray-800">{form.location}</p>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-sm font-bold text-gray-800 line-clamp-3">{form.jd || "No description provided"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? (
                    'Generating...'
                  ) : (
                    <>
                      <HiSparkles className="text-lg group-hover:rotate-12 transition-transform" />
                      Generate Interview Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner border border-emerald-200/50">
                  <FiCheck />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Interview Created Successfully!</h3>
                <p className="text-gray-500 text-sm">Your interview for <span className="text-emerald-600 font-bold">{form.jobRole}</span> is now live</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interview Application Link</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={generatedLink}
                    className="flex-1 px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-600 font-mono outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-6 py-3 ${copied ? 'bg-emerald-500' : 'bg-blue-600'} text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 min-w-[140px] justify-center shadow-${copied ? 'emerald' : 'blue'}-100`}
                  >
                    {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Link</>}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Share this link with candidates to allow them to apply for this position</p>
              </div>

              <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-6">
                <h4 className="font-bold text-blue-900 mb-4 text-sm tracking-tight flex items-center gap-2">
                  Next Steps:
                </h4>
                <ul className="space-y-3">
                  {[
                    "Share the interview link with candidates via email or job portals",
                    "Monitor applicants from the Interviews page",
                    "Review AI-generated reports in the Candidate Reports section"
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-blue-800">
                      <span className="font-bold opacity-50">{idx + 1}.</span>
                      <span className="font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setForm({
                      jobRole: '',
                      jd: '',
                      qualification: '',
                      criteria: '',
                      location: '',
                      questions: { totalQuestions: 60, aptitude: 30, technical: 30 },
                    });
                  }}
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                  Create Another Interview
                </button>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
                >
                  <FiList /> View All Interviews
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}