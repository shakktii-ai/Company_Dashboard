import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function HODReviewForm() {
    const router = useRouter();
    const { token } = router.query;

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hodName, setHodName] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [responses, setResponses] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchReview();
    }, [token]);

    async function fetchReview() {
        try {
            const res = await fetch(`/api/admin/hod/submit-review?token=${token}`);
            const data = await res.json();
            if (data.ok) {
                setReview(data.review);
                setResponses(data.review.responses);
                if (data.review.isSubmitted) setSubmitted(true);
            } else {
                toast.error(data.error || "Invalid link");
            }
        } catch (err) {
            toast.error("Error loading form");
        } finally {
            setLoading(false);
        }
    }

    const handleResponseChange = (index, value) => {
        const updated = [...responses];
        updated[index].answer = value;
        setResponses(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hodName) return toast.error("Please enter your name");
        if (!departmentName) return toast.error("Please enter your department name");

        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/hod/submit-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    hodName,
                    departmentName,
                    responses,
                }),
            });
            const data = await res.json();
            if (data.ok) {
                setSubmitted(true);
                toast.success("Review submitted successfully!");
            } else {
                toast.error(data.error || "Submission failed");
            }
        } catch (err) {
            toast.error("Error submitting review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-gray-600">Your company culture review has been submitted successfully.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster />
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 py-8 px-6 text-white">
                    <h1 className="text-3xl font-bold">HOD Company Culture Review</h1>
                    <p className="mt-2 text-indigo-100">Please provide your valuable feedback to help us understand and improve our work culture.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={hodName}
                                    onChange={(e) => setHodName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Department Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Engineering, HR, Marketing"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    value={departmentName}
                                    onChange={(e) => setDepartmentName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {responses.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <p className="text-gray-900 font-medium mb-3">{idx + 1}. {item.question}</p>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
                                    rows={3}
                                    required
                                    placeholder="Your answer..."
                                    value={item.answer}
                                    onChange={(e) => handleResponseChange(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition transform hover:scale-[1.01] disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
}
