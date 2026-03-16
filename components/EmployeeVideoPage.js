import { useState,useEffect } from "react";
export default function Video() {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {

    try {

      const res = await fetch("/api/admin/employees/reports");
      const data = await res.json();

      if (data.ok) {
        setReports(data.reports);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  }

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading videos...
      </div>
    );

  return (

    <div className="space-y-6">

      {reports.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-gray-500">
          No videos available yet.
        </div>
      )}

      {reports.map((r) => (

        <div
          key={r.sessionId}
          className="bg-white rounded-xl shadow p-6"
        >

          {/* HEADER */}

          <div className="mb-4">

            <h3 className="font-semibold text-lg">
              {r.role}
            </h3>

            <p className="text-sm text-gray-500">
              Completed: {new Date(r.completedAt).toLocaleDateString()}
            </p>

          </div>


          {/* VIDEOS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            {(r.recommendedVideos || []).map((group, gi) =>

              group.videos.map((v, vi) => (

                <VideoCard
                  key={`${gi}-${vi}`}
                  title={v.title}
                  url={v.url}
                />

              ))

            )}

          </div>

        </div>

      ))}

    </div>

  );

}
function VideoCard({ title, url }) {

  const videoId = url.includes("watch?v=")
    ? url.split("watch?v=")[1]
    : null;

  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (

    <div className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition">

      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-40 object-cover"
        />
      )}

      <div className="p-3">

        <p className="text-sm font-medium line-clamp-2">
          {title}
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          Watch Video →
        </a>

      </div>

    </div>

  );

}