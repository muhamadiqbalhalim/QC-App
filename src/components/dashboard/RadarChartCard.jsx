import { memo, useMemo, useEffect, useState } from "react";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

function RadarChartCard({ skills = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    const defaultSkills = [
      "QUALITY",
      "SPC",
      "GD&T",
      "CALIBRATION",
      "INSPECTION",
    ];

    if (Object.keys(skills).length > 0) {
      return Object.entries(skills)
        .slice(0, 8)
        .map(([key, value]) => ({
          subject: String(key).replaceAll("_", " ").toUpperCase(),
          value: Number(value) || 0,
        }));
    }

    return defaultSkills.map((skill) => ({
      subject: skill,
      value: 0,
    }));
  }, [skills]);

  const competencyLevel = useMemo(() => {
    if (!chartData.length) {
      return "No Data";
    }

    const average =
      chartData.reduce((total, item) => total + item.value, 0) /
      chartData.length;

    if (average >= 85) {
      return "Expert";
    }

    if (average >= 70) {
      return "Competent";
    }

    if (average >= 50) {
      return "Developing";
    }

    return "Beginner";
  }, [chartData]);

  const averageScore = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }

    return Math.round(
      chartData.reduce((total, item) => total + item.value, 0) /
        chartData.length,
    );
  }, [chartData]);

  const colors = {
    grid: "#CBD5E1",

    text: "#64748B",

    radarStroke: "#F59E0B",

    radarFill: "#F59E0B",
  };

  return (
    <div className="w-full min-w-0">
      {/* HEADER */}
      <div className="mb-8">
        <div
          className="
            flex
            items-center
            justify-between
            flex-wrap
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-amber-500
                font-black
                mb-3
              "
            >
              Skill Matrix
            </p>

            <h2
              className="
                text-2xl
                font-black
                mb-2
              "
            >
              Personnel Competency Radar
            </h2>

            <p
              className="
                text-sm
                opacity-60
                leading-6
                max-w-md
              "
            >
              Live competency mapping across operational quality, inspection
              standards, manufacturing compliance.
            </p>
          </div>

          <div
            className="
              text-right
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-wide
                opacity-50
                font-bold
              "
            >
              Competency Level
            </p>

            <h3
              className="
                text-xl
                font-black
                text-amber-500
              "
            >
              {competencyLevel}
            </h3>

            <p
              className="
                text-sm
                opacity-60
              "
            >
              Avg Score: {averageScore}%
            </p>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div
        className="
            w-full
            h-[320px]
            min-w-0
          "
      >
        {mounted && (
          <ResponsiveContainer width="99%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke={colors.grid} />

              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: colors.text,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />

              <PolarRadiusAxis
                domain={[0, 100]}
                stroke={colors.grid}
                tick={{
                  fill: colors.text,
                  fontSize: 10,
                }}
              />

              <Radar
                dataKey="value"
                stroke={colors.radarStroke}
                fill={colors.radarFill}
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default memo(RadarChartCard);
