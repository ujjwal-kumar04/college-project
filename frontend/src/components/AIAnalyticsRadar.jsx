import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    ResponsiveContainer,
} from 'recharts';

const AIAnalyticsRadar = ({ analysis }) => {
  const data = [
    { metric: 'Communication', score: analysis.communication_score },
    { metric: 'Relevance', score: analysis.relevance_score },
    { metric: 'Technical', score: analysis.technical_depth },
    { metric: 'Behavioral', score: analysis.behavioral_fit },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIAnalyticsRadar;