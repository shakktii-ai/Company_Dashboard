import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function CompetencyRadar({ competencies }) {

  const data = competencies
    .slice(0, 8) // limit to 8 skills
    .map(c => ({
      skill: c.competency,
      score: c.score
    }));

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <h3 className="text-lg font-semibold mb-4">
        Competency Skill Analysis
      </h3>

      <div className="h-[320px]">

        <ResponsiveContainer width="100%" height="100%">

          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            data={data}
          >

            <PolarGrid stroke="#E5E7EB" />

            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 12 }}
            />

            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
            />

            <Radar
              name="Score"
              dataKey="score"
              stroke="#4F46E5"
              fill="#6366F1"
              fillOpacity={0.45}
            />

            <Tooltip
              formatter={(value) => `${value}%`}
            />

          </RadarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );
}