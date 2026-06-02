import React, {
  memo,
  useMemo,
} from 'react';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

function RadarChartCard({
  skills = {},
}) {
  /**
   * Dynamic chart data
   */
  const chartData = useMemo(() => {
    if (
      Object.keys(skills).length > 0
    ) {
      return Object.entries(skills).map(
        ([key, value]) => ({
          subject: key.toUpperCase(),
          value:
            typeof value === 'number'
              ? value
              : 0,
        })
      );
    }

    return [
      {
        subject: 'CALIBRATION',
        value: 0,
      },
      {
        subject: 'GD&T',
        value: 0,
      },
      {
        subject: 'QUALITY',
        value: 0,
      },
      {
        subject: 'SPC',
        value: 0,
      },
      {
        subject: 'ULTRASONIC',
        value: 0,
      },
    ];
  }, [skills]);

  const colors = {

    grid: '#CBD5E1',

    text: '#64748B',

    radarStroke: '#F59E0B',

    radarFill: '#F59E0B',
  };

  return (
    <div className="w-full min-w-0">

      {/* HEADER */}
      <div className="mb-8">

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
          Live competency mapping
          across operational quality,
          inspection standards, and
          manufacturing compliance.
        </p>
      </div>

      {/* CHART */}
      <div
        className="
          w-full
          h-[380px]
          min-w-0
          flex
          items-center
          justify-center
        "
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="82%"
            data={chartData}
          >
            <PolarGrid
              stroke={colors.grid}
            />

            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: colors.text,
                fontSize: 11,
                fontWeight: 700,
                fontFamily:
                  'Inter, sans-serif',
              }}
            />

            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{
                fill: colors.text,
                fontSize: 10,
              }}
              stroke={colors.grid}
            />

            <Radar
              dataKey="value"
              stroke={
                colors.radarStroke
              }
              fill={colors.radarFill}
              fillOpacity={0.25}
              strokeWidth={2.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(
  RadarChartCard
);