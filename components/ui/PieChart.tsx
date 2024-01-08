import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from 'react-chartjs-2';

import { Option } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IPieChartComponent {
  votes: Option[],
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
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
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
