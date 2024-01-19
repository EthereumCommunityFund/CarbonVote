import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from 'react-chartjs-2';

import { PollOptionType } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IPieChartComponent {
  votes: PollOptionType[],
}

const PieChartComponent: React.FC<IPieChartComponent> = ({ votes }) => {
  // Data for the pie chart
  const labels: string[] = votes.map((vote) => vote.option_description)
  const weight: number[] = votes.map((vote) => vote.votes);
  const data = {
    labels: labels,
    datasets: [
      {
        data: weight,
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  return (
    <div>
      <Pie
        data={data}
      />
    </div>
  );
};

export default PieChartComponent;
