import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { VoteData } from '@/types';
ChartJS.register(ArcElement, Tooltip, Legend);

interface IPieChartComponent {
  voteData: VoteData[];
  votingType: string;
  credentialFilter: string;
  optionColors?: Record<string, string>;
}

export const ChartColors = [
  '#FF7373',
  '#FFB987',
  '#FFDC7D',
  '#FBFF8B',
  '#C8FFA3',
  '#88FF88',
  '#76F6FF',
  '#79D0FF',
  '#85AAFF',
  '#8985FF',
  '#CC85FF',
  '#FF85FB',
];

const PieChartComponent: React.FC<IPieChartComponent> = ({
  voteData,
  votingType: _votingType,
  credentialFilter,
  optionColors = {},
}) => {
  const filteredData = useMemo(() => {
    if (!Array.isArray(voteData)) {
      return [];
    }

    return credentialFilter === 'All'
      ? voteData
      : voteData.filter((data) => data.credential === credentialFilter);
  }, [voteData, credentialFilter]);

  const { hasVoteData, chartData, chartOptions } = useMemo(() => {
    const dataLabels = filteredData.map(
      (data) => data.description || 'No description'
    );
    const dataVotes = filteredData.map((data) => data.votes);

    const colors = filteredData.map((data) => {
      if (optionColors[data.id]) {
        return optionColors[data.id];
      }
      const index = filteredData.findIndex((item) => item.id === data.id);
      return ChartColors[index % ChartColors.length];
    });

    const hasData = dataVotes.length > 0 && dataVotes.some((vote) => vote > 0);

    const data = {
      labels: dataLabels,
      datasets: [
        {
          data: dataVotes,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
        },
      ],
    };

    const options: ChartOptions<'pie'> = {
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    return {
      hasVoteData: hasData,
      chartData: data,
      chartOptions: options,
    };
  }, [filteredData, optionColors]);

  if (!Array.isArray(voteData)) {
    return <div>No data available</div>;
  }

  return (
    <div className="w-[200px] h-[200px] m-auto">
      {hasVoteData ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <div className="w-full h-full bg-black/10 rounded-full flex justify-center items-center">
          <span className="text-black/20">No Vote</span>
        </div>
      )}
    </div>
  );
};

export default PieChartComponent;
